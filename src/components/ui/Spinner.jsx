export default function Spinner({ size = 20, className = "" }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-[3px] border-orange-200 border-t-orange-600 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
