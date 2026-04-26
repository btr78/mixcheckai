import React, { useState, useEffect, useRef, useCallback } from "react";

// ─────────────────────────────────────────────────────────
// 🔑 PASTE YOUR STRIPE PAYMENT LINK HERE WHEN READY
const STRIPE_PAYMENT_LINK = "YOUR_STRIPE_PAYMENT_LINK_HERE";
const STRIPE_CONFIGURED = STRIPE_PAYMENT_LINK !== "YOUR_STRIPE_PAYMENT_LINK_HERE";
// ─────────────────────────────────────────────────────────

// ── SIMPLE HASH ROUTER ───────────────────────────────────
function useRouter() {
  const getPage = () => window.location.hash.replace("#", "") || "home";
  const [page, setPage] = useState(getPage);
  useEffect(() => {
    const handler = () => setPage(getPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  const navigate = (to) => { window.location.hash = to; window.scrollTo(0, 0); };
  return { page, navigate };
}

// ── SHARED NAV ───────────────────────────────────────────
function Nav({ navigate, page }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(7,9,15,0.93)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      padding: "0 20px", transition: "all 0.3s",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("home")} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 9 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#00e5a0,#00b880)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🎛️</div>
          <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 15, color: "#fff" }}>MixCheck <span style={{ color: "#00e5a0" }}>AI</span></span>
        </button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze"]].map(([p,label]) => (
            <button key={p} onClick={() => navigate(p)} style={{
              background: page === p ? "rgba(0,229,160,0.1)" : "none",
              border: page === p ? "1px solid rgba(0,229,160,0.25)" : "1px solid transparent",
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              color: page === p ? "#00e5a0" : "#6b7280",
              fontSize: 13, fontFamily: "sans-serif", fontWeight: page === p ? 600 : 400,
              transition: "all 0.2s",
            }}>{label}</button>
          ))}
          <button onClick={() => navigate("pricing")} style={{
            background: "#00e5a0", color: "#07090f",
            border: "none", borderRadius: 8, padding: "8px 16px",
            fontSize: 13, fontFamily: "sans-serif", fontWeight: 700, cursor: "pointer",
            marginLeft: 4,
          }}>Get Pro</button>
        </div>
      </div>
      <style>{`* { box-sizing: border-box; }
        @keyframes wave { from{transform:scaleY(0.35)} to{transform:scaleY(1)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        html{scroll-behavior:smooth}
      `}</style>
    </nav>
  );
}

// ── FOOTER ───────────────────────────────────────────────
function Footer({ navigate }) {
  return (
    <footer style={{ background: "#060810", borderTop: "1px solid #1a1f2e", padding: "40px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "linear-gradient(135deg,#00e5a0,#00b880)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🎛️</div>
            <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 14, color: "#fff" }}>MixCheck AI</span>
          </div>
          <p style={{ fontSize: 12, color: "#2a3040", fontFamily: "sans-serif", margin: 0 }}>Built for Filipino-Canadian church engineers 🇨🇦🇵🇭</p>
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze Free"]].map(([p,l]) => (
            <button key={p} onClick={() => navigate(p)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#4a5568", fontFamily: "sans-serif" }}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize: 11, color: "#1a1f2e", fontFamily: "monospace", letterSpacing: 1, margin: 0 }}>© 2026 MIXCHECK AI</p>
      </div>
    </footer>
  );
}

// ── PAGE: HOME ───────────────────────────────────────────
function HomePage({ navigate }) {
  const STEPS = [
    { num:"01", icon:"🎙️", title:"Upload Your Recording", desc:"Drop any file from your church livestream or rehearsal. MP3, WAV, AAC supported. No account needed." },
    { num:"02", icon:"📊", title:"AI Analyzes Your Mix", desc:"MixCheck measures integrated loudness, frequency balance, dynamic range, stereo width — in seconds." },
    { num:"03", icon:"🎛️", title:"Get QU-24 Settings", desc:"Receive exact Allen & Heath QU-24 recommendations: GEQ bands, HPF points, bus compressor, send levels." },
  ];
  const FEATS = [
    { icon:"📡", t:"Livestream Optimized", d:"Targets –16 LUFS for Facebook & YouTube." },
    { icon:"🎚️", t:"QU-24 Native Output", d:"Every suggestion maps to a real fader or GEQ band." },
    { icon:"📄", t:"PDF Cheat Sheet", d:"Printable — keep it on your console. Pro feature." },
    { icon:"🔁", t:"Before & After Compare", d:"Measure your improvement session to session." },
    { icon:"📱", t:"Works on Any Device", d:"Check mix notes on your phone between songs." },
    { icon:"🧠", t:"Plain English Advice", d:"No jargon. Just 'boost 2.5kHz on the snare by +2dB'." },
  ];

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", color:"#e8eaf0", fontFamily:"Georgia, serif" }}>
      {/* HERO */}
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 20px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(0,229,160,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />

        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:999, padding:"6px 16px", marginBottom:28, animation:"float 3s ease-in-out infinite" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0" }} />
          <span style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>Built for Church Sound Engineers 🇨🇦🇵🇭</span>
        </div>

        <h1 style={{ fontSize:"clamp(34px,7vw,70px)", fontWeight:900, lineHeight:1.05, margin:"0 0 20px", color:"#fff", maxWidth:780, letterSpacing:-2 }}>
          Your livestream mix,<br />
          <span style={{ color:"#00e5a0", fontStyle:"italic" }}>finally sounding right.</span>
        </h1>
        <p style={{ fontSize:"clamp(15px,2.5vw,19px)", color:"#6b7280", maxWidth:520, lineHeight:1.7, margin:"0 0 14px", fontFamily:"sans-serif" }}>
          Upload your recording. Get exact Allen & Heath QU-24 settings tailored to your room and your stream.
        </p>
        <p style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginBottom:36 }}>Used by Filipino-Canadian churches across Toronto, Vancouver & Calgary</p>

        {/* Waveform */}
        <div style={{ display:"flex", alignItems:"center", gap:3, height:44, marginBottom:40 }}>
          {[0.4,0.7,1,0.6,0.9,0.5,0.8,1,0.3,0.7,0.9,0.6,0.4,0.8,0.5,0.7,1,0.6,0.9,0.4].map((h,i)=>(
            <div key={i} style={{ width:3, height:`${h*100}%`, background:`rgba(0,229,160,${0.3+h*0.5})`, borderRadius:2, animation:`wave ${0.8+(i%5)*0.2}s ease-in-out infinite alternate`, animationDelay:`${i*0.05}s` }} />
          ))}
        </div>

        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", boxShadow:"0 0 32px rgba(0,229,160,0.25)" }}>
            Analyze My Mix — Free →
          </button>
          <button onClick={() => navigate("pricing")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
            View Pro Plans
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding:"100px 20px", background:"#07090f" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Three steps to a better stream.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {STEPS.map((s,i)=>(
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"28px 24px", position:"relative", overflow:"hidden", animation:`fadein 0.5s ease ${i*0.15}s both` }}>
                <div style={{ position:"absolute", top:18, right:18, fontSize:11, fontFamily:"monospace", fontWeight:700, color:"#1e2535" }}>{s.num}</div>
                <div style={{ fontSize:34, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:800, margin:"0 0 10px", color:"#fff", letterSpacing:-0.5 }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, margin:0, fontFamily:"sans-serif" }}>{s.desc}</p>
                <div style={{ position:"absolute", bottom:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,rgba(0,229,160,${0.15+i*0.1}),transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"80px 20px", background:"#060810" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>FEATURES</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Everything a volunteer engineer needs.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
            {FEATS.map((f,i)=>(
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"22px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
                <div style={{ fontSize:24, lineHeight:1, marginTop:2 }}>{f.icon}</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", marginBottom:5, fontFamily:"sans-serif" }}>{f.t}</div>
                  <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.6, fontFamily:"sans-serif" }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ padding:"80px 20px", textAlign:"center" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, letterSpacing:-1.5, margin:"0 0 18px", color:"#fff" }}>Ready to sound better this Sunday?</h2>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", marginBottom:32 }}>Free to start. No credit card. Works on your phone.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Analyze Free →</button>
            <button onClick={() => navigate("pricing")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>View Pro Plans</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── PAGE: ANALYZER ───────────────────────────────────────
function AnalyzePage({ navigate }) {
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  const analyze = useCallback(async (f) => {
    setFile(f); setAnalyzing(true); setResults(null);
    // Simulate analysis delay — replace with real Claude API call
    await new Promise(r => setTimeout(r, 2200));
    setResults({
      loudness: { lufs: -21.4, target: -16, status: "low" },
      peak: { db: -7.2, status: "ok" },
      dynamic: { range: 18.3, status: "high" },
      stereo: { width: 0.62, status: "ok" },
      qu24: [
        { channel:"Main LR Bus", action:"Push master fader from -5 dB to 0 dB. You're leaving 5 dB on the table.", priority:"high" },
        { channel:"Mix 7&8 Master", action:"Increase to +3 dB. Stream send is too quiet vs house mix.", priority:"high" },
        { channel:"Kick (Ch 1)", action:"HPF at 60 Hz. Add +3 dB at 80 Hz for punch. Cut -2 dB at 400 Hz (mud).", priority:"med" },
        { channel:"Lead Vocal (Ch 5)", action:"HPF at 120 Hz. Boost +2 dB at 3.5 kHz (presence). Bus compressor: 4:1, -18 dB threshold.", priority:"high" },
        { channel:"Keys / Pad (Ch 9)", action:"HPF at 200 Hz. GEQ: cut -3 dB at 250 Hz. Reduce Mix 7&8 send by -2 dB.", priority:"med" },
        { channel:"Overhead (Ch 7–8)", action:"HPF at 100 Hz. Cut -2 dB at 2 kHz (harshness). Reduce in livestream mix if cymbals dominate.", priority:"low" },
      ],
      geq: [
        { hz:"63",  adj:"+1.5", reason:"Add warmth to low end" },
        { hz:"125", adj:"0",    reason:"Leave flat" },
        { hz:"250", adj:"-2",   reason:"Cut mud — common in small rooms" },
        { hz:"500", adj:"-1",   reason:"Slight cut for clarity" },
        { hz:"1k",  adj:"0",    reason:"Leave flat" },
        { hz:"2k",  adj:"+1",   reason:"Slight boost for intelligibility" },
        { hz:"4k",  adj:"+2",   reason:"Presence — helps stream cut through" },
        { hz:"8k",  adj:"+1.5", reason:"Air and brightness" },
        { hz:"16k", adj:"+1",   reason:"Sheen on cymbals / overheads" },
      ],
    });
    setAnalyzing(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) analyze(f);
  }, [analyze]);

  const onPick = (e) => { if (e.target.files[0]) analyze(e.target.files[0]); };

  const statusColor = (s) => s === "high" ? "#ff5757" : s === "low" ? "#ffb347" : "#00e5a0";
  const prioColor = (p) => p === "high" ? "#ff5757" : p === "med" ? "#ffb347" : "#4a5568";

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:36 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>AUDIO ANALYZER</div>
          <h1 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, margin:"0 0 10px", letterSpacing:-1.5, color:"#fff" }}>Upload your mix.</h1>
          <p style={{ fontSize:14, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Get QU-24 settings in seconds. MP3 · WAV · AAC · M4A supported.</p>
        </div>

        {/* Drop zone */}
        {!results && !analyzing && (
          <div
            onClick={() => fileRef.current.click()}
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            style={{
              border: `2px dashed ${dragOver ? "#00e5a0" : "#1a1f2e"}`,
              borderRadius: 20, padding: "64px 32px",
              textAlign: "center", cursor: "pointer",
              background: dragOver ? "rgba(0,229,160,0.04)" : "#0d1017",
              transition: "all 0.2s", marginBottom: 32,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎵</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#e8eaf0", fontFamily: "sans-serif", marginBottom: 8 }}>
              Drop your audio file here
            </div>
            <div style={{ fontSize: 13, color: "#4a5568", fontFamily: "sans-serif", marginBottom: 20 }}>
              or tap to browse files
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#00e5a0", color: "#07090f", borderRadius: 8, padding: "10px 22px", fontSize: 13, fontWeight: 700, fontFamily: "sans-serif" }}>
              📂 Choose File
            </div>
            <input ref={fileRef} type="file" accept="audio/*" onChange={onPick} style={{ display: "none" }} />
          </div>
        )}

        {/* Analyzing state */}
        {analyzing && (
          <div style={{ textAlign: "center", padding: "80px 32px", background: "#0d1017", borderRadius: 20, border: "1px solid #1a1f2e", marginBottom: 32 }}>
            <div style={{ width: 40, height: 40, border: "3px solid #1a1f2e", borderTop: "3px solid #00e5a0", borderRadius: "50%", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0", fontFamily: "sans-serif", marginBottom: 8 }}>Analyzing {file?.name}</div>
            <div style={{ fontSize: 13, color: "#4a5568", fontFamily: "sans-serif" }}>Measuring loudness, frequency balance, dynamics...</div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ animation: "fadein 0.4s ease" }}>
            {/* Metrics row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label:"Integrated Loudness", val:`${results.loudness.lufs} LUFS`, target:"Target: –16 LUFS", status:results.loudness.status },
                { label:"True Peak", val:`${results.peak.db} dBTP`, target:"Target: < –1 dBTP", status:results.peak.status },
                { label:"Dynamic Range", val:`${results.dynamic.range} LU`, target:"Target: 8–12 LU", status:results.dynamic.status },
                { label:"Stereo Width", val:`${(results.stereo.width*100).toFixed(0)}%`, target:"Target: 50–80%", status:results.stereo.status },
              ].map((m, i) => (
                <div key={i} style={{ background:"#0d1017", border:`1px solid ${statusColor(m.status)}33`, borderRadius:12, padding:"16px" }}>
                  <div style={{ fontSize:10, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:8 }}>{m.label.toUpperCase()}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:statusColor(m.status), letterSpacing:-1, marginBottom:4 }}>{m.val}</div>
                  <div style={{ fontSize:10, color:"#2a3040", fontFamily:"sans-serif" }}>{m.target}</div>
                </div>
              ))}
            </div>

            {/* QU-24 recommendations */}
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"20px", marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:16 }}>🎛️ QU-24 CHANNEL RECOMMENDATIONS</div>
              {results.qu24.map((r, i) => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom: i < results.qu24.length-1 ? 14 : 0, marginBottom: i < results.qu24.length-1 ? 14 : 0, borderBottom: i < results.qu24.length-1 ? "1px solid #1a1f2e" : "none" }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:prioColor(r.priority), marginTop:5, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:3 }}>{r.channel}</div>
                    <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>{r.action}</div>
                  </div>
                  <div style={{ fontSize:9, color:prioColor(r.priority), fontFamily:"monospace", fontWeight:700, letterSpacing:1, marginLeft:"auto", flexShrink:0 }}>{r.priority.toUpperCase()}</div>
                </div>
              ))}
            </div>

            {/* GEQ table */}
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"20px", marginBottom:20 }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:16 }}>📊 MAIN LR BUS GEQ SUGGESTIONS</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(80px,1fr))", gap:10 }}>
                {results.geq.map((g, i) => {
                  const val = parseFloat(g.adj);
                  const isPos = val > 0, isNeg = val < 0;
                  return (
                    <div key={i} style={{ background:"#060810", borderRadius:10, padding:"12px 8px", textAlign:"center", border:`1px solid ${isPos?"rgba(0,229,160,0.2)":isNeg?"rgba(255,87,87,0.2)":"#1a1f2e"}` }}>
                      <div style={{ fontSize:10, color:"#4a5568", fontFamily:"monospace", marginBottom:6 }}>{g.hz} Hz</div>
                      <div style={{ fontSize:18, fontWeight:900, color:isPos?"#00e5a0":isNeg?"#ff5757":"#4a5568", letterSpacing:-0.5 }}>{isPos?"+":""}{g.adj}</div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif", marginTop:4, lineHeight:1.3 }}>{g.reason.split("—")[0]}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pro upsell */}
            <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1px solid rgba(0,229,160,0.25)", borderRadius:16, padding:"20px", marginBottom:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>📄 Get the full PDF cheat sheet</div>
                  <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>All QU-24 settings formatted for printing — take it to your console. Pro feature.</div>
                </div>
                <button onClick={() => navigate("pricing")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                  Upgrade to Pro →
                </button>
              </div>
            </div>

            {/* Analyze another */}
            <button onClick={() => { setFile(null); setResults(null); }} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"12px 24px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
              ← Analyze Another File
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PAGE: PRICING ────────────────────────────────────────
function PricingPage({ navigate }) {
  const [annual, setAnnual] = useState(false);
  const monthly = 9.99;
  const price = annual ? (monthly * 0.8).toFixed(2) : monthly.toFixed(2);

  const PRO = [
    { icon:"📄", text:"Printable QU-24 cheat sheet PDF" },
    { icon:"🔁", text:"Unlimited uploads — analyze every rehearsal" },
    { icon:"📊", text:"Before & after comparison tool" },
    { icon:"🎚️", text:"Per-channel HPF recommendations" },
    { icon:"💾", text:"Session history — last 30 analyses" },
    { icon:"📧", text:"Priority support from a church engineer" },
    { icon:"🆕", text:"All future features included" },
  ];

  const TESTIMONIALS = [
    { name:"Kuya Mark", church:"UCCP Toronto", text:"Our stream went from -23 LUFS to -16 in one Sunday.", a:"🇵🇭" },
    { name:"Ate Bea", church:"Victory Vancouver", text:"I don't know audio. MixCheck told me exactly which knobs to turn. Grabe!", a:"🎛️" },
    { name:"Pastor Dave", church:"CFC Calgary", text:"Our Facebook comments finally stopped saying 'can't hear anything'.", a:"🙏" },
  ];

  const FAQ = [
    { q:"Do I need a credit card for free?", a:"No. Just upload a file and go. No account needed for the free tier." },
    { q:"Can I cancel anytime?", a:"Yes. Cancel from your Stripe customer portal — no emails needed." },
    { q:"Is my audio stored on your servers?", a:"Files are analyzed and immediately discarded. We never store your recordings." },
    { q:"I'm a volunteer, not a pro. Is this for me?", a:"This is literally built for you. No audio degree required — plain English only." },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <style>{`@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,229,160,0.15)}50%{box-shadow:0 0 40px rgba(0,229,160,0.35)}}`}</style>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 20px 80px" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>PRICING</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-2, color:"#fff", lineHeight:1.05 }}>
            Simple pricing.<br />
            <span style={{ background:"linear-gradient(90deg,#00e5a0,#4a7cff,#00e5a0)", backgroundSize:"200%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", animation:"shimmer 3s linear infinite" }}>No surprises.</span>
          </h1>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", maxWidth:440, margin:"0 auto 28px" }}>Billed in Canadian dollars. Cancel anytime via Stripe.</p>

          {/* Toggle */}
          <div style={{ display:"inline-flex", alignItems:"center", gap:0, background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:99, padding:"5px" }}>
            {[["Monthly",false],["Annual — Save 20%",true]].map(([label,val]) => (
              <button key={label} onClick={() => setAnnual(val)} style={{ background:annual===val?"#1a1f2e":"transparent", border:"none", borderRadius:99, padding:"7px 18px", color:annual===val?"#fff":"#4a5568", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:8 }}>
                {label} {val && annual && <span style={{ background:"rgba(0,229,160,0.15)", color:"#00e5a0", fontSize:10, padding:"2px 8px", borderRadius:99 }}>✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginBottom:52 }}>
          {/* Free */}
          <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:20, padding:"30px 26px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#4a5568", fontFamily:"sans-serif", marginBottom:8 }}>Free</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
              <span style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2 }}>$0</span>
            </div>
            <div style={{ height:1, background:"#1a1f2e", marginBottom:20 }} />
            {["3 uploads per month","Loudness & frequency report","Basic QU-24 suggestions"].map((f,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:11 }}>
                <span style={{ color:"#2a3040" }}>✓</span>
                <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>{f}</span>
              </div>
            ))}
            <button onClick={() => navigate("analyze")} style={{ width:"100%", marginTop:22, background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"12px", color:"#4a5568", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Start Free</button>
          </div>

          {/* Pro */}
          <div style={{ background:"linear-gradient(160deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1.5px solid rgba(0,229,160,0.35)", borderRadius:20, padding:"30px 26px", position:"relative", animation:"glow 3s ease-in-out infinite" }}>
            <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#00e5a0,#00c080)", color:"#07090f", fontSize:10, fontWeight:800, fontFamily:"monospace", letterSpacing:2, padding:"4px 18px", borderRadius:"0 0 10px 10px" }}>✦ MOST POPULAR</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:8 }}>Pro</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2 }}>${price}</span>
              <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>CAD / mo</span>
            </div>
            {annual && <div style={{ fontSize:11, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Billed ${(price*12).toFixed(2)} CAD/year</div>}
            <div style={{ height:1, background:"rgba(0,229,160,0.15)", margin:"18px 0" }} />
            {PRO.map((f,i)=>(
              <div key={i} style={{ display:"flex", gap:10, marginBottom:11, alignItems:"flex-start" }}>
                <span style={{ fontSize:13 }}>{f.icon}</span>
                <span style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.5 }}>{f.text}</span>
              </div>
            ))}
            <button
              onClick={() => STRIPE_CONFIGURED ? window.open(STRIPE_PAYMENT_LINK,"_blank") : alert("Stripe not configured yet — add your payment link to the STRIPE_PAYMENT_LINK variable.")}
              style={{ width:"100%", marginTop:24, background:"linear-gradient(135deg,#00e5a0,#00c080)", border:"none", borderRadius:12, padding:"14px", color:"#07090f", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer", boxShadow:"0 4px 24px rgba(0,229,160,0.3)" }}
            >
              {STRIPE_CONFIGURED ? `Upgrade to Pro — $${price} CAD/mo →` : "⚙️ Configure Stripe to Enable"}
            </button>
            <div style={{ display:"flex", justifyContent:"center", gap:16, marginTop:14 }}>
              {["🔒 Stripe","🇨🇦 CAD","↩️ Cancel anytime"].map((t,i)=>(
                <span key={i} style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div style={{ marginBottom:52 }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>WHAT ENGINEERS SAY</div>
            <h2 style={{ fontSize:"clamp(20px,3vw,32px)", fontWeight:900, margin:0, letterSpacing:-1, color:"#fff" }}>From Filipino-Canadian churches 🇨🇦🇵🇭</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14 }}>
            {TESTIMONIALS.map((t,i)=>(
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"22px 20px" }}>
                <div style={{ fontSize:26, marginBottom:14 }}>{t.a}</div>
                <p style={{ fontSize:13, color:"#8892a4", fontFamily:"sans-serif", lineHeight:1.7, margin:"0 0 14px", fontStyle:"italic" }}>"{t.text}"</p>
                <div style={{ fontSize:13, color:"#e8eaf0", fontWeight:700, fontFamily:"sans-serif" }}>{t.name}</div>
                <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>{t.church}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:28 }}>
            <h2 style={{ fontSize:28, fontWeight:900, margin:0, letterSpacing:-1, color:"#fff" }}>Common questions</h2>
          </div>
          {FAQ.map((f,i)=>(
            <div key={i} style={{ borderBottom: i<FAQ.length-1?"1px solid #1a1f2e":"none" }}>
              <button onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{ width:"100%", background:"none", border:"none", padding:"17px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, textAlign:"left" }}>
                <span style={{ fontSize:14, fontWeight:600, color:"#e8eaf0", fontFamily:"sans-serif" }}>{f.q}</span>
                <span style={{ color:openFaq===i?"#00e5a0":"#2a3040", fontSize:18, flexShrink:0 }}>{openFaq===i?"−":"+"}</span>
              </button>
              {openFaq===i && <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, margin:"0 0 16px", paddingRight:24 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PAGE: SUCCESS ────────────────────────────────────────
function SuccessPage({ navigate }) {
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center", maxWidth:500 }}>
        <div style={{ width:80, height:80, borderRadius:"50%", background:"rgba(0,229,160,0.1)", border:"2px solid rgba(0,229,160,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 28px", fontSize:36, animation:"float 3s ease-in-out infinite" }}>🎉</div>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-1.5, color:"#fff" }}>Welcome to Pro!</h1>
        <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, marginBottom:32 }}>
          Your subscription is active. You now have unlimited uploads, PDF exports, and all Pro features. Check your email for your receipt.
        </p>
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Start Analyzing →</button>
          <button onClick={() => navigate("home")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Go Home</button>
        </div>
        <p style={{ marginTop:28, fontSize:11, color:"#1a1f2e", fontFamily:"monospace", letterSpacing:1 }}>MIXCHECK AI · 🇨🇦🇵🇭</p>
      </div>
    </div>
  );
}

// ── APP ROOT ─────────────────────────────────────────────
export default function App() {
  const { page, navigate } = useRouter();

  const renderPage = () => {
    switch (page) {
      case "home":    return <HomePage navigate={navigate} />;
      case "analyze": return <AnalyzePage navigate={navigate} />;
      case "pricing": return <PricingPage navigate={navigate} />;
      case "success": return <SuccessPage navigate={navigate} />;
      default:        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div>
      <Nav navigate={navigate} page={page} />
      {renderPage()}
      {page !== "success" && <Footer navigate={navigate} />}
    </div>
  );
}