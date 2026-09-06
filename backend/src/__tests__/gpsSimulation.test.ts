import { gpsSimulationService } from '../services/gpsSimulationService.js';
import { deliveryService } from '../services/deliveryService.js';
import { Delivery } from '../models/Delivery.js';
import mongoose from 'mongoose';

// Setup database connection and cleanup
import './setup.js';

describe('gpsSimulationService', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Clear active simulations internal state if needed (not directly exposed, but we can stop all if we kept track, or just rely on clear)
  });

  afterEach(async () => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    await Delivery.deleteMany({});
  });

  it('correctly walks through distanceRemainingKm values matching each routePoints entry, ending at exactly 0', async () => {
    const orderId = 'ORD-TEST-123';
    
    // Start simulation
    const result = await gpsSimulationService.startSimulation(orderId);
    expect(result.success).toBe(true);
    
    // Check initial synchronous reset
    let delivery = await Delivery.findOne({ orderNumber: orderId });
    expect(delivery).toBeTruthy();
    expect(delivery!.distanceRemainingKm).toBe(270);
    expect(delivery!.status).toBe('PICKED_UP');
    
    // Fast forward 1 tick (step 1)
    await jest.advanceTimersByTimeAsync(3000);
    delivery = await Delivery.findOne({ orderNumber: orderId });
    expect(delivery!.distanceRemainingKm).toBe(210);
    expect(delivery!.status).toBe('IN_TRANSIT');

    // Fast forward 1 tick (step 2)
    await jest.advanceTimersByTimeAsync(3000);
    delivery = await Delivery.findOne({ orderNumber: orderId });
    expect(delivery!.distanceRemainingKm).toBe(142);
    expect(delivery!.status).toBe('IN_TRANSIT');

    // Fast forward remaining ticks (steps 3, 4, 5)
    await jest.advanceTimersByTimeAsync(3000 * 3);
    delivery = await Delivery.findOne({ orderNumber: orderId });
    expect(delivery!.distanceRemainingKm).toBe(0);
    expect(delivery!.status).toBe('DELIVERED');
  });

  it('synchronously resets to step 0 values for an already Delivered order', async () => {
    const orderId = 'ORD-TEST-456';
    
    // Setup a pre-existing delivered order
    await deliveryService.createDelivery({ orderId });
    await deliveryService.updateLocation({
      orderId,
      lat: 26.8467,
      lng: 80.9462,
      status: 'DELIVERED',
      distanceRemainingKm: 0,
      isDemoSimulator: true
    });
    
    let dbDelivery = await Delivery.findOne({ orderNumber: orderId });
    expect(dbDelivery!.status).toBe('DELIVERED');
    expect(dbDelivery!.distanceRemainingKm).toBe(0);
    
    // Call startSimulation and verify IMMEDIATE reset before any tick
    await gpsSimulationService.startSimulation(orderId);
    
    dbDelivery = await Delivery.findOne({ orderNumber: orderId });
    // Must be reset synchronously!
    expect(dbDelivery!.status).toBe('PICKED_UP');
    expect(dbDelivery!.distanceRemainingKm).toBe(270);
  });

  it('does not create duplicate/overlapping intervals when called rapidly twice', async () => {
    const orderId = 'ORD-TEST-789';
    
    // Mock updateLocation to spy on how many times it gets called
    const updateSpy = jest.spyOn(deliveryService, 'updateLocation');
    
    // Call it twice rapidly
    await Promise.all([
      gpsSimulationService.startSimulation(orderId),
      gpsSimulationService.startSimulation(orderId)
    ]);
    
    // The synchronous part (Step 0) will be executed twice due to the double call.
    // However, the interval from the first call should be cleared.
    // So if we advance 1 tick, the interval should only fire ONCE for step 1.
    
    updateSpy.mockClear();
    
    // Advance time by 1 interval tick
    await jest.advanceTimersByTimeAsync(3000);
    
    // If there were 2 intervals, it would be called 2 times. We expect 1.
    expect(updateSpy).toHaveBeenCalledTimes(1);
    
    updateSpy.mockRestore();
  });
});
