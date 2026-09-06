import React, { useState } from 'react';
import { Modal, Button } from './ui';
import { Star } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string, tags: string[]) => void;
  isSubmitting?: boolean;
}

const AVAILABLE_TAGS = [
  { id: 'on_time_payment', label: 'On Time Payment' },
  { id: 'late_payment', label: 'Late Payment' },
  { id: 'excellent_communication', label: 'Excellent Communication' },
  { id: 'poor_communication', label: 'Poor Communication' },
  { id: 'good_quality', label: 'Good Quality' },
  { id: 'disputed_quality', label: 'Disputed Quality' }
];

export const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    onSubmit(rating, comment, selectedTags);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave a Review">
      <div className="flex flex-col items-center mb-6">
        <p className="text-sm text-slate-600 mb-3">How was your experience with this transaction?</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`w-8 h-8 ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-slate-300'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">What stood out?</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedTags.includes(tag.id)
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Additional Comments (Optional)</label>
        <textarea
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
          rows={3}
          placeholder="Share more details about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={rating === 0 || isSubmitting}
          isLoading={isSubmitting}
        >
          Submit Review
        </Button>
      </div>
    </Modal>
  );
};
