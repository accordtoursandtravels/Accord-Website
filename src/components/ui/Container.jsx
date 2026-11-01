export default function Container({ children, className = "", wide = false }) {
  return (
    <div className={`mx-auto px-6 ${wide ? "max-w-7xl" : "max-w-6xl"} ${className}`}>
      {children}
    </div>
  );
}
