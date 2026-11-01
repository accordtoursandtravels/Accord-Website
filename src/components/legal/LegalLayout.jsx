import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import PublicHeader from "@/components/site/PublicHeader";

export default function LegalLayout({ title, updated, children }) {
  return (
    <div className="bg-white font-sans text-slate-800">
      <PublicHeader />

      <div className="mx-auto max-w-[720px] px-6 py-[clamp(2.5rem,5vw,4rem)]">
        <h1 className="font-heading mb-2 text-[clamp(1.7rem,3.5vw,2.2rem)] font-bold text-slate-800">{title}</h1>
        <p className="mb-10 text-[0.8rem] text-slate-400">Last updated: {updated}</p>
        <div className="space-y-8 text-[0.9rem] leading-[1.8] text-slate-600">{children}</div>
      </div>
    </div>
  );
}
