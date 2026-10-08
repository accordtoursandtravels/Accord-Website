import { FaChevronDown } from "react-icons/fa";

export default function Select({ label, error, className = "", id, children, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`w-full appearance-none rounded-lg border-[1.5px] bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-800 outline-none transition-colors focus:border-orange-600 ${
            error ? "border-red-400" : "border-slate-200"
          }`}
          {...props}
        >
          {children}
        </select>
        <FaChevronDown size={11} className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-slate-400" />
      </div>
      {error && <p className="mt-1 text-[0.72rem] text-red-500">{error}</p>}
    </div>
  );
}
