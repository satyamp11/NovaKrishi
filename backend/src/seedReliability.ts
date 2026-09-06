import mongoose from 'mongoose';
import 'dotenv/config';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Order } from './models/Order.js';
import { Review } from './models/Review.js';
import { Dispute } from './models/Dispute.js';
import { reliabilityService } from './services/reliabilityService.js';

async function seedReliabilityData() {
  await connectDB();
  console.log('🌱 Connected to DB. Seeding reliability data...');

  // Get some users
  const farmers = await User.find({ role: 'farmer' }).limit(2);
  const buyers = await User.find({ role: 'consumer' }).limit(2);

  if (farmers.length === 0 || buyers.length === 0) {
    console.log('⚠️ Not enough users to seed reliability data. Please register at least 1 farmer and 1 buyer first.');
    process.exit(0);
  }

  const farmer = farmers[0];
  const buyer = buyers[0];

  // 1. Create a dummy order if none exists
  let order = await Order.findOne({ buyerId: buyer._id, sellerId: farmer._id });
  if (!order) {
    order = await Order.create({
      orderNumber: `ORD-${Date.now()}`,
      buyerId: buyer._id,
      buyerName: buyer.name,
      buyerEmailOrPhone: buyer.emailOrPhone,
      buyerRole: buyer.role,
      sellerId: farmer._id,
      sellerName: farmer.name,
      fpoName: farmer.businessInfo?.fpoName || '',
      sellerDistrict: farmer.district || 'Test',
      sellerState: farmer.state || 'Test',
      items: [{
        productId: new mongoose.Types.ObjectId(),
        title: 'Organic Tomatoes',
        pricePerUnit: 30,
        quantity: 100,
        unit: 'Kg',
        subtotal: 3000
      }],
      subtotalAmount: 3000,
      logisticsFee: 150,
      totalAmount: 3150,
      orderStatus: 'DELIVERED',
      paymentStatus: 'RELEASED'
    });
    console.log(`📦 Created dummy order ${order.orderNumber}`);
  }

  // 2. Clear existing reviews/disputes for these users to avoid duplicates
  await Review.deleteMany({ revieweeId: { $in: [farmer._id, buyer._id] } });
  await Dispute.deleteMany({ raisedAgainst: { $in: [farmer._id, buyer._id] } });

  // 3. Seed Reviews
  console.log('⭐ Seeding reviews...');
  await Review.create({
    orderId: order._id,
    reviewerId: buyer._id,
    revieweeId: farmer._id,
    rating: 5,
    comment: 'Excellent quality produce and arrived on time!',
    tags: ['good_quality', 'excellent_communication']
  });

  await Review.create({
    orderId: order._id,
    reviewerId: farmer._id,
    revieweeId: buyer._id,
    rating: 4,
    comment: 'Prompt payment, good buyer.',
    tags: ['on_time_payment']
  });

  // 4. Seed Disputes
  console.log('⚖️ Seeding disputes...');
  await Dispute.create({
    orderId: order._id,
    raisedBy: buyer._id,
    raisedAgainst: farmer._id,
    type: 'quality_issue',
    description: 'Minor bruising on tomatoes but mostly fine.',
    status: 'RESOLVED',
    resolution: 'Refunded 10% for the bruised portion.'
  });

  // 5. Recalculate Reliability Scores
  console.log('🔄 Recalculating scores...');
  await reliabilityService.recalculateScore(farmer._id.toString());
  await reliabilityService.recalculateScore(buyer._id.toString());

  console.log('✅ Reliability data seeded successfully!');
  process.exit(0);
}

seedReliabilityData().catch(console.error);
