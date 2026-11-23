import React, { Suspense, useEffect, useRef, useState } from "react";
import { CONFIG } from "./config";
import { startScrollTracking } from "./scrollState";

const Scene = React.lazy(() => import("./Scene.jsx"));

function hasWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch { return false; }
}

class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="fallback" /> : this.props.children; }
}

function Copy({ s }) {
  return (
    <section id={s.id} className={`panel ${s.side}`}>
      <div className="copy">
        <p className="label">{s.label}</p>
        <h2>{s.title}</h2>
        <p>{s.body}</p>
      </div>
    </section>
  );
}

/* ---------- spacecraft schematic (not to scale) ---------- */
function Craft({ kind }) {
  const panel = { fill: "none", stroke: "var(--ivory)", strokeWidth: 1.5 };
  const body = { fill: "rgba(241,234,216,.12)", stroke: "var(--ivory)", strokeWidth: 1.5 };
  const grid = { stroke: "var(--muted)", strokeWidth: 0.6 };
  return (
    <svg viewBox="0 0 240 140" role="img" aria-label={`Schematic of the ${kind} spacecraft, not to scale`} className="craft">
      {kind === "juno" && (
        <g>
          {[0, 120, 240].map((a) => (
            <g key={a} transform={`rotate(${a - 90} 120 70)`}>
              <rect x="136" y="63" width="78" height="14" {...panel} />
              {[1, 2, 3, 4, 5].map((i) => <line key={i} x1={136 + i * 13} y1="63" x2={136 + i * 13} y2="77" {...grid} />)}
            </g>
          ))}
          <polygon points="120,54 134,62 134,78 120,86 106,78 106,62" {...body} />
          <circle cx="120" cy="70" r="4" fill="var(--ivory)" />
        </g>
      )}
      {kind === "juice" && (
        <g>
          <rect x="12" y="58" width="84" height="24" {...panel} />
          <rect x="144" y="58" width="84" height="24" {...panel} />
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <g key={i}>
              <line x1={12 + i * 12} y1="58" x2={12 + i * 12} y2="82" {...grid} />
              <line x1={144 + i * 12} y1="58" x2={144 + i * 12} y2="82" {...grid} />
            </g>
          ))}
          <rect x="102" y="46" width="36" height="48" rx="4" {...body} />
          <line x1="120" y1="46" x2="120" y2="16" {...panel} />
          <circle cx="120" cy="14" r="8" {...body} />
        </g>
      )}
      {kind === "clipper" && (
        <g>
          <rect x="10" y="52" width="92" height="36" {...panel} />
          <rect x="138" y="52" width="92" height="36" {...panel} />
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <g key={i}>
              <line x1={10 + i * 11.5} y1="52" x2={10 + i * 11.5} y2="88" {...grid} />
              <line x1={138 + i * 11.5} y1="52" x2={138 + i * 11.5} y2="88" {...grid} />
            </g>
          ))}
          <rect x="104" y="48" width="32" height="44" rx="3" {...body} />
          <circle cx="120" cy="34" r="12" {...body} />
        </g>
      )}
    </svg>
  );
}

/* ---------- mission card + dialog ---------- */
function MissionCard({ m, onOpen }) {
  return (
    <button type="button" className="mission-card" onClick={() => onOpen(m)} aria-haspopup="dialog">
      <span className="label">{m.agency} · {m.status}</span>
      <span className="mc-title">{m.name}</span>
      <span className="mc-text">{m.text}</span>
      <span className="mc-more">View mission details →</span>
    </button>
  );
}

function MissionDialog({ mission, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (mission && !d.open) d.showModal();          // focus trap + Esc built in
    if (!mission && d.open) d.close();
  }, [mission]);

  const onBackdrop = (e) => { if (e.target === ref.current) onClose(); };

  return (
    <dialog ref={ref} className="mission-dialog" aria-labelledby="mission-title"
            onClose={onClose} onClick={onBackdrop}>
      {mission && (
        <div className="md-inner">
          <button type="button" className="md-close" onClick={onClose} aria-label="Close mission details">✕</button>
          <p className="label">{mission.agency} · {mission.status}</p>
          <h3 id="mission-title">{mission.name}</h3>

          <dl className="md-dates">
            <div><dt>Launch</dt><dd>{mission.launch}</dd></div>
            <div><dt>Jupiter arrival</dt><dd>{mission.arrival}</dd></div>
          </dl>

          <p className="md-overview">{mission.overview}</p>

          <h4>Science goals</h4>
          <ul>{mission.goals.map((g) => <li key={g}>{g}</li>)}</ul>

          <h4>The spacecraft</h4>
          <div className="md-robot">
            <Craft kind={mission.craft} />
            <div>
              <p className="md-robot-title">{mission.robot.title}</p>
              <p>{mission.robot.blurb}</p>
              <dl className="md-specs">
                {mission.robot.specs.map((s) => (<div key={s.k}><dt>{s.k}</dt><dd>{s.v}</dd></div>))}
              </dl>
            </div>
          </div>
          <p className="chips" aria-label="Instruments">
            {mission.robot.instruments.map((i) => <span key={i}>{i}</span>)}
          </p>
          <p className="md-note">{CONFIG.missionNote} Schematic is illustrative, not to scale.</p>
        </div>
      )}
    </dialog>
  );
}

/* ---------- briefing form (unchanged behaviour) ---------- */
function Briefing() {
  const f = CONFIG.briefing;
  const [status, setStatus] = useState({ type: "idle", msg: "" });
  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("name") || !/^\S+@\S+\.\S+$/.test(fd.get("email") || "")) {
      setStatus({ type: "error", msg: "Please enter your name and a valid email." });
      return;
    }
    setStatus({ type: "info", msg: "Demo only: your request was validated but not sent. Connect a backend to enable submission." });
  };
  return (
    <section id="briefing" className="panel center">
      <form className="copy form" onSubmit={onSubmit} noValidate>
        <p className="label">06 — BRIEFING</p>
        <h2>{f.title}</h2>
        <p className="note">{f.note}</p>
        {f.fields.map((fl) => (
          <label key={fl.name}>
            <span>{fl.label}{fl.required && " *"}</span>
            {fl.type === "select" ? (
              <select name={fl.name}>{fl.options.map((o) => <option key={o}>{o}</option>)}</select>
            ) : (
              <input name={fl.name} type={fl.type} required={fl.required} />
            )}
          </label>
        ))}
        <button className="cta" type="submit">Send request</button>
        <p role="status" aria-live="polite" className={`status ${status.type}`}>{status.msg}</p>
      </form>
    </section>
  );
}

/* ---------- interactive footer ---------- */
function Footer({ ring, setRing, palette, setPalette }) {
  const [factIdx, setFactIdx] = useState(0);
  const [pct, setPct] = useState(0);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.round((window.scrollY / max) * 100) : 0;
      setPct(Math.min(100, Math.max(0, p))); // only re-renders when the % changes
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied("Link copied.");
    } catch {
      setCopied("Could not copy automatically. Copy the address from your browser bar.");
    }
    setTimeout(() => setCopied(""), 3000);
  };

  const facts = CONFIG.funFacts;
  const cycle = palette === "natural" ? "infrared" : palette === "infrared" ? "ultraviolet" : "natural";

  return (
    <footer className="footer">
      <div className="progress" aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>

      <div className="footer-grid">
        <div>
          <p className="label">JUPITER · concept</p>
          <p className="fact" aria-live="polite">{facts[factIdx]}</p>
          <button type="button" className="chip-btn" onClick={() => setFactIdx((factIdx + 1) % facts.length)}>
            Another fact ↻
          </button>
        </div>

        <nav aria-label="Footer">
          <p className="label">Explore</p>
          <ul>
            {[...CONFIG.nav, { label: "Briefing", href: "#briefing" }].map((n) => (
              <li key={n.href}><a href={n.href}>{n.label}</a></li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="label">Scene controls</p>
          <div className="btn-row">
            <button type="button" className="chip-btn" aria-pressed={ring} onClick={() => setRing(!ring)}>
              Ring: {ring ? "on" : "off"}
            </button>
            <button type="button" className="chip-btn" onClick={() => setPalette(cycle)}>
              Palette: {palette} →
            </button>
          </div>
          <div className="btn-row">
            <button type="button" className="chip-btn" onClick={copyLink}>Copy page link</button>
            <button type="button" className="chip-btn" onClick={toTop}>Back to top ↑</button>
          </div>
          <p role="status" aria-live="polite" className="status info">{copied}</p>
        </div>
      </div>

      <p className="legal">{CONFIG.footer} · Tour progress {pct}%</p>
    </footer>
  );
}

export default function App() {
  const [palette, setPalette] = useState("natural");
  const [ring, setRing] = useState(true);
  const [mission, setMission] = useState(null);
  const [webgl] = useState(hasWebGL);
  const [reduced, setReduced] = useState(false);

  useEffect(() => startScrollTracking(), []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  return (
    <>
      <div className="stage">
        {webgl ? (
          <Boundary>
            <Suspense fallback={<div className="fallback" />}>
              <Scene palette={palette} reduced={reduced} ring={ring} />
            </Suspense>
          </Boundary>
        ) : <div className="fallback" />}
        <div className="vignette" />
      </div>

      <header className="nav">
        <a className="logo" href="#top">{CONFIG.brand}</a>
        <nav aria-label="Primary">
          {CONFIG.nav.map((n) => <a key={n.href} href={n.href}>{n.label}</a>)}
        </nav>
        <a className="cta light" href={CONFIG.cta.href}>{CONFIG.cta.label}</a>
      </header>

      <main id="top">
        <section className="panel hero">
          <h1 className="wordmark" aria-label={CONFIG.brand}>{CONFIG.brand}</h1>
          <div className="hero-bottom">
            <p>{CONFIG.tagline}</p>
            <a className="cta" href="#atmosphere">Begin the tour ↓</a>
          </div>
        </section>

        {CONFIG.sections.map((s) => <Copy key={s.id} s={s} />)}

        <section id="palette" className={`panel ${CONFIG.paletteCopy.side}`}>
          <div className="copy">
            <p className="label">{CONFIG.paletteCopy.label}</p>
            <h2>{CONFIG.paletteCopy.title}</h2>
            <p>{CONFIG.paletteCopy.body}</p>
            <div role="radiogroup" aria-label="Palette" className="swatches">
              {CONFIG.palettes.map((p) => (
                <button
                  key={p.id} type="button" role="radio" aria-checked={palette === p.id}
                  aria-label={`${p.label} palette`} title={p.label}
                  className={`swatch ${palette === p.id ? "on" : ""}`}
                  style={{ "--c": p.swatch }}
                  onClick={() => setPalette(p.id)}
                />
              ))}
            </div>
            <p className="label" aria-live="polite">Selected: {palette}</p>
          </div>
        </section>

        <section id="missions" className="panel center">
          <div className="copy wide">
            <p className="label">05 — MISSIONS</p>
            <h2>Robots on the way.</h2>
            <dl className="facts">
              {CONFIG.facts.map((f) => (<div key={f.k}><dt>{f.k}</dt><dd>{f.v}</dd></div>))}
            </dl>
            <div className="cards">
              {CONFIG.missions.map((m) => <MissionCard key={m.id} m={m} onOpen={setMission} />)}
            </div>
          </div>
        </section>

        <Briefing />
      </main>

      <MissionDialog mission={mission} onClose={() => setMission(null)} />
      <Footer ring={ring} setRing={setRing} palette={palette} setPalette={setPalette} />
    </>
  );
}