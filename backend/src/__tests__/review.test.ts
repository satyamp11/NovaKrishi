import request from 'supertest';
import { app } from '../server.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

describe('Review API Tests', () => {
  let farmerId: string;
  let buyerId: string;
  let deliveredOrderId: string;
  let pendingOrderId: string;
  let buyerToken: string;

  beforeEach(async () => {
    const farmer = await User.create({
      name: 'Farmer John',
      emailOrPhone: 'farmer@test.com',
      role: 'farmer',
      verificationStatus: 'VERIFIED',
      reliability: { score: 70, badge: 'new', totalOrders: 0, completedOrders: 0, disputesRaisedAgainst: 0, disputesResolved: 0, avgPaymentDelayDays: 0 }
    });
    farmerId = farmer._id.toString();

    const buyer = await User.create({
      name: 'Buyer Alice',
      emailOrPhone: 'buyer@test.com',
      role: 'consumer',
      verificationStatus: 'VERIFIED',
      reliability: { score: 70, badge: 'new', totalOrders: 0, completedOrders: 0, disputesRaisedAgainst: 0, disputesResolved: 0, avgPaymentDelayDays: 0 }
    });
    buyerId = buyer._id.toString();
    buyerToken = generateToken(buyerId, 'consumer');

    const deliveredOrder = await Order.create({
      orderNumber: 'ORD-123',
      buyerId,
      sellerId: farmerId,
      items: [],
      subtotalAmount: 100,
      totalAmount: 100,
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID'
    } as any);
    deliveredOrderId = deliveredOrder._id.toString();

    const pendingOrder = await Order.create({
      orderNumber: 'ORD-124',
      buyerId,
      sellerId: farmerId,
      items: [],
      subtotalAmount: 100,
      totalAmount: 100,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING'
    } as any);
    pendingOrderId = pendingOrder._id.toString();
  });

  it('Creates a review on a DELIVERED order and retrieves it', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId: deliveredOrderId,
        revieweeId: farmerId,
        rating: 5,
        comment: 'Great produce!',
        tags: ['good_quality']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.review.rating).toBe(5);

    // Retrieve via GET
    const getRes = await request(app)
      .get(`/api/reviews/order/${deliveredOrderId}`)
      .set('Authorization', `Bearer ${buyerToken}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.reviews).toHaveLength(1);
    expect(getRes.body.reviews[0].comment).toBe('Great produce!');
  });

  it('Rejects creating a review on a non-DELIVERED order (400)', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId: pendingOrderId,
        revieweeId: farmerId,
        rating: 4,
        tags: ['good_quality']
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/only be submitted for delivered/i);
  });

  it('Rejects creating a second review by the same reviewer on the same order (400)', async () => {
    // First review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ orderId: deliveredOrderId, revieweeId: farmerId, rating: 5, tags: [] });

    // Second review
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ orderId: deliveredOrderId, revieweeId: farmerId, rating: 4, tags: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already reviewed/i);
  });

  it('Retrieves correct average rating and pagination for a user', async () => {
    // Create some reviews for the farmer
    await Review.create([
      { orderId: new mongoose.Types.ObjectId(), reviewerId: new mongoose.Types.ObjectId(), revieweeId: farmerId, reviewerRole: 'consumer', rating: 4, tags: [] },
      { orderId: new mongoose.Types.ObjectId(), reviewerId: new mongoose.Types.ObjectId(), revieweeId: farmerId, reviewerRole: 'consumer', rating: 5, tags: [] },
      { orderId: new mongoose.Types.ObjectId(), reviewerId: new mongoose.Types.ObjectId(), revieweeId: farmerId, reviewerRole: 'bulk_buyer', rating: 3, tags: [] }
    ]);

    const res = await request(app)
      .get(`/api/reviews/user/${farmerId}?page=1&limit=2`)
      .set('Authorization', `Bearer ${buyerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.averageRating).toBe(4); // (4+5+3)/3 = 4
    expect(res.body.stats.totalReviews).toBe(3);
    expect(res.body.reviews).toHaveLength(2); // pagination limit
  });
});
