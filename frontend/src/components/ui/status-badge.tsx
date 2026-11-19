import React from 'react';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

export type HostPilotStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PAID'
  | 'DUE'
  | 'PARTIAL'
  | 'AVAILABLE'
  | 'OCCUPIED'
  | 'MAINTENANCE'
  | 'RESOLVED'
  | 'IN_PROGRESS';

interface StatusBadgeProps {
  status: HostPilotStatus | string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const normalized = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'PAID':
      case 'RESOLVED':
      case 'AVAILABLE':
        return {
          label: normalized === 'PAID' ? 'পরিশোধিত' : normalized === 'ACTIVE' ? 'সক্রিয়' : normalized === 'APPROVED' ? 'অনুমোদিত' : normalized === 'AVAILABLE' ? 'খালি' : 'নিষ্পন্ন',
          badgeVariant: 'success' as const,
          dotColor: 'bg-emerald-500',
        };
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'PARTIAL':
        return {
          label: normalized === 'PENDING' ? 'অপেক্ষমান' : normalized === 'IN_PROGRESS' ? 'প্রক্রিয়াধীন' : 'আংশিক',
          badgeVariant: 'warning' as const,
          dotColor: 'bg-amber-500',
        };
      case 'REJECTED':
      case 'DUE':
      case 'INACTIVE':
      case 'MAINTENANCE':
        return {
          label: normalized === 'DUE' ? 'বকেয়া' : normalized === 'REJECTED' ? 'বাতিল' : normalized === 'INACTIVE' ? 'নিষ্ক্রিয়' : 'মেরামত চলছে',
          badgeVariant: 'destructive' as const,
          dotColor: 'bg-rose-500',
        };
      case 'OCCUPIED':
        return {
          label: 'বরাদ্দকৃত',
          badgeVariant: 'secondary' as const,
          dotColor: 'bg-slate-500',
        };
      default:
        return {
          label: status,
          badgeVariant: 'outline' as const,
          dotColor: 'bg-gray-400',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn('inline-flex items-center gap-1.5 font-medium text-[11px] px-2 py-0.5', className)}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full shrink-0', config.dotColor)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </Badge>
  );
};
