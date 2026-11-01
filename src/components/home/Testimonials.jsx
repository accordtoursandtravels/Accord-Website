"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";

export default function Testimonials({ limit = 3 }) {
  const [items,setItems]=useState([]);
  const [active,setActive]=useState(0);
  useEffect(()=>{
    fetch("/api/site-content").then(r=>r.json()).then(d=>setItems(d.testimonials||[])).catch(()=>{});
  },[]);
  useEffect(()=>{
    if(items.length < 2) return;
    const t=setInterval(()=>setActive(v=>(v+1)%Math.min(items.length,limit)),2000);
    return ()=>clearInterval(t);
  },[items,limit]);
  const list=items.length ? Array.from({length: Math.min(limit, items.length)}, (_,i)=>items[(active+i)%items.length]) : [];
  if(!list.length) return <div className="rounded-xl bg-white/5 p-8 text-center text-sm text-white/50">Testimonials coming soon.</div>;
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {list.map((t,i)=><div key={`${t._id}-${i}`} className={`rounded-xl border border-white/8 bg-white/5 p-7 transition-all duration-500 ${i===0 ? "ring-2 ring-orange-600/50" : ""}`}>
          <div className="mb-4 flex gap-[2px]">{[...Array(t.rating||5)].map((_,j)=><FaStar key={j} size={13} color="#f59e0b"/>)}</div>
          <p className="mb-6 text-[0.9rem] leading-[1.8] text-white/70 italic">&quot;{t.text}&quot;</p>
          <div className="flex items-center gap-3">
            {t.image ? <img src={t.image} alt={t.name} className="h-[38px] w-[38px] rounded-full object-cover"/> : <div className="font-heading flex h-[38px] w-[38px] items-center justify-center rounded-full bg-orange-600 text-base font-bold text-white">{t.name?.[0]}</div>}
            <div><div className="text-sm font-semibold text-white">{t.name}</div><div className="text-[0.72rem] text-white/40">{[t.role,t.company,t.city].filter(Boolean).join(" · ")}</div></div>
          </div>
        </div>)}
      </div>
      <div className="mt-6 flex justify-center gap-1.5">{list.map((_,i)=><button key={i} onClick={()=>setActive((active+i)%items.length)} aria-label={`Testimonial ${i+1}`} className={`h-1.5 rounded-full transition-all ${i===active?"w-6 bg-orange-600":"w-1.5 bg-white/25"}`}/>)}</div>
    </div>
  );
}
