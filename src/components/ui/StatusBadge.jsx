const STATUS_STYLES = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-600 border-red-200",
  not_reviewed: "bg-slate-100 text-slate-500 border-slate-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  unpaid: "bg-slate-100 text-slate-600 border-slate-200",
  not_required: "bg-slate-100 text-slate-500 border-slate-200",
};

const LABELS = {
  not_reviewed: "Not reviewed",
  not_required: "Not required",
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-500 border-slate-200";
  const label = LABELS[status] || status?.charAt(0).toUpperCase() + status?.slice(1);
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-[0.2rem] text-[0.72rem] font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}
