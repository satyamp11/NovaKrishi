import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { Dispute } from '../models/Dispute.js';

export const recalculateReliabilityScore = async (userId: string | mongoose.Types.ObjectId): Promise<void> => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // 1. Fetch Orders
    const orders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }]
    });
    
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.orderStatus === 'DELIVERED').length;

    // 2. Fetch Reviews
    const reviews = await Review.find({ revieweeId: userId });
    let avgRating = 0;
    if (reviews.length > 0) {
      const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
      avgRating = totalStars / reviews.length;
    }

    // 3. Fetch Disputes
    const disputes = await Dispute.find({ raisedAgainst: userId });
    const disputesRaisedAgainst = disputes.length;
    const disputesResolved = disputes.filter(d => d.status === 'resolved' || d.status === 'rejected').length;
    const openDisputes = disputesRaisedAgainst - disputesResolved;

    // 4. Calculate Average Payment Delay Days (for buyers)
    let avgPaymentDelayDays = 0;
    const buyerOrders = orders.filter(o => o.buyerId.toString() === userId.toString());
    
    if (buyerOrders.length > 0) {
      let totalDelayDays = 0;
      let ordersWithPayment = 0;
      
      buyerOrders.forEach(order => {
        // Find when the payment was successfully held or paid
        const paymentSuccess = order.paymentHistory?.find(
          ph => ph.state === 'HELD_FOR_ORDER' || ph.state === 'PAID'
        );
        
        if (paymentSuccess && paymentSuccess.timestamp && order.createdAt) {
          const diffTime = Math.abs(new Date(paymentSuccess.timestamp).getTime() - new Date(order.createdAt).getTime());
          const diffDays = diffTime / (1000 * 60 * 60 * 24);
          totalDelayDays += diffDays;
          ordersWithPayment++;
        }
      });
      
      if (ordersWithPayment > 0) {
        avgPaymentDelayDays = totalDelayDays / ordersWithPayment;
      }
    }

    // 5. Compute the Weighted Score
    let score = 70; // Base score

    if (reviews.length > 0) {
      if (avgRating >= 3) {
        score += (avgRating - 3) * 5; // Up to +10 for 5-star
      } else {
        score -= (3 - avgRating) * 10; // Penalty for low rating
      }
    }

    score -= (openDisputes * 15);
    score -= (disputesResolved * 5); // Still a small penalty for having a past dispute

    // Payment delay penalty
    if (avgPaymentDelayDays > 2) {
      score -= (Math.floor(avgPaymentDelayDays - 2) * 2);
    }

    // Cap between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));

    // 6. Assign Badge
    let badge: 'trusted' | 'good' | 'new' | 'flagged' = 'new';
    if (completedOrders < 3) {
      badge = 'new';
    } else if (score >= 85) {
      badge = 'trusted';
    } else if (score >= 60) {
      badge = 'good';
    } else if (score < 40) {
      badge = 'flagged';
    } else {
      badge = 'good'; // fallback between 40 and 60
    }

    // 7. Update User
    user.reliability = {
      score,
      totalOrders,
      completedOrders,
      disputesRaisedAgainst,
      disputesResolved,
      avgPaymentDelayDays: Math.round(avgPaymentDelayDays * 10) / 10,
      badge
    };

    await user.save();
    console.log(`[ReliabilityService] Recalculated score for user ${userId}: Score=${score}, Badge=${badge}`);

  } catch (error) {
    console.error(`[ReliabilityService] Error recalculating score for user ${userId}:`, error);
  }
};

// Object-style export alias for convenience (used by seed scripts etc.)
export const reliabilityService = {
  recalculateScore: recalculateReliabilityScore,
};
