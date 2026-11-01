"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { FaStar, FaCheckCircle } from "react-icons/fa";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";

export default function FeedbackPage() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, error: "", booking: null });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/feedback/${token}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "This link is invalid or expired");
        setState({ loading: false, error: "", booking: data });
      })
      .catch((e) => setState({ loading: false, error: e.message, booking: null }));
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    if (!rating) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/feedback/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDone(true);
    } catch (err) {
      setState((s) => ({ ...s, error: err.message }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 no-underline">
        <div className="relative h-11 w-11">
          <Image src="/images/logo.png" fill alt="Accord Logo" className="object-contain" />
        </div>
        <span className="font-heading text-xl font-extrabold text-orange-600">Accord</span>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)]">
        {state.loading ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : state.error ? (
          <p className="py-6 text-center text-sm text-slate-500">{state.error}</p>
        ) : done ? (
          <div className="py-4 text-center">
            <FaCheckCircle size={40} className="mx-auto mb-4 text-orange-600" />
            <h2 className="font-heading mb-2 text-lg font-bold text-slate-800">Thank you!</h2>
            <p className="text-sm text-slate-500">Your feedback helps us improve every trip.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h1 className="font-heading mb-1 text-lg font-bold text-slate-800">
              How was your trip, {state.booking.name?.split(" ")[0]}?
            </h1>
            <p className="mb-6 text-[0.8rem] text-slate-500">
              {state.booking.bookingCode} · {state.booking.fleetName}
            </p>

            <div className="mb-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHoverRating(n)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1"
                >
                  <FaStar size={28} color={n <= (hoverRating || rating) ? "#f59e0b" : "#e2e8f0"} />
                </button>
              ))}
            </div>

            <Textarea
              label="Tell us more (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Driver was on time, vehicle was clean…"
              className="mb-6"
            />

            <Button type="submit" disabled={!rating} loading={submitting} className="w-full justify-center">
              Submit Feedback
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
