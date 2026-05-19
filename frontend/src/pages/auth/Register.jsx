import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth.api";
import Button from "../../components/common/Button";
import { ROLES, ROLE_LABELS } from "../../utils/constants";

const DEPARTMENTS = [
  "Computer Science", "Information Technology", "Electronics",
  "Mechanical", "Civil", "Chemical", "Mathematics",
  "Physics", "Administration", "Hostel", "Other",
];

const REGISTER_ROLES = [ROLES.STUDENT, ROLES.STAFF];

// ── Defined OUTSIDE component — fixes cursor jump on re-render ──

function Field({ id, label, error, children }) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>{label}</label>
      {children}
      {error && <span className="form-error">{error}</span>}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    password.length >= 6,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score  = checks.filter(Boolean).length;
  const colors = ["var(--color-danger)", "var(--color-warning)", "var(--color-warning)", "var(--color-success)"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i < score ? colors[score - 1] : "var(--color-surface-3)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <span style={{ fontSize: "0.7rem", color: score > 0 ? colors[score - 1] : "var(--color-text-muted)" }}>
        {score > 0 ? labels[score - 1] : ""}
      </span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
    role: ROLES.STUDENT, department: "",
  });
  const [showPass,  setShowPass]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [serverErr, setServerErr] = useState("");
  const [fieldErr,  setFieldErr]  = useState({});

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setFieldErr((p) => ({ ...p, [k]: "" }));
    setServerErr("");
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())     errs.name       = "Full name is required";
    if (!form.email)           errs.email      = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password)        errs.password   = "Password is required";
    else if (form.password.length < 6)         errs.password = "Minimum 6 characters";
    if (form.password !== form.confirm)        errs.confirm = "Passwords do not match";
    if (!form.department)      errs.department = "Select your department";
    setFieldErr(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { confirm, ...payload } = form;
      await registerUser(payload);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setServerErr(err?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-0.03em", margin: 0, color: "var(--color-text-primary)" }}>
          Create account
        </h2>
        <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
          Join RTCS to submit and track complaints
        </p>
      </div>

      {serverErr && (
        <div style={{ padding: "0.75rem 1rem", background: "var(--color-danger-dim)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--radius-md)", fontSize: "0.85rem", color: "var(--color-danger)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
          <span>⚠️</span> {serverErr}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>

        {/* Role toggle */}
        <Field id="role" label="I am a…" error={fieldErr.role}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {REGISTER_ROLES.map((r) => (
              <button
                key={r} type="button"
                onClick={() => setForm((p) => ({ ...p, role: r }))}
                style={{
                  flex: 1, padding: "0.55rem",
                  borderRadius: "var(--radius-md)",
                  border: `1.5px solid ${form.role === r ? "var(--color-accent)" : "var(--color-border)"}`,
                  background: form.role === r ? "var(--color-accent-glow)" : "var(--color-surface-2)",
                  color: form.role === r ? "var(--color-accent)" : "var(--color-text-secondary)",
                  fontWeight: form.role === r ? 700 : 500,
                  fontSize: "0.85rem", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </Field>

        <Field id="name" label="Full Name" error={fieldErr.name}>
          <input
            id="name" type="text" value={form.name} onChange={set("name")}
            placeholder="Arjun Sharma" autoComplete="name"
            style={fieldErr.name ? { borderColor: "var(--color-danger)" } : {}}
          />
        </Field>

        <Field id="email" label="Email" error={fieldErr.email}>
          <input
            id="email" type="email" value={form.email} onChange={set("email")}
            placeholder="you@college.edu" autoComplete="email"
            style={fieldErr.email ? { borderColor: "var(--color-danger)" } : {}}
          />
        </Field>

        <Field id="department" label="Department" error={fieldErr.department}>
          <select
            id="department" value={form.department} onChange={set("department")}
            style={fieldErr.department ? { borderColor: "var(--color-danger)" } : {}}
          >
            <option value="">Select department…</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>

        <Field id="password" label="Password" error={fieldErr.password}>
          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPass ? "text" : "password"}
              value={form.password} onChange={set("password")}
              placeholder="Min. 6 characters" autoComplete="new-password"
              style={{ paddingRight: "2.5rem", ...(fieldErr.password ? { borderColor: "var(--color-danger)" } : {}) }}
            />
            <button
              type="button" onClick={() => setShowPass((p) => !p)}
              style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", fontSize: "0.875rem", padding: 0 }}
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
        </Field>

        <Field id="confirm" label="Confirm Password" error={fieldErr.confirm}>
          <input
            id="confirm" type="password" value={form.confirm} onChange={set("confirm")}
            placeholder="Re-enter password" autoComplete="new-password"
            style={fieldErr.confirm ? { borderColor: "var(--color-danger)" } : {}}
          />
        </Field>

        {form.password.length > 0 && <PasswordStrength password={form.password} />}

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} style={{ marginTop: "0.25rem" }}>
          Create account
        </Button>
      </form>

      <p style={{ textAlign: "center", fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--color-accent)", fontWeight: 600 }}>Sign in</Link>
      </p>
    </div>
  );
}