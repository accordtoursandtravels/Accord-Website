import Link from "next/link";

const VARIANTS = {
  primary: "bg-orange-600 text-white hover:bg-orange-700",
  secondary: "bg-slate-800 text-white hover:bg-slate-900",
  outline: "border-[1.5px] border-slate-200 text-slate-700 hover:border-orange-600 hover:text-orange-600",
  ghost: "text-slate-500 hover:text-orange-600",
  danger: "bg-red-600 text-white hover:bg-red-700",
  whatsapp: "bg-[#25D366] text-white hover:brightness-95",
};

const SIZES = {
  sm: "px-3.5 py-1.5 text-[0.78rem]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[0.95rem]",
};

/**
 * Shared button/link used across the client site and the admin panel.
 * Renders a <Link> when `href` is passed, otherwise a <button>.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const classes = `font-heading inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {!loading && Icon && iconPosition === "left" && <Icon size={size === "lg" ? 16 : 14} />}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={size === "lg" ? 16 : 14} />}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  );
}
