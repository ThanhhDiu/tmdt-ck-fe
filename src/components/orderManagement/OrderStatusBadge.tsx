import React from 'react';

type OrderStatus = 'NEW' | 'ASSIGNED' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const STATUS_CLASSNAMES: Record<OrderStatus, string> = {
  NEW: 'order-status--gray',
  ASSIGNED: 'order-status--blue',
  SCHEDULED: 'order-status--purple',
  IN_PROGRESS: 'order-status--yellow',
  COMPLETED: 'order-status--green',
  CANCELLED: 'order-status--red',
};

type Props = {
  status: OrderStatus;
};

export const OrderStatusBadge: React.FC<Props> = ({ status }) => {
  return <span className={`order-status ${STATUS_CLASSNAMES[status]}`}>{STATUS_LABELS[status]}</span>;
};

export type { OrderStatus };
