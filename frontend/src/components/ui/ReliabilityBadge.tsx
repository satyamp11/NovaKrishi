import React from 'react';
import { Badge, BadgeVariant } from './Badge';
import { ShieldCheck, ShieldAlert, Info, UserCheck } from 'lucide-react';
import type { ReliabilityMetrics } from '../../types';

interface ReliabilityBadgeProps {
  metrics?: ReliabilityMetrics;
  className?: string;
  showScore?: boolean;
}

export const ReliabilityBadge: React.FC<ReliabilityBadgeProps> = ({ 
  metrics, 
  className = '',
  showScore = true
}) => {
  if (!metrics) return null;

  const getBadgeConfig = (): { variant: BadgeVariant, label: string, icon: React.ReactNode } => {
    switch (metrics.badge) {
      case 'trusted':
        return { variant: 'success', label: 'Trusted', icon: <ShieldCheck className="w-3 h-3" /> };
      case 'good':
        return { variant: 'info', label: 'Good', icon: <UserCheck className="w-3 h-3" /> };
      case 'flagged':
        return { variant: 'danger', label: 'Flagged', icon: <ShieldAlert className="w-3 h-3" /> };
      case 'new':
      default:
        return { variant: 'neutral', label: 'New', icon: <Info className="w-3 h-3" /> };
    }
  };

  const { variant, label, icon } = getBadgeConfig();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={variant} size="sm" icon={icon} dot>
        {label}
      </Badge>
      {showScore && (
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
          {metrics.score}/100
        </span>
      )}
    </div>
  );
};
