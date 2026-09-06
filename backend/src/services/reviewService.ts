import { Review, IReview } from '../models/Review.js';
import { Order } from '../models/Order.js';
import { recalculateReliabilityScore } from './reliabilityService.js';

export const createReview = async (
  orderId: string,
  reviewerId: string,
  revieweeId: string,
  reviewerRole: 'farmer' | 'consumer' | 'bulk_buyer',
  rating: number,
  comment?: string,
  tags?: string[]
): Promise<IReview> => {
  // Check if order is DELIVERED
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  if (order.orderStatus !== 'DELIVERED') {
    throw new Error('Can only review delivered orders');
  }

  // Check if reviewee is part of the order
  if (order.buyerId.toString() !== revieweeId && order.sellerId.toString() !== revieweeId) {
    throw new Error('Reviewee is not part of this order');
  }

  const review = new Review({
    orderId,
    reviewerId,
    revieweeId,
    reviewerRole,
    rating,
    comment,
    tags
  });

  await review.save();

  // Recalculate trust score for the person who was reviewed
  await recalculateReliabilityScore(revieweeId);

  return review;
};

export const getUserReviews = async (userId: string) => {
  const reviews = await Review.find({ revieweeId: userId }).sort({ createdAt: -1 });
  
  const totalStars = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : 0;

  return {
    reviews,
    summary: {
      totalReviews: reviews.length,
      averageRating: Number(avgRating)
    }
  };
};

export const getOrderReviews = async (orderId: string) => {
  return await Review.find({ orderId });
};
