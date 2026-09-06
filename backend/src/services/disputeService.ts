import { Dispute, IDispute, DisputeStatus, DisputeType } from '../models/Dispute.js';
import { recalculateReliabilityScore } from './reliabilityService.js';

export const createDispute = async (
  orderId: string,
  raisedBy: string,
  raisedAgainst: string,
  type: DisputeType,
  description: string,
  evidenceUrls?: string[]
): Promise<IDispute> => {
  const dispute = new Dispute({
    orderId,
    raisedBy,
    raisedAgainst,
    type,
    description,
    evidenceUrls: evidenceUrls || []
  });

  await dispute.save();
  await recalculateReliabilityScore(raisedAgainst);
  return dispute;
};

export const getDisputes = async (userId: string, role: string) => {
  if (role === 'admin') {
    return await Dispute.find().sort({ createdAt: -1 });
  } else {
    return await Dispute.find({
      $or: [{ raisedBy: userId }, { raisedAgainst: userId }]
    }).sort({ createdAt: -1 });
  }
};

export const getDisputeById = async (id: string) => {
  return await Dispute.findById(id);
};

export const updateDisputeStatus = async (
  id: string,
  status: DisputeStatus,
  resolution?: string,
  note?: string
) => {
  const dispute = await Dispute.findById(id);
  if (!dispute) {
    throw new Error('Dispute not found');
  }

  dispute.status = status;
  if (resolution) {
    dispute.resolution = resolution;
  }
  
  if (status === 'resolved' || status === 'rejected') {
    dispute.resolvedAt = new Date();
  }

  dispute.statusHistory.push({
    status,
    note,
    updatedAt: new Date()
  });

  await dispute.save();

  if (status === 'resolved' || status === 'rejected') {
    await recalculateReliabilityScore(dispute.raisedAgainst.toString());
  }

  return dispute;
};
