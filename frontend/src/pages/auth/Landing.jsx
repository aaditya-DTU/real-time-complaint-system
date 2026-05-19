import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";

const FEATURES = [
  {
    icon: "⚡",
    title: "Auto-Escalation",
    desc: "Complaints breach SLA → instantly escalated to the right authority.",
    accent: "#ef4444",
  },
  {
    icon: "🔔",
    title: "Real-Time Updates",
    desc: "Socket-powered live notifications for every status change.",
    accent: "#f59e0b",
  },
  {
    icon: "📊",
    title: "SLA Enforcement",
    desc: "Configurable deadlines per type and priority. Zero missed obligations.",
    accent: "#3b82f6",
  },
  {
    icon: "🔒",
    title: "Audit Trail",
    desc: "Immutable logs track every action — who, what, when.",
    accent: "#22c55e",
  },
];

const STATS = [
  { value: "< 2s",  label: "Escalation lag" },
  { value: "100%",  label: "Audit coverage" },
  { value: "4",     label: "Role tiers" },
  { value: "Live",  label: "SLA tracking" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight:   "100vh",
      background:  "var(--color-bg)",
      color:       "var(--color-text-primary)",
      overflowX:   "hidden",
      backgroundImage: [
        "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(245,158,11,0.08) 0%, transparent 60%)",
        "radial-gradient(ellipse 50% 40% at 10% 80%, rgba(59,130,246,0.05) 0%, transparent 60%)",
      ].join(", "),
    }}>

      {/* ── Nav ── */}
      <nav style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "1.25rem 2rem",
        borderBottom:   "1px solid var(--color-border)",
        position:       "sticky", top: 0, zIndex: 10,
        background:     "rgba(13,15,20,0.85)",
        backdropFilter: "blur(12px)",
      }}>
        <span style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "1.3rem",
          fontWeight:    800,
          letterSpacing: "-0.04em",
          color:         "var(--color-accent)",
        }}>
          RTCS
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate("/register")}>
            Get Started
          </Button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        maxWidth:  900,
        margin:    "0 auto",
        padding:   "6rem 2rem 4rem",
        textAlign: "center",
      }}>
        {/* Badge */}
        <div style={{
          display:       "inline-flex",
          alignItems:    "center",
          gap:           "0.4rem",
          padding:       "0.3rem 0.875rem",
          borderRadius:  99,
          background:    "var(--color-accent-glow)",
          border:        "1px solid rgba(245,158,11,0.25)",
          fontSize:      "0.75rem",
          fontWeight:    700,
          color:         "var(--color-accent)",
          letterSpacing: "0.05em",
          marginBottom:  "1.75rem",
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "var(--color-accent)",
            animation:  "sla-pulse 2s ease-in-out infinite",
          }} />
          Real-time · SLA-enforced · Fully audited
        </div>

        <h1 style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "clamp(2.2rem, 6vw, 3.8rem)",
          fontWeight:    800,
          letterSpacing: "-0.04em",
          lineHeight:    1.1,
          marginBottom:  "1.25rem",
        }}>
          Complaints that{" "}
          <span style={{
            color:          "var(--color-accent)",
            textDecoration: "underline",
            textDecorationStyle: "wavy",
            textDecorationColor: "rgba(245,158,11,0.4)",
          }}>
            never get lost
          </span>
        </h1>

        <p style={{
          fontSize:     "clamp(1rem, 2vw, 1.2rem)",
          color:        "var(--color-text-secondary)",
          lineHeight:   1.65,
          maxWidth:     600,
          margin:       "0 auto 2.5rem",
        }}>
          RTCS automatically escalates unresolved complaints, enforces
          SLA deadlines, and keeps every stakeholder informed in real time.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="primary" size="lg" onClick={() => navigate("/register")}>
            Start for free →
          </Button>
          <Button variant="secondary" size="lg" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{
        maxWidth:     900,
        margin:       "0 auto 5rem",
        padding:      "0 2rem",
      }}>
        <div style={{
          display:      "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          background:   "var(--color-surface)",
          border:       "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          overflow:     "hidden",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{
              padding:     "1.25rem 1rem",
              textAlign:   "center",
              borderRight: i < STATS.length - 1 ? "1px solid var(--color-border)" : "none",
            }}>
              <div style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "1.75rem",
                fontWeight:    800,
                letterSpacing: "-0.04em",
                color:         "var(--color-accent)",
              }}>
                {s.value}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.2rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        maxWidth: 960,
        margin:   "0 auto 6rem",
        padding:  "0 2rem",
      }}>
        <h2 style={{
          fontFamily:    "var(--font-display)",
          fontSize:      "clamp(1.4rem, 3vw, 2rem)",
          fontWeight:    800,
          letterSpacing: "-0.03em",
          textAlign:     "center",
          marginBottom:  "2.5rem",
        }}>
          Built for accountability
        </h2>

        <div style={{
          display:             "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap:                 "1rem",
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="card" style={{
              padding:  "1.5rem",
              display:  "flex",
              flexDirection: "column",
              gap:      "0.75rem",
              borderTop: `2px solid ${f.accent}`,
            }}>
              <div style={{
                width:          44, height: 44,
                borderRadius:   "var(--radius-md)",
                background:     `${f.accent}15`,
                border:         `1px solid ${f.accent}30`,
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       "1.25rem",
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontFamily:    "var(--font-display)",
                fontSize:      "1rem",
                fontWeight:    700,
                letterSpacing: "-0.02em",
                margin:        0,
                color:         "var(--color-text-primary)",
              }}>
                {f.title}
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", lineHeight: 1.55, margin: 0 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Workflow ── */}
      <section style={{
        maxWidth:    800,
        margin:      "0 auto 6rem",
        padding:     "0 2rem",
        textAlign:   "center",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
          letterSpacing: "-0.03em", marginBottom: "2rem",
        }}>
          How it works
        </h2>

        <div style={{
          display: "flex", alignItems: "flex-start",
          justifyContent: "center", gap: 0, flexWrap: "wrap",
        }}>
          {[
            { step: "01", label: "Submit", desc: "Student files a complaint" },
            { step: "02", label: "Assign",  desc: "Staff gets notified instantly" },
            { step: "03", label: "SLA Check", desc: "Background job monitors deadline" },
            { step: "04", label: "Escalate", desc: "Auto-escalate if SLA breaches" },
            { step: "05", label: "Resolve",  desc: "Audit log captures everything" },
          ].map((w, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ width: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--color-surface-2)",
                  border: "1.5px solid var(--color-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "var(--font-mono)", fontSize: "0.75rem",
                  fontWeight: 700, color: "var(--color-accent)",
                }}>
                  {w.step}
                </div>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-text-primary)" }}>{w.label}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", lineHeight: 1.4 }}>{w.desc}</span>
              </div>
              {i < arr.length - 1 && (
                <div style={{
                  width: 32, height: 1,
                  background: "var(--color-border)",
                  marginTop: 20, flexShrink: 0,
                }} />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        maxWidth:    640,
        margin:      "0 auto 6rem",
        padding:     "3rem 2rem",
        textAlign:   "center",
        background:  "var(--color-surface)",
        border:      "1px solid var(--color-border)",
        borderRadius: "var(--radius-xl)",
      }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "1.6rem", letterSpacing: "-0.03em", marginBottom: "0.75rem",
        }}>
          Ready to end complaint chaos?
        </h2>
        <p style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)", marginBottom: "1.75rem" }}>
          Set up in minutes. SLA automation runs from day one.
        </p>
        <Button variant="primary" size="lg" onClick={() => navigate("/register")}>
          Create your account →
        </Button>
      </section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop:   "1px solid var(--color-border)",
        padding:     "1.5rem 2rem",
        textAlign:   "center",
        fontSize:    "0.75rem",
        color:       "var(--color-text-muted)",
      }}>
        RTCS · Real-Time Complaint Escalation System
      </footer>
    </div>
  );
}