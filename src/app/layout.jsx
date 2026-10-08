import "./globals.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

export const metadata = {
  title: "Accord Tours & Travels | Bengaluru's Trusted Cab Service",
  description:
    "Airport transfers, outstation trips, local city rides, pilgrimages and corporate travel across Bengaluru & Karnataka. Well-maintained fleet, professional drivers, honest pricing.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-slate-800 font-sans">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
