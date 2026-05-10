import type { BillingPaymentStatus } from "../services/billingService";

interface Props {
  status: BillingPaymentStatus;
}

const STATUS_CONFIG: Record<
  BillingPaymentStatus,
  { label: string; className: string }
> = {
  Pending: { label: "Pending", className: "badge-yellow" },
  PartiallyPaid: { label: "Partially Paid", className: "badge-blue" },
  Approved: { label: "Approved", className: "badge-green" },
  Rejected: { label: "Rejected", className: "badge-red" },
  Draft: { label: "Draft", className: "badge-gray" },
};

export default function BillingStatusBadge({ status }: Props) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "badge-gray",
  };
  return <span className={`status-badge ${cfg.className}`}>{cfg.label}</span>;
}
