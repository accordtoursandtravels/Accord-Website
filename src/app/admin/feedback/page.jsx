"use client";

import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner";
import StatusBadge from "@/components/ui/StatusBadge";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminFeedbackPage() {
  const [items, setItems] = useState(null);
  const toast = useToast();

  const load = () =>
    fetch("/api/testimonials?all=true")
      .then((r) => r.json())
      .then((d) => setItems(d.testimonials || []));

  useEffect(() => {
    load();
  }, []);

  async function decide(bookingId, testimonialStatus) {
    const res = await fetch("/api/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, testimonialStatus }),
    });
    if (!res.ok) {
      toast("Could not update", "error");
      return;
    }
    toast(testimonialStatus === "approved" ? "Added to testimonials" : "Kept off the site", "success");
    load();
  }

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl font-bold text-slate-800">Customer Feedback</h1>
      <p className="mb-6 text-sm text-slate-500">
        Decide which submitted feedback appears as a testimonial on the homepage.
      </p>

      {!items ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          No feedback submitted yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {items.map((b) => (
            <div key={b._id} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading text-sm font-bold text-slate-800">{b.name}</div>
                  <div className="text-[0.72rem] text-slate-400">
                    {b.bookingCode} · {b.fleetName || "—"}
                  </div>
                </div>
                <StatusBadge status={b.feedback.testimonialStatus} />
              </div>
              <div className="mb-2 flex gap-[2px]">
                {[...Array(b.feedback.rating || 0)].map((_, i) => (
                  <FaStar key={i} size={13} color="#f59e0b" />
                ))}
              </div>
              <p className="mb-4 text-[0.85rem] italic text-slate-600">
                &quot;{b.feedback.comment || "No comment left."}&quot;
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={b.feedback.testimonialStatus === "approved" ? "primary" : "outline"}
                  onClick={() => decide(b._id, "approved")}
                >
                  Approve for site
                </Button>
                <Button
                  size="sm"
                  variant={b.feedback.testimonialStatus === "rejected" ? "danger" : "outline"}
                  onClick={() => decide(b._id, "rejected")}
                >
                  Keep off site
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
