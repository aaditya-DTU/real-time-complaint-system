import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";

export default function Login() {
  const { login, loading, error } = useAuth();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [fieldErr, setFieldErr] = useState({});

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setFieldErr((p) => ({ ...p, [k]: "" }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      await login(form);     // AuthContext handles redirect + socket
    } catch { /* error shown via `error` state */ }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Heading */}
      <div>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0,
          color: "var(--color-text-primary)",
        }}>
          Welcome back
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          Sign in to your RTCS account
        </p>
      </div>

      {/* Server error */}
      {error && (
        <div style={{
          padding:     "0.75rem 1rem",
          background:  "var(--color-danger-dim)",
          border:      "1px solid rgba(239,68,68,0.25)",
          borderRadius: "var(--radius-md)",
          fontSize:    "0.85rem",
          color:       "var(--color-danger)",
          display:     "flex", gap: "0.5rem", alignItems: "center",
        }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@college.edu"
            autoComplete="email"
            style={fieldErr.email ? { borderColor: "var(--color-danger)" } : {}}
          />
          {fieldErr.email && <span className="form-error">{fieldErr.email}</span>}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              autoComplete="current-password"
              style={{
                paddingRight: "2.5rem",
                ...(fieldErr.password ? { borderColor: "var(--color-danger)" } : {}),
              }}
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              style={{
                position: "absolute", right: "0.75rem", top: "50%",
                transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer",
                color: "var(--color-text-muted)", fontSize: "0.875rem",
                padding: 0,
              }}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {fieldErr.password && <span className="form-error">{fieldErr.password}</span>}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={loading}
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>
          New to RTCS?
        </span>
        <div className="divider" style={{ flex: 1, margin: 0 }} />
      </div>

      <Link
        to="/register"
        style={{ textDecoration: "none" }}
      >
        <Button variant="secondary" size="md" fullWidth>
          Create an account
        </Button>
      </Link>
    </div>
  );
}