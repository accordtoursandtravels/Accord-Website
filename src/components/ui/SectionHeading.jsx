export default function SectionHeading({ eyebrow, title, subtitle, align = "center" }) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`mb-10 max-w-2xl ${alignment}`}>
      {eyebrow && (
        <span className="mb-3 inline-block rounded bg-orange-50 px-3.5 py-[0.35rem] text-[0.72rem] font-bold tracking-[0.12em] text-orange-600 uppercase">
          {eyebrow}
        </span>
      )}
      <h2 className="font-heading mb-2 text-[clamp(1.75rem,3.5vw,2.4rem)] font-bold text-slate-800">
        {title}
      </h2>
      {subtitle && <p className="text-[0.9rem] text-slate-500">{subtitle}</p>}
    </div>
  );
}
