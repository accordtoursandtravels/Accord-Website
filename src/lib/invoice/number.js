import Counter from "@/lib/models/Counter";

export async function nextInvoiceNumber() {
  const now = new Date();
  const month = now.toLocaleString("en-IN", { month: "short" });
  const year = now.getFullYear();
  const nextYear = String(year + 1).slice(-2);
  const currentYear = String(year).slice(-2);
  const key = `invoice-${year}`;
  const counter = await Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { value: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return `ACC-${currentYear}-${nextYear}-${month}-${String(counter.value).padStart(5, "0")}`;
}
