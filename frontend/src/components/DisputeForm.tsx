import React, { useState } from 'react';
import { Modal, Button } from './ui';
import { AlertCircle, Link as LinkIcon } from 'lucide-react';
import type { DisputeType } from '../types';

interface DisputeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (type: DisputeType, description: string, evidenceUrls: string[]) => void;
  isSubmitting?: boolean;
}

const DISPUTE_TYPES: { value: DisputeType; label: string; desc: string }[] = [
  { value: 'payment_delay', label: 'Payment Delay', desc: 'Payment has not been released or is overdue.' },
  { value: 'quality_issue', label: 'Quality Issue', desc: 'The produce quality did not match the agreed terms.' },
  { value: 'no_show', label: 'No Show', desc: 'The buyer or delivery partner did not arrive.' },
  { value: 'non_payment', label: 'Non Payment', desc: 'Total failure to pay after delivery.' },
  { value: 'other', label: 'Other', desc: 'Any other issue requiring admin mediation.' }
];

export const DisputeForm: React.FC<DisputeFormProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [type, setType] = useState<DisputeType>('payment_delay');
  const [description, setDescription] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    const urls = evidenceUrl.trim() ? [evidenceUrl.trim()] : [];
    onSubmit(type, description, urls);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Raise a Dispute">
      <div className="bg-red-50 border border-red-100 rounded-lg p-3 flex gap-3 mb-6 text-red-800 text-sm">
        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <p>Raising a dispute halts any automatic payments. An admin will review the case and mediate the resolution.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Issue Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DISPUTE_TYPES.map(dt => (
              <label 
                key={dt.value}
                className={`flex flex-col p-3 border rounded-lg cursor-pointer transition-colors ${
                  type === dt.value ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="dispute_type" 
                    value={dt.value}
                    checked={type === dt.value}
                    onChange={() => setType(dt.value)}
                    className="text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-sm text-slate-900">{dt.label}</span>
                </div>
                <span className="text-xs text-slate-500 mt-1 ml-5">{dt.desc}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea
            required
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
            rows={4}
            placeholder="Please provide detailed information about the issue..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Evidence URL (Optional)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="url"
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              placeholder="https://link-to-photos-or-documents.com"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">Provide a link to Google Drive, Dropbox, or image hosting containing proof.</p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button 
            type="submit" 
            variant="danger"
            disabled={!description.trim() || isSubmitting}
            isLoading={isSubmitting}
          >
            Submit Dispute
          </Button>
        </div>
      </form>
    </Modal>
  );
};
