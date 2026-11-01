export default function Card({ children, className = "", highlighted = false, hoverable = true }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl border-[1.5px] bg-white transition-all duration-250 ${
        hoverable ? "hover:-translate-y-1 hover:shadow-[0_16px_50px_rgba(0,0,0,0.1)]" : ""
      } ${
        highlighted
          ? "border-orange-600 shadow-[0_8px_36px_rgba(234,88,12,0.13)]"
          : "border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
