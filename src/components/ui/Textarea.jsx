export default function Textarea({ label, error, className = "", id, ...props }) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-[0.8rem] font-medium text-slate-600">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={4}
        className={`w-full resize-none rounded-lg border-[1.5px] bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-600 ${
          error ? "border-red-400" : "border-slate-200"
        }`}
        {...props}
      />
      {error && <p className="mt-1 text-[0.72rem] text-red-500">{error}</p>}
    </div>
  );
}
