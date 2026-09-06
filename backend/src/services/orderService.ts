import mongoose from 'mongoose';
import { Order, IOrder, OrderStatus } from '../models/Order.js';
import { ExtendedPaymentState } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { UserResponse } from '../models/User.js';
import { cartService } from './cartService.js';
import { paymentService } from './paymentService.js';
import { recalculateReliabilityScore } from './reliabilityService.js';

export interface CreateOrderPayload {
  items?: { productId: string; quantity: number }[];
  deliveryAddress: {
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentMethod?: 'ESCROW' | 'UPI' | 'COD' | 'BANK_TRANSFER';
  isDirectCheckout?: boolean;
}

export interface OrderResponseDTO {
  id: string;
  orderNumber: string;
  buyer: {
    id: string;
    name: string;
    emailOrPhone: string;
    role: string;
  };
  seller: {
    id: string;
    name: string;
    fpoName?: string;
    district: string;
    state: string;
  };
  items: {
    productId: string;
    title: string;
    category: string;
    imageUrl: string;
    unit: string;
    pricePerUnit: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotalAmount: number;
  logisticsFee: number;
  totalAmount: number;
  priceBreakdown: {
    consumerTotal: number;
    farmerEarnings: number;
    logisticsCost: number;
    platformFee: number;
    intermediarySavings: number;
  };
  deliveryAddress: {
    streetAddress: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  paymentStatus: ExtendedPaymentState;
  paymentMethod: string;
  orderStatus: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    updatedAt: string;
    note?: string;
  }[];
  paymentHistory: {
    state: ExtendedPaymentState;
    transactionId?: string;
    timestamp: string;
    note?: string;
  }[];
  deliveryPartner?: {
    id?: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const orderService = {
  // Convert Order Mongoose Document to Response DTO
  toOrderDTO(doc: IOrder): OrderResponseDTO {
    const breakdown = doc.priceBreakdown || paymentService.calculateDynamicBreakdown(doc.subtotalAmount, doc.logisticsFee);

    return {
      id: doc._id.toString(),
      orderNumber: doc.orderNumber,
      buyer: {
        id: doc.buyerId.toString(),
        name: doc.buyerName,
        emailOrPhone: doc.buyerEmailOrPhone,
        role: doc.buyerRole
      },
      seller: {
        id: doc.sellerId.toString(),
        name: doc.sellerName,
        fpoName: doc.fpoName || '',
        district: doc.sellerDistrict,
        state: doc.sellerState
      },
      items: doc.items.map((i) => ({
        productId: i.productId.toString(),
        title: i.title,
        category: i.category,
        imageUrl: i.imageUrl,
        unit: i.unit,
        pricePerUnit: i.pricePerUnit,
        quantity: i.quantity,
        subtotal: i.subtotal
      })),
      subtotalAmount: doc.subtotalAmount,
      logisticsFee: doc.logisticsFee || 0,
      totalAmount: doc.totalAmount,
      priceBreakdown: breakdown,
      deliveryAddress: doc.deliveryAddress,
      paymentStatus: doc.paymentStatus,
      paymentMethod: doc.paymentMethod || 'ESCROW',
      orderStatus: doc.orderStatus,
      statusHistory: (doc.statusHistory || []).map((h) => ({
        status: h.status,
        updatedAt: h.updatedAt ? new Date(h.updatedAt).toISOString() : new Date().toISOString(),
        note: h.note || ''
      })),
      paymentHistory: (doc.paymentHistory || []).map((p) => ({
        state: p.state,
        transactionId: p.transactionId || '',
        timestamp: p.timestamp ? new Date(p.timestamp).toISOString() : new Date().toISOString(),
        note: p.note || ''
      })),
      deliveryPartner: {
        id: doc.deliveryPartnerId ? doc.deliveryPartnerId.toString() : undefined,
        name: doc.deliveryPartnerName || undefined
      },
      createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString()
    };
  },

  // 1. Create Order (Stock Validated & Dynamic Price Breakdown Computed strictly on Backend)
  async createOrder(buyer: UserResponse, payload: CreateOrderPayload): Promise<{ success: boolean; orders?: OrderResponseDTO[]; message?: string }> {
    if (!payload.deliveryAddress || !payload.deliveryAddress.streetAddress || !payload.deliveryAddress.city) {
      return { success: false, message: 'Valid delivery address is required.' };
    }

    let itemsToProcess: { productId: string; quantity: number }[] = [];

    if (payload.isDirectCheckout && payload.items && payload.items.length > 0) {
      itemsToProcess = payload.items;
    } else {
      const cart = await cartService.getCart(buyer.id);
      if (!cart.items || cart.items.length === 0) {
        return { success: false, message: 'Your shopping cart is empty.' };
      }
      itemsToProcess = cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    }

    const itemsBySeller: Record<string, { product: any; requestedQty: number }[]> = {};

    for (const itemRequest of itemsToProcess) {
      if (!mongoose.Types.ObjectId.isValid(itemRequest.productId)) {
        return { success: false, message: `Invalid product ID ${itemRequest.productId}` };
      }

      const product = await Product.findById(itemRequest.productId);
      if (!product || product.status === 'unlisted') {
        return { success: false, message: `Produce item "${product?.title || 'Unknown'}" is no longer available.` };
      }

      if (product.availableQuantity < itemRequest.quantity) {
        return {
          success: false,
          message: `Insufficient stock for "${product.title}". Requested: ${itemRequest.quantity} ${product.unit}, Available: ${product.availableQuantity} ${product.unit}.`
        };
      }

      const sellerKey = product.farmerId.toString();
      if (!itemsBySeller[sellerKey]) {
        itemsBySeller[sellerKey] = [];
      }
      itemsBySeller[sellerKey].push({ product, requestedQty: itemRequest.quantity });
    }

    const createdOrders: OrderResponseDTO[] = [];

    for (const [sellerIdStr, sellerItems] of Object.entries(itemsBySeller)) {
      const firstProduct = sellerItems[0].product;
      const orderItems = [];
      let subtotalAmount = 0;

      for (const { product, requestedQty } of sellerItems) {
        const itemPrice = product.price;
        const itemSubtotal = itemPrice * requestedQty;
        subtotalAmount += itemSubtotal;

        orderItems.push({
          productId: product._id,
          title: product.title,
          category: product.category,
          imageUrl: product.imageUrl,
          unit: product.unit,
          pricePerUnit: itemPrice,
          quantity: requestedQty,
          subtotal: itemSubtotal
        });

        product.availableQuantity = product.availableQuantity - requestedQty;
        if (product.availableQuantity === 0) {
          product.status = 'sold_out';
        }
        await product.save();
      }

      const logisticsFee = subtotalAmount > 5000 ? 0 : 150;
      const totalAmount = subtotalAmount + logisticsFee;
      const orderNumber = `ORD-2026-${Math.floor(100000 + Math.random() * 900000)}`;

      // Calculate Dynamic Price Breakdown on Backend
      const priceBreakdown = paymentService.calculateDynamicBreakdown(subtotalAmount, logisticsFee);

      const newOrder = new Order({
        orderNumber,
        buyerId: new mongoose.Types.ObjectId(buyer.id),
        buyerName: buyer.name,
        buyerEmailOrPhone: buyer.emailOrPhone || buyer.email,
        buyerRole: buyer.role || 'consumer',

        sellerId: new mongoose.Types.ObjectId(sellerIdStr),
        sellerName: firstProduct.farmerName,
        fpoName: firstProduct.fpoName || '',
        sellerDistrict: firstProduct.location?.district || 'Gorakhpur',
        sellerState: firstProduct.location?.state || 'Uttar Pradesh',

        items: orderItems,
        subtotalAmount,
        logisticsFee,
        totalAmount,
        priceBreakdown,

        deliveryAddress: payload.deliveryAddress,
        paymentStatus: 'PENDING',
        paymentMethod: payload.paymentMethod || 'ESCROW',
        orderStatus: 'PENDING',
        statusHistory: [
          {
            status: 'PENDING',
            updatedAt: new Date(),
            note: 'Order placed directly with farmer. Payment held in platform escrow.'
          }
        ],
        paymentHistory: [
          {
            state: 'HELD_FOR_ORDER',
            transactionId: `PAY_TXN_${Date.now()}`,
            timestamp: new Date(),
            note: 'Payment authorized and held in platform escrow.'
          }
        ]
      });

      const savedOrder = await newOrder.save();
      createdOrders.push(this.toOrderDTO(savedOrder));
    }

    if (!payload.isDirectCheckout) {
      await cartService.clearCart(buyer.id);
    }

    return {
      success: true,
      orders: createdOrders
    };
  },

  // 2. Get Orders (Strict Role Ownership Guard)
  async getUserOrders(user: UserResponse): Promise<OrderResponseDTO[]> {
    let query: any = {};

    if (user.role === 'farmer') {
      query = {
        $or: [
          { sellerId: new mongoose.Types.ObjectId(user.id) },
          { buyerId: new mongoose.Types.ObjectId(user.id) }
        ]
      };
    } else if (user.role === 'consumer' || user.role === 'bulk_buyer') {
      query = { buyerId: new mongoose.Types.ObjectId(user.id) };
    } else if (user.role === 'delivery_partner') {
      query = {
        $or: [
          { deliveryPartnerId: new mongoose.Types.ObjectId(user.id) },
          { orderStatus: { $in: ['PACKED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] } }
        ]
      };
    } else if (user.role === 'admin') {
      query = {};
    } else {
      query = { buyerId: new mongoose.Types.ObjectId(user.id) };
    }

    const docs = await Order.find(query).sort({ createdAt: -1 });
    return docs.map((d) => this.toOrderDTO(d));
  },

  // 3. Get Single Order Details (Ownership Authorization Guard)
  async getOrderById(orderId: string, user: UserResponse): Promise<{ success: boolean; order?: OrderResponseDTO; message?: string }> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return { success: false, message: 'Invalid order ID' };
    }

    const doc = await Order.findById(orderId);
    if (!doc) {
      return { success: false, message: 'Order not found' };
    }

    const isBuyer = doc.buyerId.toString() === user.id;
    const isSeller = doc.sellerId.toString() === user.id;
    const isDeliveryPartner = doc.deliveryPartnerId?.toString() === user.id || user.role === 'delivery_partner';
    const isAdmin = user.role === 'admin';

    if (!isBuyer && !isSeller && !isDeliveryPartner && !isAdmin) {
      return { success: false, message: 'Forbidden: You are not authorized to view another user’s order.' };
    }

    return { success: true, order: this.toOrderDTO(doc) };
  },

  // 4. Update Order Status (With Role Verification & Stock Restoration on Cancel)
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    user: UserResponse,
    note?: string
  ): Promise<{ success: boolean; order?: OrderResponseDTO; message?: string }> {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return { success: false, message: 'Invalid order ID' };
    }

    const doc = await Order.findById(orderId);
    if (!doc) {
      return { success: false, message: 'Order not found' };
    }

    const isBuyer = doc.buyerId.toString() === user.id;
    const isSeller = doc.sellerId.toString() === user.id;
    const isDeliveryPartner = user.role === 'delivery_partner';
    const isAdmin = user.role === 'admin';

    if (newStatus === 'CANCELLED') {
      if (!isBuyer && !isSeller && !isAdmin) {
        return { success: false, message: 'Forbidden: You cannot cancel this order.' };
      }
      if (doc.orderStatus === 'DELIVERED') {
        return { success: false, message: 'Delivered orders cannot be cancelled.' };
      }

      for (const item of doc.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { availableQuantity: item.quantity },
          $set: { status: 'available' }
        });
      }

      doc.paymentStatus = 'REFUNDED';
      doc.paymentHistory.push({
        state: 'REFUNDED',
        timestamp: new Date(),
        note: 'Order cancelled. Refund initiated to buyer account.'
      });
    } else {
      if (user.role === 'farmer' && !isSeller && !isAdmin) {
        return { success: false, message: 'Forbidden: You are not the seller of this order.' };
      }
    }

    doc.orderStatus = newStatus;
    doc.statusHistory.push({
      status: newStatus,
      updatedAt: new Date(),
      note: note || `Order status updated to ${newStatus} by ${user.name} (${user.role})`
    });

    if (isDeliveryPartner) {
      doc.deliveryPartnerId = new mongoose.Types.ObjectId(user.id);
      doc.deliveryPartnerName = user.name;
    }

    const updated = await doc.save();

    // AUTO-RELEASE ESCROW TRIGGER
    if (newStatus === 'DELIVERED') {
      try {
        // We import paymentService here to avoid circular dependency if they import each other
        const { paymentService } = await import('./paymentService.js');
        await paymentService.releaseEscrowToFarmer(orderId, user.id, user.role);
      } catch (err) {
        console.error('Failed to auto-release escrow:', err);
      }
    }

    // Return the latest doc after escrow release if it happened
    const finalDoc = await Order.findById(orderId);

    if (newStatus === 'DELIVERED' && finalDoc) {
      try {
        await recalculateReliabilityScore(finalDoc.buyerId.toString());
        await recalculateReliabilityScore(finalDoc.sellerId.toString());
      } catch (err) {
        console.error('Failed to recalculate reliability score:', err);
      }
    }

    return { success: true, order: this.toOrderDTO(finalDoc || updated) };
  }
};
