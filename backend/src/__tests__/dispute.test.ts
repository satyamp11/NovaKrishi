import request from 'supertest';
import { app } from '../server.js';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Dispute } from '../models/Dispute.js';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
};

describe('Dispute API Tests', () => {
  let farmerId: string;
  let buyerId: string;
  let adminId: string;
  let orderId: string;
  let buyerToken: string;
  let adminToken: string;

  beforeEach(async () => {
    const farmer = await User.create({
      name: 'Farmer John',
      emailOrPhone: 'farmer2@test.com',
      role: 'farmer',
      verificationStatus: 'VERIFIED',
      reliability: { score: 70, badge: 'new', totalOrders: 0, completedOrders: 0, disputesRaisedAgainst: 0, disputesResolved: 0, avgPaymentDelayDays: 0 }
    });
    farmerId = farmer._id.toString();

    const buyer = await User.create({
      name: 'Buyer Alice',
      emailOrPhone: 'buyer2@test.com',
      role: 'consumer',
      verificationStatus: 'VERIFIED',
      reliability: { score: 70, badge: 'new', totalOrders: 0, completedOrders: 0, disputesRaisedAgainst: 0, disputesResolved: 0, avgPaymentDelayDays: 0 }
    });
    buyerId = buyer._id.toString();
    buyerToken = generateToken(buyerId, 'consumer');

    const admin = await User.create({
      name: 'Admin Bob',
      emailOrPhone: 'admin@test.com',
      role: 'admin',
      verificationStatus: 'VERIFIED',
      reliability: { score: 100, badge: 'trusted', totalOrders: 0, completedOrders: 0, disputesRaisedAgainst: 0, disputesResolved: 0, avgPaymentDelayDays: 0 }
    });
    adminId = admin._id.toString();
    adminToken = generateToken(adminId, 'admin');

    const order = await Order.create({
      orderNumber: 'ORD-DISP-1',
      buyerId,
      sellerId: farmerId,
      items: [],
      subtotalAmount: 500,
      totalAmount: 500,
      orderStatus: 'DELIVERED',
      paymentStatus: 'HELD_FOR_ORDER'
    } as any);
    orderId = order._id.toString();
  });

  it('Allows order participant to open a dispute with status open', async () => {
    const res = await request(app)
      .post('/api/disputes')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({
        orderId,
        raisedAgainst: farmerId,
        type: 'quality_issue',
        description: 'The tomatoes were rotten.',
        evidenceUrls: ['http://example.com/photo.jpg']
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.dispute.status).toBe('open');
    expect(res.body.dispute.statusHistory).toHaveLength(1);
    expect(res.body.dispute.statusHistory[0].status).toBe('open');
  });

  it('Rejects dispute status update by non-admin users (403)', async () => {
    // Create dispute
    const dispute = await Dispute.create({
      orderId,
      raisedBy: buyerId,
      raisedAgainst: farmerId,
      type: 'quality_issue',
      description: 'Bad quality',
      status: 'open'
    });

    const res = await request(app)
      .put(`/api/disputes/${dispute._id}/status`)
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ status: 'resolved' });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('Allows admin to transition dispute status (open -> resolved) and appends history', async () => {
    const dispute = await Dispute.create({
      orderId,
      raisedBy: buyerId,
      raisedAgainst: farmerId,
      type: 'quality_issue',
      description: 'Bad quality',
      status: 'open',
      statusHistory: [{ status: 'open', updatedAt: new Date() }]
    });

    const res = await request(app)
      .put(`/api/disputes/${dispute._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved', resolution: 'Refunded buyer' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.dispute.status).toBe('resolved');
    expect(res.body.dispute.statusHistory).toHaveLength(2); // open + resolved
    expect(res.body.dispute.statusHistory[1].status).toBe('resolved');
    expect(res.body.dispute.statusHistory[1].note).toBe('Refunded buyer');
  });
});
