import { deliveryService } from './deliveryService.js';
import mongoose from 'mongoose';
import { DeliveryStatus } from '../models/Delivery.js';

interface SimulationState {
  intervalId: NodeJS.Timeout;
  stepIndex: number;
}

const activeSimulations = new Map<string, SimulationState>();

export const gpsSimulationService = {
  async startSimulation(orderIdString: string) {
    const delivery = await deliveryService.getOrderTracking(orderIdString);
    if (!delivery) {
      throw new Error('Delivery record not found');
    }

    const orderId = delivery.orderId;

    // Stop any existing simulation for this order
    this.stopSimulation(orderId);

    // Simulated highway route coordinates from Gorakhpur to Lucknow (Realistic ML optimized path)
    const routePoints = [
      { lat: 26.7606, lng: 83.3732, address: 'Gorakhpur FPO Producer Hub', speed: 0, dist: 270, status: 'PICKED_UP' },
      { lat: 26.7800, lng: 82.8000, address: 'En-route NH-27 near Basti Expressway', speed: 56, dist: 210, status: 'IN_TRANSIT' },
      { lat: 26.7900, lng: 82.2000, address: 'En-route NH-27 near Ayodhya Hub', speed: 64, dist: 142, status: 'IN_TRANSIT' },
      { lat: 26.8100, lng: 81.5000, address: 'Approaching Barabanki Logistics Toll', speed: 48, dist: 75, status: 'IN_TRANSIT' },
      { lat: 26.8400, lng: 81.0000, address: 'Lucknow Outer Ring Road Exit', speed: 35, dist: 18, status: 'OUT_FOR_DELIVERY' },
      { lat: 26.8467, lng: 80.9462, address: 'Gomti Nagar Destination Hub', speed: 0, dist: 0, status: 'DELIVERED' },
    ];

    // Step A — synchronous instant reset (Step 0)
    const initialPoint = routePoints[0];
    await deliveryService.updateLocation({
      orderId: orderId,
      lat: initialPoint.lat,
      lng: initialPoint.lng,
      speedKmH: Math.round(initialPoint.speed),
      address: initialPoint.address,
      status: initialPoint.status as DeliveryStatus,
      distanceRemainingKm: initialPoint.dist,
      isDemoSimulator: true
    });

    // Step B — start the interval from step 1
    let currentStep = 1;
    const intervalId = setInterval(async () => {
      if (currentStep >= routePoints.length) {
        this.stopSimulation(orderId);
        return;
      }

      const point = routePoints[currentStep];
      try {
        await deliveryService.updateLocation({
          orderId: orderId,
          lat: point.lat,
          lng: point.lng,
          speedKmH: Math.round(point.speed),
          address: point.address,
          status: point.status as DeliveryStatus,
          distanceRemainingKm: point.dist,
          isDemoSimulator: true
        });
      } catch (err) {
        console.error(`Failed to update location for order ${orderId}:`, err);
      }

      if (point.status === 'DELIVERED') {
        this.stopSimulation(orderId);
      }

      currentStep++;
    }, 3000); // Update every 3 seconds

    activeSimulations.set(orderId, { intervalId, stepIndex: 0 });
    return { success: true, message: 'Simulation started' };
  },

  async getCurrentLocation(orderIdString: string) {
    const delivery = await deliveryService.getOrderTracking(orderIdString);
    if (!delivery) {
      throw new Error('Delivery record not found');
    }
    
    const isRunning = activeSimulations.has(delivery.orderId);
    
    return { 
      success: true, 
      delivery,
      simulationStatus: isRunning ? 'running' : (delivery.status === 'DELIVERED' ? 'completed' : 'idle')
    };
  },

  stopSimulation(orderId: string) {
    if (activeSimulations.has(orderId)) {
      clearInterval(activeSimulations.get(orderId)!.intervalId);
      activeSimulations.delete(orderId);
      return { success: true, message: 'Simulation stopped' };
    }
    return { success: false, message: 'No active simulation found' };
  }
};
