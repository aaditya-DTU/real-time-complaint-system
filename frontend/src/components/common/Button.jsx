import { forwardRef } from "react";

/**
 * Button component — uses the design system classes from index.css
 *
 * Props:
 *   variant   : "primary" | "secondary" | "ghost" | "danger" | "success"
 *   size      : "sm" | "md" | "lg"
 *   loading   : boolean — shows spinner, disables interaction
 *   icon      : ReactNode — leading icon
 *   iconRight : ReactNode — trailing icon
 *   fullWidth : boolean
 *   ...rest   : all native <button> props
 */
const Button = forwardRef(({
  children,
  variant    = "primary",
  size       = "md",
  loading    = false,
  icon       = null,
  iconRight  = null,
  fullWidth  = false,
  className  = "",
  disabled,
  type       = "button",
  ...rest
}, ref) => {
  const variantClass = {
    primary:  "btn-primary",
    secondary:"btn-secondary",
    ghost:    "btn-ghost",
    danger:   "btn-danger",
    success:  "btn-success",
  }[variant] ?? "btn-primary";

  const sizeClass = {
    sm: "btn-sm",
    md: "",
    lg: "btn-lg",
  }[size] ?? "";

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        "btn",
        variantClass,
        sizeClass,
        fullWidth ? "w-full justify-center" : "",
        className,
      ].filter(Boolean).join(" ")}
      {...rest}
    >
      {loading ? (
        <span className="spinner" style={{ width: 14, height: 14 }} />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}

      {children && <span>{children}</span>}

      {!loading && iconRight && (
        <span className="flex-shrink-0">{iconRight}</span>
      )}
    </button>
  );
});

Button.displayName = "Button";

// ── Icon Button ────────────────────────────────────────────
/**
 * Square icon-only button.
 */
export const IconButton = forwardRef(({
  icon,
  label,
  variant   = "ghost",
  size      = "md",
  className = "",
  ...rest
}, ref) => {
  const sizeStyle = {
    sm: { width: 28, height: 28, fontSize: 14 },
    md: { width: 34, height: 34, fontSize: 16 },
    lg: { width: 42, height: 42, fontSize: 20 },
  }[size];

  const variantClass = {
    primary:  "btn-primary",
    secondary:"btn-secondary",
    ghost:    "btn-ghost",
    danger:   "btn-danger",
  }[variant] ?? "btn-ghost";

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      className={["btn", variantClass, "flex-shrink-0", className].join(" ")}
      style={{ ...sizeStyle, padding: 0, justifyContent: "center" }}
      {...rest}
    >
      {icon}
    </button>
  );
});

IconButton.displayName = "IconButton";

export default Button;