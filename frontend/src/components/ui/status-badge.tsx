import React from 'react';
import { useTranslation } from 'react-i18next';
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
  | 'PARTIALLY_OCCUPIED'
  | 'OCCUPIED'
  | 'FULL'
  | 'STOCK_OUT'
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
  const { t } = useTranslation();
  const normalized = status.toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'PAID':
      case 'RESOLVED':
      case 'AVAILABLE':
        return {
          label: t(`status.${normalized.toLowerCase()}`, normalized),
          badgeVariant: 'success' as const,
          dotColor: 'bg-emerald-500',
        };
      case 'PARTIALLY_OCCUPIED':
      case 'PARTIAL_OCCUPIED':
        return {
          label: t('status.partially_occupied', 'Partially Occupied'),
          badgeVariant: 'warning' as const,
          dotColor: 'bg-amber-500',
        };
      case 'FULL':
      case 'STOCK_OUT':
        return {
          label: t('status.full', 'Full / Stock Out'),
          badgeVariant: 'destructive' as const,
          dotColor: 'bg-rose-500',
        };
      case 'MAINTENANCE':
        return {
          label: t('status.maintenance', 'Maintenance'),
          badgeVariant: 'destructive' as const,
          dotColor: 'bg-slate-500',
        };
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'PARTIAL':
        return {
          label: t(`status.${normalized.toLowerCase()}`, normalized),
          badgeVariant: 'warning' as const,
          dotColor: 'bg-amber-500',
        };
      case 'REJECTED':
      case 'DUE':
      case 'INACTIVE':
        return {
          label: t(`status.${normalized.toLowerCase()}`, normalized),
          badgeVariant: 'destructive' as const,
          dotColor: 'bg-rose-500',
        };
      case 'OCCUPIED':
        return {
          label: t('status.occupied', 'Occupied'),
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
