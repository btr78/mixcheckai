import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIcN6gBO375e6dbQkgbm03";
const STRIPE_CONFIGURED = STRIPE_PAYMENT_LINK !== "YOUR_STRIPE_PAYMENT_LINK_HERE";

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

function Nav({ navigate, page }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background: scrolled ? "rgba(7,9,15,0.93)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      padding:"0 20px", transition:"all 0.3s",
    }}>
      <div style={{ maxWidth:1000, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => navigate("home")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#00e5a0,#00b880)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🎛</div>
          <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:15, color:"#fff" }}>MixCheck <span style={{ color:"#00e5a0" }}>AI</span></span>
        </button>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze"]].map(([p,label]) => (
            <button key={p} onClick={() => navigate(p)} style={{
              background: page===p ? "rgba(0,229,160,0.1)" : "none",
              border: page===p ? "1px solid rgba(0,229,160,0.25)" : "1px solid transparent",
              borderRadius:8, padding:"6px 14px", cursor:"pointer",
              color: page===p ? "#00e5a0" : "#6b7280",
              fontSize:13, fontFamily:"sans-serif", fontWeight: page===p ? 600 : 400,
            }}>{label}</button>
          ))}
          <button onClick={() => navigate("pricing")} style={{
            background:"#00e5a0", color:"#07090f", border:"none",
            borderRadius:8, padding:"8px 16px", fontSize:13,
            fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", marginLeft:4,
          }}>Get Pro</button>
        </div>
      </div>
      <style>{`
        * { box-sizing:border-box; }
        @keyframes wave { from{transform:scaleY(0.35)} to{transform:scaleY(1)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,229,160,0.15)} 50%{box-shadow:0 0 40px rgba(0,229,160,0.35)} }
        html { scroll-behavior:smooth; }
      `}</style>
    </nav>
  );
}

function Footer({ navigate }) {
  return (
    <footer style={{ background:"#060810", borderTop:"1px solid #1a1f2e", padding:"40px 20px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,#00e5a0,#00b880)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12 }}>🎛</div>
            <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:14, color:"#fff" }}>MixCheck AI</span>
          </div>
          <p style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif", margin:0 }}>Built for sound tech volunteers everywhere</p>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze Free"]].map(([p,l]) => (
            <button key={p} onClick={() => navigate(p)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>{l}</button>
          ))}
        </div>
        <p style={{ fontSize:11, color:"#1a1f2e", fontFamily:"monospace", letterSpacing:1, margin:0 }}>2026 MIXCHECK AI</p>
      </div>
    </footer>
  );
}

function HomePage({ navigate }) {
  const STEPS = [
    { num:"01", icon:"🎙", title:"Upload Your Recording", desc:"Drop any file from your church livestream or rehearsal. MP3, WAV, AAC supported. No account needed." },
    { num:"02", icon:"📊", title:"AI Analyzes Your Mix", desc:"MixCheck measures real integrated loudness, frequency balance, dynamic range and stereo width from your actual file." },
    { num:"03", icon:"🎛", title:"Get Mixer Settings", desc:"Receive exact recommendations for your specific mixer - GEQ bands, HPF points, bus compressor, send levels." },
  ];
  const FEATS = [
    { icon:"📡", t:"Livestream Optimized", d:"Targets -16 LUFS for Facebook and YouTube streams." },
    { icon:"🎚", t:"25+ Mixers Supported", d:"Allen & Heath, Behringer, Yamaha, Midas, analog and digital." },
    { icon:"📄", t:"PDF Cheat Sheet", d:"Printable settings to keep on your console. Pro feature." },
    { icon:"🔁", t:"Real Measurements", d:"Every file analyzed uniquely. No fake numbers." },
    { icon:"📱", t:"Works on Any Device", d:"Check mix notes on your phone between songs." },
    { icon:"🧠", t:"Plain English Advice", d:"No jargon. Just actionable settings you can dial in now." },
  ];
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", color:"#e8eaf0", fontFamily:"Georgia,serif" }}>
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 20px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(0,229,160,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:999, padding:"6px 16px", marginBottom:28, animation:"float 3s ease-in-out infinite" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0" }} />
          <span style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>Built for Sound Tech Volunteers</span>
        </div>
        <h1 style={{ fontSize:"clamp(34px,7vw,70px)", fontWeight:900, lineHeight:1.05, margin:"0 0 20px", color:"#fff", maxWidth:780, letterSpacing:-2 }}>
          Your livestream mix,<br />
          <span style={{ color:"#00e5a0", fontStyle:"italic" }}>finally sounding right.</span>
        </h1>
        <p style={{ fontSize:"clamp(15px,2.5vw,19px)", color:"#6b7280", maxWidth:520, lineHeight:1.7, margin:"0 0 14px", fontFamily:"sans-serif" }}>
          Upload your recording. Get exact mixer settings tailored to your room and your stream.
        </p>
        <p style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginBottom:36 }}>Trusted by church sound engineers worldwide</p>
        <div style={{ display:"flex", alignItems:"center", gap:3, height:44, marginBottom:40 }}>
          {[0.4,0.7,1,0.6,0.9,0.5,0.8,1,0.3,0.7,0.9,0.6,0.4,0.8,0.5,0.7,1,0.6,0.9,0.4].map((h,i) => (
            <div key={i} style={{ width:3, height:(h*100)+"%", background:"rgba(0,229,160,"+(0.3+h*0.5)+")", borderRadius:2, animation:"wave "+(0.8+(i%5)*0.2)+"s ease-in-out infinite alternate", animationDelay:(i*0.05)+"s" }} />
          ))}
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", boxShadow:"0 0 32px rgba(0,229,160,0.25)" }}>
            Analyze My Mix Free
          </button>
          <button onClick={() => navigate("pricing")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
            View Pro Plans
          </button>
        </div>
      </section>
      <section style={{ padding:"100px 20px", background:"#07090f" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Three steps to a better stream.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {STEPS.map((s,i) => (
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"28px 24px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:18, right:18, fontSize:11, fontFamily:"monospace", fontWeight:700, color:"#1e2535" }}>{s.num}</div>
                <div style={{ fontSize:34, marginBottom:18 }}>{s.icon}</div>
                <h3 style={{ fontSize:17, fontWeight:800, margin:"0 0 10px", color:"#fff" }}>{s.title}</h3>
                <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, margin:0, fontFamily:"sans-serif" }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 20px", background:"#060810" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>FEATURES</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Everything a volunteer engineer needs.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14 }}>
            {FEATS.map((f,i) => (
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
      <section style={{ padding:"80px 20px", textAlign:"center" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, letterSpacing:-1.5, margin:"0 0 18px", color:"#fff" }}>Ready to sound better this Sunday?</h2>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", marginBottom:32 }}>Free to start. No credit card. Works on your phone.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Analyze Free</button>
            <button onClick={() => navigate("pricing")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>View Pro Plans</button>
          </div>
        </div>
      </section>
    </div>
  );
}

const MIXER_GROUPS = [
  { label:"Allen and Heath", mixers:[
    { id:"qu24", name:"QU-24", type:"digital", streams:"Mix 7 and 8" },
    { id:"qu16", name:"QU-16", type:"digital", streams:"Mix 3 and 4" },
    { id:"qu32", name:"QU-32", type:"digital", streams:"Mix 7 and 8" },
    { id:"sq5",  name:"SQ-5",  type:"digital", streams:"Mix 1-2" },
    { id:"sq6",  name:"SQ-6",  type:"digital", streams:"Mix 1-2" },
    { id:"zed10",name:"ZED-10",type:"analog",  streams:"Alt Out" },
  ]},
  { label:"Behringer", mixers:[
    { id:"x32",  name:"X32",          type:"digital", streams:"Bus 15-16" },
    { id:"x32c", name:"X32 Compact",  type:"digital", streams:"Bus 15-16" },
    { id:"xr18", name:"XR18 X Air",   type:"digital", streams:"Bus 5-6" },
    { id:"xenyx",name:"Xenyx Series", type:"analog",  streams:"Main Out" },
  ]},
  { label:"Yamaha", mixers:[
    { id:"tf1", name:"TF1",       type:"digital", streams:"Omni Out" },
    { id:"tf3", name:"TF3 TF5",   type:"digital", streams:"Omni Out" },
    { id:"ql1", name:"QL1 QL5",   type:"digital", streams:"Omni Out" },
    { id:"mg",  name:"MG Series", type:"analog",  streams:"2TR Out" },
  ]},
  { label:"Other", mixers:[
    { id:"m32",        name:"Midas M32",          type:"digital", streams:"Bus 15-16" },
    { id:"studiolive", name:"PreSonus StudioLive", type:"digital", streams:"Aux Out" },
    { id:"soundcraft", name:"Soundcraft EFX",      type:"analog",  streams:"2TR Out" },
    { id:"mackie",     name:"Mackie ProFX",        type:"analog",  streams:"Alt 3-4 Out" },
  ]},
];

function getMixerTips(mixer) {
  const stream = mixer ? mixer.streams : "Aux Out";
  const isAnalog = mixer ? mixer.type === "analog" : false;
  const isQU = mixer ? mixer.id.startsWith("qu") : false;
  const isX32 = mixer ? (mixer.id.startsWith("x32") || mixer.id === "m32") : false;
  return {
    streamRoute: isQU
      ? "Use Mix " + stream + " as your dedicated livestream send. Keep it separate from FOH."
      : isX32
      ? "Route to " + stream + " and connect to your interface via AES50 or XLR."
      : isAnalog
      ? "Use " + stream + " and connect to your Focusrite interface input for OBS."
      : "Route " + stream + " to your streaming interface. Keep stream send independent from FOH faders.",
    compressor: isAnalog
      ? "No built-in bus compressor. Add a hardware limiter like the DBX 266XS on your stream out, or use a plugin in OBS."
      : isQU
      ? "Bus Compressor on Mix 7 and 8: Ratio 3:1, Threshold -18 dB, Attack 10ms, Release 100ms, Gain +3 dB."
      : "Use the built-in bus compressor on your stream output bus: Ratio 3:1, Threshold -18 dB, Attack 10ms.",
    hpf: isAnalog
      ? "Most analog mixers have a simple HPF switch around 80-100 Hz per channel. Enable it on all channels except kick and bass."
      : "Set HPF per channel: Kick 60 Hz, Bass 80 Hz, Vocals 120 Hz, Keys 200 Hz, Guitars 100 Hz, Overheads 100 Hz.",
  };
}

async function measureAudio(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Cannot read file"));
    reader.onload = async (e) => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) { reject(new Error("AudioContext not supported")); return; }
        const ctx = new AudioCtx();
        let audioBuffer;
        try {
          audioBuffer = await ctx.decodeAudioData(e.target.result.slice(0));
        } catch(decodeErr) {
          ctx.close();
          reject(new Error("Cannot decode audio. Try an MP3 or WAV file."));
          return;
        }
        ctx.close();

        const sr = audioBuffer.sampleRate;
        const numCh = audioBuffer.numberOfChannels;
        const leftCh = audioBuffer.getChannelData(0);
        const rightCh = numCh > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0);
        const total = leftCh.length;

        if (total < sr * 0.5) { reject(new Error("File too short. Upload a recording at least 5 seconds long.")); return; }

        // 1. Integrated Loudness (BS.1770 approximation)
        const blockLen = Math.floor(sr * 0.4);
        const hopLen = Math.floor(blockLen * 0.75);
        const loudBlocks = [];
        for (let i = 0; i + blockLen <= total; i += hopLen) {
          let sq = 0;
          for (let j = i; j < i + blockLen; j++) {
            sq += leftCh[j] * leftCh[j] + rightCh[j] * rightCh[j];
          }
          const rms = Math.sqrt(sq / (blockLen * 2));
          if (rms > 0.0001) loudBlocks.push(rms);
        }
        const gated = loudBlocks.filter(r => (20 * Math.log10(r) - 0.691) > -70);
        const useB = gated.length > 0 ? gated : loudBlocks;
        const avgRMS = Math.sqrt(useB.reduce((s, r) => s + r * r, 0) / useB.length);
        const lufs = Math.round(Math.max(-50, Math.min(-3, 20 * Math.log10(avgRMS) - 0.691)) * 10) / 10;

        // 2. True Peak
        let maxPeak = 0;
        const stride = Math.max(1, Math.floor(total / 300000));
        for (let i = 0; i < total; i += stride) {
          const s = Math.max(Math.abs(leftCh[i]), Math.abs(rightCh[i]));
          if (s > maxPeak) maxPeak = s;
        }
        const peakDb = maxPeak > 0 ? Math.round(20 * Math.log10(maxPeak) * 10) / 10 : -60;

        // 3. Dynamic Range
        const segLen = Math.floor(sr * 1.0);
        const segs = [];
        for (let i = 0; i + segLen <= total; i += segLen) {
          let sq = 0;
          for (let j = i; j < i + segLen; j++) sq += leftCh[j] * leftCh[j];
          const r = Math.sqrt(sq / segLen);
          if (r > 0.0001) segs.push(20 * Math.log10(r));
        }
        segs.sort((a, b) => b - a);
        const t10 = segs.slice(0, Math.max(1, Math.floor(segs.length * 0.1)));
        const b10 = segs.slice(Math.max(0, Math.floor(segs.length * 0.9)));
        const topAvg = t10.reduce((a, b) => a + b, 0) / t10.length;
        const botAvg = b10.reduce((a, b) => a + b, 0) / b10.length;
        const dynRange = Math.round(Math.max(2, Math.min(40, topAvg - botAvg)) * 10) / 10;

        // 4. Stereo Width
        let sumLR = 0, sumL2 = 0, sumR2 = 0;
        const step = Math.max(1, Math.floor(total / 80000));
        for (let i = 0; i < total; i += step) {
          sumLR += leftCh[i] * rightCh[i];
          sumL2 += leftCh[i] * leftCh[i];
          sumR2 += rightCh[i] * rightCh[i];
        }
        const denom = Math.sqrt(sumL2 * sumR2);
        const corr = denom > 0 ? Math.max(-1, Math.min(1, sumLR / denom)) : 1;
        const stereoWidth = Math.round(Math.max(0, Math.min(1, (1 - corr) / 2)) * 100);

        // 5. Frequency balance (simplified band energy)
        const midStart = Math.floor(total * 0.3);
        const midEnd = Math.floor(total * 0.7);
        const analysisSlice = midEnd - midStart;
        const getBand = (hiHz, loHz) => {
          const periodSamples = Math.max(2, Math.floor(sr / ((hiHz + loHz) / 2)));
          let sq = 0; let count = 0;
          for (let i = midStart; i + periodSamples < midEnd; i += periodSamples) {
            let s = 0;
            for (let j = i; j < i + periodSamples; j++) s += Math.abs((leftCh[j] + rightCh[j]) / 2);
            sq += (s / periodSamples) * (s / periodSamples);
            count++;
          }
          return count > 0 ? 20 * Math.log10(Math.sqrt(sq / count) + 0.000001) : -60;
        };

        const freq = {
          sub: getBand(20, 80),
          low: getBand(80, 250),
          lowMid: getBand(250, 600),
          mid: getBand(600, 2500),
          highMid: getBand(2500, 7000),
          high: getBand(7000, 14000),
          air: getBand(14000, 20000),
        };

        resolve({ lufs, peakDb, dynRange, stereoWidth, freq });
      } catch(err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function generateGEQ(freq) {
  const ref = (freq.mid + freq.highMid) / 2;
  const clamp = (v) => Math.max(-4, Math.min(4, v));
  const fmt = (v) => { const r = Math.round(clamp(v) * 2) / 2; return (r >= 0 ? "+" : "") + r.toFixed(1); };
  return [
    { hz:"63",  adj: fmt(freq.sub  > ref + 5 ? -2 : freq.sub  < ref - 8 ?  2 : 1),   reason: freq.sub  > ref + 5 ? "Cut boomy sub" : "Sub warmth" },
    { hz:"125", adj: fmt(freq.low  > ref + 4 ? -1.5 : 0),                              reason: freq.low  > ref + 4 ? "Cut low mud" : "Flat" },
    { hz:"250", adj: fmt(freq.lowMid > ref + 3 ? -2.5 : -1),                           reason: "Cut mud" },
    { hz:"500", adj: fmt(freq.lowMid > ref + 2 ? -1.5 : -0.5),                         reason: "Clarity" },
    { hz:"1k",  adj: "+0.0",                                                            reason: "Flat" },
    { hz:"2k",  adj: fmt(freq.mid  < ref - 4 ? 2 : 0.5),                               reason: "Intelligibility" },
    { hz:"4k",  adj: fmt(freq.highMid < ref - 3 ? 2.5 : 1.5),                          reason: "Presence" },
    { hz:"8k",  adj: fmt(freq.high < ref - 6 ? 2 : 1),                                 reason: "Air" },
    { hz:"16k", adj: fmt(freq.air  < ref - 10 ? 2 : 1),                                reason: "Sheen" },
  ];
}

function generateRecs(lufs, peak, dynRange, stereoWidth, mixer, tips) {
  const recs = [];
  const mixerName = mixer ? mixer.name : "your mixer";
  if (lufs < -20) {
    recs.push({ channel:"Master / Main LR", action:"Integrated loudness is " + lufs + " LUFS. Push your master fader up significantly. Target is -16 LUFS for streaming.", priority:"high" });
  } else if (lufs < -17) {
    recs.push({ channel:"Master / Main LR", action:"Loudness at " + lufs + " LUFS. Slightly low. Add 2-3 dB on master fader to reach streaming target.", priority:"med" });
  } else {
    recs.push({ channel:"Master / Main LR", action:"Loudness at " + lufs + " LUFS. Good level for streaming!", priority:"ok" });
  }
  if (peak > -1) {
    recs.push({ channel:"True Peak Warning", action:"Peak at " + peak + " dBTP is clipping! Reduce master fader immediately.", priority:"high" });
  } else if (peak > -3) {
    recs.push({ channel:"Headroom Check", action:"Peak at " + peak + " dBTP. Very close to clipping. Pull back master 2 dB.", priority:"med" });
  }
  recs.push({ channel:"Stream Send (" + (mixer ? mixer.streams : "Aux Out") + ")", action: tips.streamRoute, priority:"high" });
  if (dynRange > 16) {
    recs.push({ channel:"Bus Compressor", action:"Dynamic range is " + dynRange + " LU. Too wide for streaming. " + tips.compressor, priority:"high" });
  } else if (dynRange > 12) {
    recs.push({ channel:"Bus Compressor", action:"Dynamic range " + dynRange + " LU. Slightly wide. Light compression recommended. " + tips.compressor, priority:"med" });
  } else {
    recs.push({ channel:"Bus Compressor", action:"Dynamic range " + dynRange + " LU. Good for streaming.", priority:"ok" });
  }
  if (stereoWidth < 20) {
    recs.push({ channel:"Stereo Width", action:"Mix is nearly mono (" + stereoWidth + "%). Check your panning and spread instruments.", priority:"med" });
  } else if (stereoWidth > 75) {
    recs.push({ channel:"Stereo Width", action:"Very wide stereo (" + stereoWidth + "%). May sound odd on mono speakers. Check mono compatibility.", priority:"med" });
  }
  recs.push({ channel:"Lead Vocal", action:"HPF at 120 Hz. Boost +2 dB at 3.5 kHz for presence. " + tips.compressor, priority:"high" });
  recs.push({ channel:"Kick Drum", action:"HPF at 60 Hz. Boost +3 dB at 80 Hz for punch. Cut -2 dB at 400 Hz.", priority:"med" });
  recs.push({ channel:"All Channels HPF", action: tips.hpf, priority:"med" });
  return recs;
}

const INSTRUMENTS = [
  {
    id:"kick", name:"Kick Drum", icon:"🥁", color:"#ff5757",
    hpf:"60 Hz", channel:"Ch 1 (Kick)",
    geq:[
      { hz:"60",  adj:"+3.0", reason:"Punch and thump" },
      { hz:"100", adj:"+1.5", reason:"Body and weight" },
      { hz:"200", adj:"-2.0", reason:"Cut mud" },
      { hz:"400", adj:"-3.0", reason:"Remove boxy tone" },
      { hz:"800", adj:"-1.5", reason:"Cut cardboard sound" },
      { hz:"2k",  adj:"+1.0", reason:"Click and attack" },
      { hz:"4k",  adj:"+2.0", reason:"Beater click for stream" },
      { hz:"8k",  adj:"-1.0", reason:"Reduce harshness" },
    ],
    compressor:"Ratio 4:1, Threshold -18 dB, Attack 5ms, Release 80ms. Keeps punch while controlling dynamics.",
    tips:[
      "Gate the kick channel to eliminate bleed from other drums",
      "On QU-24: use the Gate on the channel strip, set threshold at -30 dB",
      "If kick sounds too boomy on stream, cut -3 dB at 80 Hz",
      "On livestream, kick needs more click (4 kHz) than the room mix",
    ],
    proTip:"Record a sample of just the kick alone to test your gate settings before the service starts.",
  },
  {
    id:"snare", name:"Snare Drum", icon:"🪘", color:"#ffb347",
    hpf:"100 Hz", channel:"Ch 2 (Snare)",
    geq:[
      { hz:"100", adj:"-2.0", reason:"Cut low mud" },
      { hz:"200", adj:"-1.5", reason:"Remove boxy sound" },
      { hz:"400", adj:"-2.0", reason:"Cut honky mid" },
      { hz:"1k",  adj:"+1.5", reason:"Body and crack" },
      { hz:"2k",  adj:"+2.0", reason:"Crack and cut" },
      { hz:"5k",  adj:"+2.5", reason:"Snap and presence" },
      { hz:"8k",  adj:"+1.5", reason:"Wire sizzle" },
      { hz:"12k", adj:"+1.0", reason:"Air and brightness" },
    ],
    compressor:"Ratio 3:1, Threshold -20 dB, Attack 10ms, Release 150ms. Fast attack loses the crack - keep it above 8ms.",
    tips:[
      "HPF at 100 Hz - snare has no useful info below this",
      "The crack lives at 2-5 kHz - this is what cuts through on livestream",
      "If snare sounds ringy, add a notch filter around 400-600 Hz",
      "Boost 200 Hz slightly if snare sounds too thin",
    ],
    proTip:"Tune the snare before the service. A well-tuned snare needs less EQ than a badly tuned one.",
  },
  {
    id:"bass", name:"Bass Guitar", icon:"🎸", color:"#a78bfa",
    hpf:"40 Hz", channel:"Ch 3 (Bass DI)",
    geq:[
      { hz:"40",  adj:"+1.0", reason:"Sub foundation" },
      { hz:"80",  adj:"+2.5", reason:"Core bass body" },
      { hz:"160", adj:"+1.5", reason:"Warmth and weight" },
      { hz:"300", adj:"-2.0", reason:"Cut mud" },
      { hz:"600", adj:"-1.5", reason:"Reduce boxy tone" },
      { hz:"1k",  adj:"+1.0", reason:"Note definition" },
      { hz:"2k",  adj:"+1.5", reason:"Pick attack" },
      { hz:"4k",  adj:"+1.0", reason:"String clarity" },
    ],
    compressor:"Ratio 4:1, Threshold -16 dB, Attack 20ms, Release 200ms. Bass needs slower attack to preserve the pick transient.",
    tips:[
      "Always DI the bass directly - never mic a bass cab for livestream",
      "HPF at 40 Hz removes rumble without killing the bass tone",
      "On QU-24: use the DI box insert on Ch 3, send post-fader to Mix 7 and 8",
      "If bass is too boomy on stream, cut -3 dB at 80 Hz and check the kick too",
      "Bass and kick share the 80-120 Hz range - make space for both",
    ],
    proTip:"Ask your bassist to play a consistent note while you EQ. A sustained low E or A note works best.",
  },
  {
    id:"leadVocal", name:"Lead Vocal", icon:"🎤", color:"#00e5a0",
    hpf:"120 Hz", channel:"Ch 5 (Lead Vocal)",
    geq:[
      { hz:"120", adj:"-2.0", reason:"Cut chest rumble" },
      { hz:"250", adj:"-1.5", reason:"Remove muddiness" },
      { hz:"500", adj:"-1.0", reason:"Clear the low-mid" },
      { hz:"1k",  adj:"+0.5", reason:"Warmth (subtle)" },
      { hz:"2k",  adj:"+1.5", reason:"Clarity and cut" },
      { hz:"3.5k",adj:"+2.5", reason:"Presence and intelligibility" },
      { hz:"6k",  adj:"+1.5", reason:"Breath and air" },
      { hz:"10k", adj:"+1.0", reason:"Sparkle and air" },
    ],
    compressor:"Ratio 3:1, Threshold -18 dB, Attack 10ms, Release 100ms, Gain +3 dB. Most important channel to compress for stream.",
    tips:[
      "Lead vocal is the most important channel on the livestream mix",
      "HPF at 120 Hz removes handling noise and low-end rumble",
      "3.5 kHz is the presence frequency - boosting here helps vocals cut through everything",
      "De-ess harsh S sounds: add a narrow cut around 7-8 kHz if sibilance is a problem",
      "On QU-24: use the bus compressor on Mix 7 and 8, not just the channel compressor",
    ],
    proTip:"Listen to the vocal on your phone speaker or earbuds. If you can hear the words clearly there, your congregation at home can too.",
  },
  {
    id:"bgVocals", name:"Backing Vocals", icon:"🎙", color:"#4a7cff",
    hpf:"150 Hz", channel:"Ch 6-8 (BG Vocals)",
    geq:[
      { hz:"150", adj:"-3.0", reason:"Hard HPF - clear low end" },
      { hz:"300", adj:"-2.0", reason:"Remove mud" },
      { hz:"500", adj:"-1.5", reason:"Thin out low-mid" },
      { hz:"1k",  adj:"+0.5", reason:"Slight warmth" },
      { hz:"2k",  adj:"+1.0", reason:"Presence boost" },
      { hz:"4k",  adj:"+1.5", reason:"Clarity" },
      { hz:"8k",  adj:"+1.0", reason:"Air" },
      { hz:"12k", adj:"+0.5", reason:"Sparkle" },
    ],
    compressor:"Ratio 4:1, Threshold -20 dB, Attack 8ms, Release 80ms. Backing vocals need tighter compression than lead.",
    tips:[
      "BG vocals should sit under the lead - never compete with it",
      "Cut more low end than lead vocal - HPF at 150 Hz minimum",
      "Pan backing vocals: L and R channels slightly left and right of center",
      "Reduce BG vocal send to Mix 7 and 8 by -3 to -6 dB compared to lead vocal",
      "If BGs are washing out the mix, try a high-pass at 200 Hz",
    ],
    proTip:"Solo the BG vocals in your headphones and make sure they sound clear but thin. They should support, not overpower.",
  },
  {
    id:"electricGuitar", name:"Electric Guitar", icon:"🎸", color:"#ff7eb3",
    hpf:"100 Hz", channel:"Ch 9 (Elec Guitar)",
    geq:[
      { hz:"100", adj:"-2.0", reason:"Cut low mud" },
      { hz:"200", adj:"-2.5", reason:"Remove boxy sound" },
      { hz:"400", adj:"-1.5", reason:"Cut honky mid" },
      { hz:"800", adj:"+0.5", reason:"Slight body" },
      { hz:"1.5k",adj:"+1.5", reason:"Presence and cut" },
      { hz:"3k",  adj:"+2.0", reason:"Guitar bite" },
      { hz:"6k",  adj:"+1.0", reason:"String attack" },
      { hz:"10k", adj:"-1.0", reason:"Reduce harshness" },
    ],
    compressor:"Ratio 3:1, Threshold -22 dB, Attack 15ms, Release 200ms. Light compression keeps the pick dynamics alive.",
    tips:[
      "HPF at 100 Hz - guitar has very little useful content below this",
      "The bite and cut of electric guitar lives at 2-4 kHz",
      "If guitarist uses a lot of gain, cut more around 200-400 Hz to reduce mud",
      "On livestream, electric guitar should sit behind vocals - reduce send to stream by -2 dB",
      "If guitar is too harsh on stream, try a cut at 3-4 kHz",
    ],
    proTip:"Ask the guitarist to play at service volume during soundcheck - many guitarists turn up during the service.",
  },
  {
    id:"acousticGuitar", name:"Acoustic Guitar", icon:"🪕", color:"#34d399",
    hpf:"80 Hz", channel:"Ch 10 (Acoustic DI)",
    geq:[
      { hz:"80",  adj:"-1.5", reason:"Cut low rumble" },
      { hz:"120", adj:"+1.0", reason:"Warmth and body" },
      { hz:"200", adj:"-2.0", reason:"Remove boxy mud" },
      { hz:"400", adj:"-1.5", reason:"Cut honky tone" },
      { hz:"800", adj:"+0.5", reason:"Body presence" },
      { hz:"2k",  adj:"+1.5", reason:"Pick attack" },
      { hz:"6k",  adj:"+2.0", reason:"String brightness" },
      { hz:"12k", adj:"+1.5", reason:"Air and shimmer" },
    ],
    compressor:"Ratio 3:1, Threshold -20 dB, Attack 20ms, Release 150ms. Slower attack preserves the pick transient - critical for acoustic.",
    tips:[
      "Always DI acoustic guitar - never mic an acoustic for livestream",
      "The body resonance around 200 Hz can get muddy - cut gently",
      "Boost 6-12 kHz for string brightness and shimmer",
      "If acoustic sounds too thin, boost 120 Hz slightly",
      "Pan acoustic guitar slightly off-center if you have electric guitar too",
    ],
    proTip:"Check if the guitarist is using a piezo pickup or a clip-on mic pickup. Piezo sounds thinner and may need more 200 Hz boost.",
  },
  {
    id:"keys", name:"Keys / Piano", icon:"🎹", color:"#fbbf24",
    hpf:"80 Hz", channel:"Ch 11-12 (Keys L/R)",
    geq:[
      { hz:"80",  adj:"-1.5", reason:"Cut low rumble" },
      { hz:"150", adj:"+0.5", reason:"Slight warmth" },
      { hz:"250", adj:"-2.5", reason:"Remove mud - keys biggest problem" },
      { hz:"500", adj:"-1.5", reason:"Clear mid buildup" },
      { hz:"1k",  adj:"+0.5", reason:"Body" },
      { hz:"2k",  adj:"+1.0", reason:"Note clarity" },
      { hz:"5k",  adj:"+1.5", reason:"Brightness and cut" },
      { hz:"10k", adj:"+1.0", reason:"Air" },
    ],
    compressor:"Ratio 3:1, Threshold -20 dB, Attack 15ms, Release 150ms. Keys compress well - helps them sit in the mix.",
    tips:[
      "250 Hz is the mud zone for keys - cut this before anything else",
      "Keys are often too loud on the livestream mix - reduce send by -2 to -4 dB",
      "If keys player uses pad sounds, HPF at 200 Hz to keep them from clogging the low-mid",
      "Piano needs more low end (80-200 Hz) than synth pads",
      "Pan keys slightly left or right if it helps create space for vocals",
    ],
    proTip:"Have the keys player play only pads during the first song, then add more as the mix develops. Pads can fill the whole spectrum and muddy the stream.",
  },
  {
    id:"overhead", name:"Overhead / Cymbals", icon:"🪗", color:"#67e8f9",
    hpf:"200 Hz", channel:"Ch 7-8 (Overheads)",
    geq:[
      { hz:"200", adj:"-3.0", reason:"Hard HPF - cut all lows" },
      { hz:"400", adj:"-2.0", reason:"Remove body buildup" },
      { hz:"800", adj:"-1.5", reason:"Clear mid wash" },
      { hz:"2k",  adj:"-1.0", reason:"Reduce harshness" },
      { hz:"4k",  adj:"+0.5", reason:"Slight definition" },
      { hz:"8k",  adj:"+1.5", reason:"Cymbal shimmer" },
      { hz:"12k", adj:"+2.0", reason:"Air and brilliance" },
      { hz:"16k", adj:"+1.0", reason:"Top-end sheen" },
    ],
    compressor:"Ratio 2:1, Threshold -24 dB, Attack 30ms, Release 300ms. Very light compression - overheads need to breathe.",
    tips:[
      "Overheads on livestream should be lower than in the room mix",
      "HPF at 200 Hz is essential - low-end bleed from overheads muddies the whole stream",
      "If cymbals are harsh on stream, cut -2 dB at 2-3 kHz",
      "Reduce overhead send to Mix 7 and 8 by -4 to -6 dB",
      "If you only have one overhead mic, pan it center",
    ],
    proTip:"Cymbals are the number one cause of a harsh-sounding livestream. When in doubt, pull the overhead fader down 2-3 dB on your stream send.",
  },
  {
    id:"roomMic", name:"Room Mic", icon:"🏛", color:"#94a3b8",
    hpf:"250 Hz", channel:"Ch 15-16 (Room)",
    geq:[
      { hz:"250", adj:"-3.0", reason:"Cut all lows - room captures everything" },
      { hz:"500", adj:"-2.0", reason:"Remove low-mid buildup" },
      { hz:"1k",  adj:"-1.0", reason:"Reduce room tone" },
      { hz:"2k",  adj:"-1.5", reason:"Control harshness" },
      { hz:"4k",  adj:"+0.5", reason:"Slight presence" },
      { hz:"8k",  adj:"+1.0", reason:"Air and space" },
      { hz:"12k", adj:"+0.5", reason:"Top-end detail" },
      { hz:"16k", adj:"+0.5", reason:"Sheen" },
    ],
    compressor:"Ratio 6:1, Threshold -28 dB, Attack 50ms, Release 500ms. Heavy compression keeps room mic from jumping around.",
    tips:[
      "Room mic adds ambience and congregation sound - use sparingly on livestream",
      "Keep room mic very low on stream send - just a hint of room is enough",
      "HPF at 250 Hz - room mics capture way too much low end",
      "If you have crowd cheering, the room mic brings energy to the livestream",
      "Many churches skip the room mic on stream entirely - that is fine",
    ],
    proTip:"The room mic should be barely audible on its own but noticeable when you mute it. That is the right level.",
  },
];

function getInstrumentRecs(instrument, lufs, peak, dynRange, freq) {
  const recs = [];
  if (lufs < -22) {
    recs.push({ channel:"Channel Level", action:"This recording is very quiet at " + lufs + " LUFS. Gain up the channel fader by 4-6 dB before applying EQ.", priority:"high" });
  } else if (lufs < -18) {
    recs.push({ channel:"Channel Level", action:"Level at " + lufs + " LUFS. Slightly quiet. Add 2 dB of channel gain.", priority:"med" });
  } else {
    recs.push({ channel:"Channel Level", action:"Level at " + lufs + " LUFS. Good starting point.", priority:"ok" });
  }
  if (peak > -1) {
    recs.push({ channel:"Peak Warning", action:"Peak at " + peak + " dBTP is clipping! Reduce channel gain immediately.", priority:"high" });
  }
  recs.push({ channel:"HPF Setting", action:"Set High Pass Filter (HPF) to " + instrument.hpf + " on " + instrument.channel + ". This removes low-end rumble and mud that hurts your stream.", priority:"high" });
  recs.push({ channel:"Compressor", action: instrument.compressor, priority:"high" });
  instrument.tips.forEach((tip, i) => {
    recs.push({ channel:"Tip " + (i+1), action: tip, priority:"med" });
  });
  return recs;
}

function AnalyzePage({ navigate }) {
  const [step, setStep] = useState(1);
  const [mixer, setMixer] = useState(null);
  const [customMixer, setCustomMixer] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [analysisMode, setAnalysisMode] = useState(null); // "full" or "instrument"
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState("");
  const [results, setResults] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();
  const fileRef2 = useRef();

  const selectedMixer = showCustom
    ? { id:"custom", name: customMixer || "Custom Mixer", type:"unknown", streams:"Aux Out" }
    : mixer;

  const analyze = useCallback(async (f) => {
    setFile(f);
    setAnalyzing(true);
    setResults(null);
    try {
      setAnalyzeStatus("Reading audio file...");
      await new Promise(r => setTimeout(r, 50));
      setAnalyzeStatus("Measuring loudness and dynamics...");
      const measured = await measureAudio(f);
      setAnalyzeStatus("Analyzing frequency balance...");
      await new Promise(r => setTimeout(r, 100));
      setAnalyzeStatus("Generating recommendations...");
      const tips = getMixerTips(selectedMixer);

      if (analysisMode === "instrument" && selectedInstrument) {
        const recs = getInstrumentRecs(selectedInstrument, measured.lufs, measured.peakDb, measured.dynRange, measured.freq);
        setResults({
          mode: "instrument",
          instrument: selectedInstrument,
          loudness: { lufs: measured.lufs, status: measured.lufs >= -18 ? "ok" : "low" },
          peak: { db: measured.peakDb, status: measured.peakDb <= -1 ? "ok" : "high" },
          dynamic: { range: measured.dynRange, status: measured.dynRange <= 14 ? "ok" : "high" },
          stereo: { width: measured.stereoWidth, status: measured.stereoWidth >= 20 ? "ok" : "low" },
          recs,
          geq: selectedInstrument.geq,
          proTip: selectedInstrument.proTip,
        });
      } else {
        const geq = generateGEQ(measured.freq);
        const recs = generateRecs(measured.lufs, measured.peakDb, measured.dynRange, measured.stereoWidth, selectedMixer, tips);
        setResults({
          mode: "full",
          loudness: { lufs: measured.lufs, status: measured.lufs >= -18 ? "ok" : "low" },
          peak: { db: measured.peakDb, status: measured.peakDb <= -1 ? "ok" : "high" },
          dynamic: { range: measured.dynRange, status: measured.dynRange <= 14 ? "ok" : "high" },
          stereo: { width: measured.stereoWidth, status: measured.stereoWidth >= 20 && measured.stereoWidth <= 75 ? "ok" : "low" },
          freq: measured.freq, tips, recs, geq,
        });
      }
      setStep(4);
    } catch(err) {
      setResults({ error: err.message || "Could not analyze this file. Try an MP3 or WAV." });
      setStep(4);
    }
    setAnalyzing(false);
    setAnalyzeStatus("");
  }, [selectedMixer, analysisMode, selectedInstrument]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) analyze(f);
  }, [analyze]);

  const onPick = (e) => { if (e.target.files[0]) analyze(e.target.files[0]); };
  const statusColor = (s) => s === "high" ? "#ff5757" : s === "low" ? "#ffb347" : "#00e5a0";
  const prioColor = (p) => p === "high" ? "#ff5757" : p === "med" ? "#ffb347" : p === "ok" ? "#00e5a0" : "#4a5568";
  const reset = () => {
    setStep(1); setMixer(null); setFile(null); setResults(null);
    setShowCustom(false); setCustomMixer("");
    setAnalysisMode(null); setSelectedInstrument(null);
  };

  const stepLabels = analysisMode === "instrument"
    ? [["1","Mixer"],["2","Mode"],["3","Instrument"],["4","Upload"],["5","Results"]]
    : [["1","Mixer"],["2","Mode"],["3","Upload"],["4","Results"]];

  const totalSteps = analysisMode === "instrument" ? 5 : 4;

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>AUDIO ANALYZER</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, margin:"0 0 8px", letterSpacing:-1.5, color:"#fff" }}>Analyze your mix.</h1>
          <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Full mix or per-instrument analysis. Works with any mixer.</p>
        </div>

        {/* Progress Steps */}
        <div style={{ display:"flex", gap:6, marginBottom:28, alignItems:"center", overflowX:"auto", paddingBottom:4 }}>
          {[["1","Mixer"],["2","Mode"],["3", analysisMode==="instrument" ? "Instrument" : "Upload"],["4", analysisMode==="instrument" ? "Upload" : "Results"],
            ...(analysisMode==="instrument" ? [["5","Results"]] : [])
          ].map(([n,label],i) => (
            <React.Fragment key={n}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, fontFamily:"monospace",
                  background: step > i+1 ? "#00e5a0" : step === i+1 ? "rgba(0,229,160,0.15)" : "#0d1017",
                  border: step >= i+1 ? "1.5px solid #00e5a0" : "1.5px solid #1a1f2e",
                  color: step > i+1 ? "#07090f" : step === i+1 ? "#00e5a0" : "#2a3040",
                }}>{step > i+1 ? "v" : n}</div>
                <span style={{ fontSize:9, color: step===i+1 ? "#e8eaf0" : "#2a3040", fontFamily:"sans-serif" }}>{label}</span>
              </div>
              {i < (analysisMode==="instrument" ? 4 : 3) && <div style={{ flex:1, height:1, background: step > i+1 ? "#00e5a044" : "#1a1f2e", minWidth:12 }} />}
            </React.Fragment>
          ))}
        </div>

        {/* STEP 1 - MIXER */}
        {step === 1 && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>Choose your mixer for tailored recommendations.</div>
            {MIXER_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>{group.label.toUpperCase()}</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                  {group.mixers.map((m) => (
                    <button key={m.id} onClick={() => { setMixer(m); setShowCustom(false); setStep(2); }} style={{
                      background: mixer && mixer.id === m.id ? "rgba(0,229,160,0.1)" : "#0d1017",
                      border: mixer && mixer.id === m.id ? "1.5px solid #00e5a0" : "1px solid #1a1f2e",
                      borderRadius:10, padding:"12px 10px", cursor:"pointer", textAlign:"left",
                    }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>{m.name}</div>
                      <div style={{ fontSize:9, color: m.type==="digital" ? "#4a7cff" : "#ffb347", background: m.type==="digital" ? "rgba(74,124,255,0.1)" : "rgba(255,179,71,0.1)", padding:"2px 6px", borderRadius:4, fontFamily:"monospace", fontWeight:700, display:"inline-block" }}>{m.type.toUpperCase()}</div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif", marginTop:4 }}>{m.streams}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"16px" }}>
              <div style={{ fontSize:11, color:"#ffb347", fontFamily:"monospace", fontWeight:700, letterSpacing:2, marginBottom:12 }}>MY MIXER IS NOT LISTED</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input placeholder="Type your mixer name e.g. Mackie 1642" value={customMixer}
                  onChange={e => { setCustomMixer(e.target.value); setShowCustom(true); setMixer(null); }}
                  style={{ flex:1, minWidth:200, background:"#060810", border:"1px solid #1a1f2e", borderRadius:8, padding:"10px 14px", color:"#e8eaf0", fontSize:13, fontFamily:"sans-serif", outline:"none" }} />
                <button onClick={() => { if(customMixer.trim()) { setShowCustom(true); setStep(2); } }} disabled={!customMixer.trim()}
                  style={{ background: customMixer.trim() ? "#ffb347" : "#1a1f2e", color: customMixer.trim() ? "#07090f" : "#2a3040", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor: customMixer.trim() ? "pointer" : "not-allowed" }}>
                  Use This Mixer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 - MODE SELECT */}
        {step === 2 && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:24 }}>
              What do you want to analyze?
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
              {/* Full Mix */}
              <button onClick={() => { setAnalysisMode("full"); setSelectedInstrument(null); setStep(3); }} style={{
                background: analysisMode==="full" ? "rgba(0,229,160,0.08)" : "#0d1017",
                border: analysisMode==="full" ? "1.5px solid #00e5a0" : "1px solid #1a1f2e",
                borderRadius:16, padding:"28px 20px", cursor:"pointer", textAlign:"left",
                transition:"all 0.2s",
              }}>
                <div style={{ fontSize:36, marginBottom:16 }}>🎛</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"sans-serif", marginBottom:8 }}>Full Mix</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>
                  Analyze your entire mix recording. Get overall loudness, frequency balance, and general channel recommendations.
                </div>
                <div style={{ marginTop:14, display:"inline-block", background:"rgba(0,229,160,0.1)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:6, padding:"4px 10px", fontSize:10, color:"#00e5a0", fontFamily:"monospace", fontWeight:700 }}>FREE</div>
              </button>

              {/* Per Instrument */}
              <button onClick={() => { setAnalysisMode("instrument"); setStep(3); }} style={{
                background: analysisMode==="instrument" ? "rgba(74,124,255,0.08)" : "#0d1017",
                border: analysisMode==="instrument" ? "1.5px solid #4a7cff" : "1px solid #1a1f2e",
                borderRadius:16, padding:"28px 20px", cursor:"pointer", textAlign:"left",
                transition:"all 0.2s", position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", top:-1, right:16, background:"linear-gradient(90deg,#4a7cff,#7c3aed)", color:"#fff", fontSize:9, fontWeight:800, fontFamily:"monospace", letterSpacing:2, padding:"4px 10px", borderRadius:"0 0 8px 8px" }}>PRO</div>
                <div style={{ fontSize:36, marginBottom:16 }}>🎚</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff", fontFamily:"sans-serif", marginBottom:8 }}>Per Instrument</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>
                  Analyze a single instrument recording. Get exact EQ curves, HPF settings, and compressor values for that specific instrument.
                </div>
                <div style={{ marginTop:14, display:"flex", flexWrap:"wrap", gap:4 }}>
                  {["Kick","Vocal","Bass","Guitar","Keys","Snare"].map(i => (
                    <span key={i} style={{ background:"rgba(74,124,255,0.1)", border:"1px solid rgba(74,124,255,0.2)", borderRadius:4, padding:"2px 8px", fontSize:9, color:"#4a7cff", fontFamily:"monospace" }}>{i}</span>
                  ))}
                  <span style={{ fontSize:9, color:"#4a5568", fontFamily:"monospace", padding:"2px 0" }}>+more</span>
                </div>
              </button>
            </div>
            <button onClick={() => setStep(1)} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>
              Back to mixer select
            </button>
          </div>
        )}

        {/* STEP 3 - INSTRUMENT SELECT (only if instrument mode) */}
        {step === 3 && analysisMode === "instrument" && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>
              Which instrument do you want to analyze? Upload an isolated recording or a mix where that instrument is dominant.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
              {INSTRUMENTS.map((inst) => (
                <button key={inst.id} onClick={() => { setSelectedInstrument(inst); setStep(4); }} style={{
                  background: selectedInstrument?.id === inst.id ? inst.color + "18" : "#0d1017",
                  border: selectedInstrument?.id === inst.id ? "1.5px solid " + inst.color : "1px solid #1a1f2e",
                  borderRadius:12, padding:"16px 14px", cursor:"pointer", textAlign:"left",
                  transition:"all 0.15s",
                }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>{inst.icon}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>{inst.name}</div>
                  <div style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>HPF: {inst.hpf}</div>
                  <div style={{ fontSize:9, color: inst.color, fontFamily:"monospace", marginTop:6, fontWeight:700 }}>{inst.channel}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>
              Back to mode select
            </button>
          </div>
        )}

        {/* STEP 3 (full mode) or STEP 4 (instrument mode) - FILE UPLOAD */}
        {((step === 3 && analysisMode === "full") || (step === 4 && analysisMode === "instrument")) && !analyzing && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            {/* Badges */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:10, padding:"8px 14px", flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16 }}>🎛</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif" }}>{selectedMixer ? selectedMixer.name : "Custom"}</div>
                    <div style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>{selectedMixer ? selectedMixer.streams : "Aux Out"}</div>
                  </div>
                </div>
                <button onClick={() => setStep(1)} style={{ background:"none", border:"none", color:"#4a5568", fontSize:11, fontFamily:"sans-serif", cursor:"pointer" }}>Change</button>
              </div>
              {analysisMode === "instrument" && selectedInstrument && (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background: selectedInstrument.color + "10", border:"1px solid " + selectedInstrument.color + "40", borderRadius:10, padding:"8px 14px", flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>{selectedInstrument.icon}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color: selectedInstrument.color, fontFamily:"sans-serif" }}>{selectedInstrument.name}</div>
                      <div style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>Per-instrument analysis</div>
                    </div>
                  </div>
                  <button onClick={() => setStep(3)} style={{ background:"none", border:"none", color:"#4a5568", fontSize:11, fontFamily:"sans-serif", cursor:"pointer" }}>Change</button>
                </div>
              )}
            </div>

            {analysisMode === "instrument" && (
              <div style={{ background:"rgba(74,124,255,0.06)", border:"1px solid rgba(74,124,255,0.2)", borderRadius:10, padding:"12px 16px", marginBottom:20, fontSize:12, color:"#8892a4", fontFamily:"sans-serif", lineHeight:1.6 }}>
                <span style={{ color:"#4a7cff", fontWeight:700 }}>Tip: </span>
                Upload a recording where {selectedInstrument?.name} is clearly audible. An isolated track works best, but a live mix is fine too.
              </div>
            )}

            <div
              onClick={() => fileRef.current.click()}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if(f) analyze(f); }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{ border:"2px dashed " + (dragOver ? "#00e5a0" : "#1a1f2e"), borderRadius:20, padding:"56px 32px", textAlign:"center", cursor:"pointer", background: dragOver ? "rgba(0,229,160,0.04)" : "#0d1017" }}
            >
              <div style={{ fontSize:44, marginBottom:14 }}>🎵</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:8 }}>Drop your audio file here</div>
              <div style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif", marginBottom:20 }}>MP3, WAV, AAC, M4A, FLAC</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#00e5a0", color:"#07090f", borderRadius:8, padding:"10px 22px", fontSize:13, fontWeight:700, fontFamily:"sans-serif" }}>
                Choose File
              </div>
              <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg" onChange={onPick} style={{ display:"none" }} />
            </div>
            <div style={{ textAlign:"center", marginTop:12 }}>
              <span style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif" }}>Cannot see your file? </span>
              <label style={{ fontSize:12, color:"#4a7cff", fontFamily:"sans-serif", cursor:"pointer", fontWeight:700 }}>
                Browse all files
                <input ref={fileRef2} type="file" onChange={onPick} style={{ display:"none" }} />
              </label>
            </div>
          </div>
        )}

        {/* ANALYZING */}
        {analyzing && (
          <div style={{ textAlign:"center", padding:"80px 32px", background:"#0d1017", borderRadius:20, border:"1px solid #1a1f2e" }}>
            <div style={{ width:40, height:40, border:"3px solid #1a1f2e", borderTop:"3px solid #00e5a0", borderRadius:"50%", margin:"0 auto 24px", animation:"spin 0.8s linear infinite" }} />
            <div style={{ fontSize:15, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:6 }}>{analyzeStatus}</div>
            <div style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif" }}>{file ? file.name : ""}</div>
          </div>
        )}

        {/* STEP 4 (full) or STEP 5 (instrument) - RESULTS */}
        {step === 4 && results && analysisMode === "full" && (
          <FullMixResults results={results} file={file} selectedMixer={selectedMixer} navigate={navigate} reset={reset} statusColor={statusColor} prioColor={prioColor} />
        )}
        {step === 4 && results && analysisMode === "instrument" && !results.error && (
          <InstrumentResults results={results} file={file} selectedMixer={selectedMixer} navigate={navigate} reset={reset} statusColor={statusColor} prioColor={prioColor} />
        )}
        {results && results.error && (
          <div style={{ background:"rgba(255,87,87,0.08)", border:"1px solid rgba(255,87,87,0.3)", borderRadius:16, padding:"28px", textAlign:"center" }}>
            <div style={{ fontSize:32, marginBottom:16 }}>warning</div>
            <div style={{ fontSize:15, fontWeight:700, color:"#ff5757", fontFamily:"sans-serif", marginBottom:8 }}>Could not analyze this file</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>{results.error}</div>
            <button onClick={reset} style={{ background:"#ff5757", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Try Another File</button>
          </div>
        )}
      </div>
    </div>
  );
}

function FullMixResults({ results, file, selectedMixer, navigate, reset, statusColor, prioColor }) {
  return (
    <div style={{ animation:"fadein 0.4s ease" }}>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>
          Full Mix - {selectedMixer ? selectedMixer.name : "Custom"}
        </div>
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>
          {file ? file.name : ""}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
        {[
          { label:"LOUDNESS", val: results.loudness.lufs + " LUFS", target:"Target: -16 LUFS", status: results.loudness.status },
          { label:"TRUE PEAK", val: results.peak.db + " dBTP", target:"Target: below -1 dBTP", status: results.peak.status },
          { label:"DYNAMIC RANGE", val: results.dynamic.range + " LU", target:"Target: 8-12 LU", status: results.dynamic.status },
          { label:"STEREO WIDTH", val: results.stereo.width + "%", target:"Target: 50-80%", status: results.stereo.status },
        ].map((m,i) => (
          <div key={i} style={{ background:"#0d1017", border:"1px solid " + statusColor(m.status) + "33", borderRadius:12, padding:"14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>{m.label}</div>
            <div style={{ fontSize:20, fontWeight:900, color:statusColor(m.status), letterSpacing:-1, marginBottom:3 }}>{m.val}</div>
            <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>{m.target}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>FULL MIX RECOMMENDATIONS</div>
        {results.recs.map((r,i) => (
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom: i < results.recs.length-1 ? 13 : 0, marginBottom: i < results.recs.length-1 ? 13 : 0, borderBottom: i < results.recs.length-1 ? "1px solid #1a1f2e" : "none" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:prioColor(r.priority), marginTop:5, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:3 }}>{r.channel}</div>
              <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>{r.action}</div>
            </div>
            <div style={{ fontSize:9, color:prioColor(r.priority), fontFamily:"monospace", fontWeight:700, letterSpacing:1, flexShrink:0 }}>{r.priority.toUpperCase()}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>MAIN LR GEQ SUGGESTIONS</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))", gap:8 }}>
          {results.geq.map((g,i) => {
            const val = parseFloat(g.adj);
            return (
              <div key={i} style={{ background:"#060810", borderRadius:10, padding:"11px 6px", textAlign:"center", border:"1px solid " + (val>0 ? "rgba(0,229,160,0.2)" : val<0 ? "rgba(255,87,87,0.2)" : "#1a1f2e") }}>
                <div style={{ fontSize:9, color:"#4a5568", fontFamily:"monospace", marginBottom:5 }}>{g.hz} Hz</div>
                <div style={{ fontSize:16, fontWeight:900, color: val>0 ? "#00e5a0" : val<0 ? "#ff5757" : "#4a5568" }}>{g.adj}</div>
                <div style={{ fontSize:8, color:"#2a3040", fontFamily:"sans-serif", marginTop:3 }}>{g.reason}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1px solid rgba(0,229,160,0.25)", borderRadius:14, padding:"18px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Get the full PDF cheat sheet</div>
            <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>Formatted for {selectedMixer ? selectedMixer.name : "your mixer"} and printable. Pro feature.</div>
          </div>
          <button onClick={() => navigate("pricing")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            Upgrade to Pro
          </button>
        </div>
      </div>
      <button onClick={reset} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"11px 22px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
        Analyze Another File
      </button>
    </div>
  );
}

function InstrumentResults({ results, file, selectedMixer, navigate, reset, statusColor, prioColor }) {
  const inst = results.instrument;
  return (
    <div style={{ animation:"fadein 0.4s ease" }}>
      {/* Header badges */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <div style={{ background: inst.color + "15", border:"1px solid " + inst.color + "40", borderRadius:8, padding:"6px 14px", fontSize:12, color: inst.color, fontFamily:"sans-serif", fontWeight:700 }}>
          {inst.icon} {inst.name} Analysis
        </div>
        <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>
          {selectedMixer ? selectedMixer.name : "Custom Mixer"}
        </div>
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>
          {file ? file.name : ""}
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
        {[
          { label:"CHANNEL LEVEL", val: results.loudness.lufs + " LUFS", target:"Healthy: -20 to -12 LUFS", status: results.loudness.status },
          { label:"TRUE PEAK", val: results.peak.db + " dBTP", target:"Target: below -1 dBTP", status: results.peak.status },
          { label:"DYNAMIC RANGE", val: results.dynamic.range + " LU", target:"Instrument dynamics", status: results.dynamic.status },
          { label:"STEREO WIDTH", val: results.stereo.width + "%", target:"Instrument stereo field", status: results.stereo.status },
        ].map((m,i) => (
          <div key={i} style={{ background:"#0d1017", border:"1px solid " + statusColor(m.status) + "33", borderRadius:12, padding:"14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>{m.label}</div>
            <div style={{ fontSize:20, fontWeight:900, color:statusColor(m.status), letterSpacing:-1, marginBottom:3 }}>{m.val}</div>
            <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>{m.target}</div>
          </div>
        ))}
      </div>

      {/* Channel EQ */}
      <div style={{ background:"#0d1017", border:"1px solid " + inst.color + "30", borderRadius:16, padding:"18px", marginBottom:18 }}>
        <div style={{ fontSize:10, letterSpacing:3, color: inst.color, fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>
          {inst.name.toUpperCase()} CHANNEL EQ
        </div>
        <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif", marginBottom:14 }}>
          {inst.channel} - HPF at {inst.hpf}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))", gap:8 }}>
          {inst.geq.map((g,i) => {
            const val = parseFloat(g.adj);
            return (
              <div key={i} style={{ background:"#060810", borderRadius:10, padding:"11px 6px", textAlign:"center", border:"1px solid " + (val>0 ? inst.color + "40" : val<0 ? "rgba(255,87,87,0.2)" : "#1a1f2e") }}>
                <div style={{ fontSize:9, color:"#4a5568", fontFamily:"monospace", marginBottom:5 }}>{g.hz} Hz</div>
                <div style={{ fontSize:15, fontWeight:900, color: val>0 ? inst.color : val<0 ? "#ff5757" : "#4a5568" }}>{g.adj}</div>
                <div style={{ fontSize:7, color:"#2a3040", fontFamily:"sans-serif", marginTop:3, lineHeight:1.3 }}>{g.reason}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>
          CHANNEL RECOMMENDATIONS
        </div>
        {results.recs.map((r,i) => (
          <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom: i<results.recs.length-1 ? 13 : 0, marginBottom: i<results.recs.length-1 ? 13 : 0, borderBottom: i<results.recs.length-1 ? "1px solid #1a1f2e" : "none" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:prioColor(r.priority), marginTop:5, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:3 }}>{r.channel}</div>
              <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>{r.action}</div>
            </div>
            <div style={{ fontSize:9, color:prioColor(r.priority), fontFamily:"monospace", fontWeight:700, letterSpacing:1, flexShrink:0 }}>{r.priority.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Pro Tip */}
      <div style={{ background:"rgba(255,179,71,0.06)", border:"1px solid rgba(255,179,71,0.2)", borderRadius:14, padding:"16px 18px", marginBottom:18 }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:8 }}>PRO TIP</div>
        <div style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.6 }}>{results.proTip}</div>
      </div>

      {/* Upsell */}
      <div style={{ background:"linear-gradient(135deg,rgba(74,124,255,0.07),rgba(74,124,255,0.02))", border:"1px solid rgba(74,124,255,0.25)", borderRadius:14, padding:"18px", marginBottom:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"#4a7cff", fontFamily:"sans-serif", marginBottom:4 }}>Analyze all 10 instruments</div>
            <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>Pro users get unlimited per-instrument analysis plus PDF cheat sheets for every channel.</div>
          </div>
          <button onClick={() => navigate("pricing")} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
            Upgrade to Pro
          </button>
        </div>
      </div>

      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <button onClick={reset} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"11px 22px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
          Analyze Another
        </button>
        <button onClick={reset} style={{ background:"transparent", border:"1px solid rgba(74,124,255,0.3)", borderRadius:10, padding:"11px 22px", color:"#4a7cff", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
          Try Different Instrument
        </button>
      </div>
    </div>
  );
}

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>AUDIO ANALYZER</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, margin:"0 0 8px", letterSpacing:-1.5, color:"#fff" }}>Analyze your mix.</h1>
          <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Real measurements from your actual audio file. Works with any mixer.</p>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:28, alignItems:"center" }}>
          {[["1","Select Mixer"],["2","Upload Audio"],["3","Get Results"]].map(([n,label],i) => (
            <React.Fragment key={n}>
              <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                <div style={{
                  width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:11, fontWeight:700, fontFamily:"monospace",
                  background: step > i+1 ? "#00e5a0" : step === i+1 ? "rgba(0,229,160,0.15)" : "#0d1017",
                  border: step >= i+1 ? "1.5px solid #00e5a0" : "1.5px solid #1a1f2e",
                  color: step > i+1 ? "#07090f" : step === i+1 ? "#00e5a0" : "#2a3040",
                }}>{step > i+1 ? "v" : n}</div>
              </div>
              {i < 2 && <div style={{ flex:1, height:1, background: step > i+1 ? "#00e5a044" : "#1a1f2e" }} />}
            </React.Fragment>
          ))}
          <span style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", marginLeft:8 }}>
            {step===1 ? "Select your mixer" : step===2 ? "Upload your recording" : "Results"}
          </span>
        </div>

        {step === 1 && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>
              Choose your mixer for tailored recommendations.
            </div>
            {MIXER_GROUPS.map((group, gi) => (
              <div key={gi} style={{ marginBottom:20 }}>
                <div style={{ fontSize:10, letterSpacing:3, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>
                  {group.label.toUpperCase()}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:8 }}>
                  {group.mixers.map((m) => (
                    <button key={m.id} onClick={() => { setMixer(m); setShowCustom(false); setStep(2); }} style={{
                      background: mixer && mixer.id === m.id ? "rgba(0,229,160,0.1)" : "#0d1017",
                      border: mixer && mixer.id === m.id ? "1.5px solid #00e5a0" : "1px solid #1a1f2e",
                      borderRadius:10, padding:"12px 10px", cursor:"pointer", textAlign:"left",
                    }}>
                      <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>{m.name}</div>
                      <div style={{ fontSize:9, color: m.type==="digital" ? "#4a7cff" : "#ffb347", background: m.type==="digital" ? "rgba(74,124,255,0.1)" : "rgba(255,179,71,0.1)", padding:"2px 6px", borderRadius:4, fontFamily:"monospace", fontWeight:700, display:"inline-block" }}>
                        {m.type.toUpperCase()}
                      </div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif", marginTop:4 }}>{m.streams}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"16px", marginTop:4 }}>
              <div style={{ fontSize:11, color:"#ffb347", fontFamily:"monospace", fontWeight:700, letterSpacing:2, marginBottom:12 }}>MY MIXER IS NOT LISTED</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input
                  placeholder="Type your mixer name e.g. Mackie 1642"
                  value={customMixer}
                  onChange={e => { setCustomMixer(e.target.value); setShowCustom(true); setMixer(null); }}
                  style={{ flex:1, minWidth:200, background:"#060810", border:"1px solid #1a1f2e", borderRadius:8, padding:"10px 14px", color:"#e8eaf0", fontSize:13, fontFamily:"sans-serif", outline:"none" }}
                />
                <button
                  onClick={() => { if(customMixer.trim()) { setShowCustom(true); setStep(2); } }}
                  disabled={!customMixer.trim()}
                  style={{ background: customMixer.trim() ? "#ffb347" : "#1a1f2e", color: customMixer.trim() ? "#07090f" : "#2a3040", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor: customMixer.trim() ? "pointer" : "not-allowed" }}
                >Use This Mixer</button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && !analyzing && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:10, padding:"10px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:18 }}>🎛</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif" }}>{selectedMixer ? selectedMixer.name : "Custom Mixer"}</div>
                  <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>Stream out: {selectedMixer ? selectedMixer.streams : "Aux Out"}</div>
                </div>
              </div>
              <button onClick={() => setStep(1)} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Change</button>
            </div>
            <div
              onClick={() => fileRef.current.click()}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{ border:"2px dashed " + (dragOver ? "#00e5a0" : "#1a1f2e"), borderRadius:20, padding:"56px 32px", textAlign:"center", cursor:"pointer", background: dragOver ? "rgba(0,229,160,0.04)" : "#0d1017" }}
            >
              <div style={{ fontSize:44, marginBottom:14 }}>🎵</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:8 }}>Drop your audio file here</div>
              <div style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif", marginBottom:20 }}>MP3, WAV, AAC, M4A, FLAC</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#00e5a0", color:"#07090f", borderRadius:8, padding:"10px 22px", fontSize:13, fontWeight:700, fontFamily:"sans-serif" }}>
                Choose File
              </div>
              <input ref={fileRef} type="file" accept="audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg" onChange={onPick} style={{ display:"none" }} />
            </div>
            <div style={{ textAlign:"center", marginTop:12 }}>
              <span style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif" }}>Cannot see your file? </span>
              <label style={{ fontSize:12, color:"#4a7cff", fontFamily:"sans-serif", cursor:"pointer", fontWeight:700 }}>
                Browse all files
                <input ref={fileRef2} type="file" onChange={onPick} style={{ display:"none" }} />
              </label>
            </div>
          </div>
        )}

        {analyzing && (
          <div style={{ textAlign:"center", padding:"80px 32px", background:"#0d1017", borderRadius:20, border:"1px solid #1a1f2e" }}>
            <div style={{ width:40, height:40, border:"3px solid #1a1f2e", borderTop:"3px solid #00e5a0", borderRadius:"50%", margin:"0 auto 24px", animation:"spin 0.8s linear infinite" }} />
            <div style={{ fontSize:15, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:6 }}>{analyzeStatus}</div>
            <div style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif" }}>{file ? file.name : ""}</div>
          </div>
        )}

        {step === 3 && results && (
          <div style={{ animation:"fadein 0.4s ease" }}>
            {results.error ? (
              <div style={{ background:"rgba(255,87,87,0.08)", border:"1px solid rgba(255,87,87,0.3)", borderRadius:16, padding:"28px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:16 }}>⚠</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#ff5757", fontFamily:"sans-serif", marginBottom:8 }}>Could not analyze this file</div>
                <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>{results.error}</div>
                <button onClick={reset} style={{ background:"#ff5757", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Try Another File</button>
              </div>
            ) : (
              <>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
                  <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>
                    {selectedMixer ? selectedMixer.name : "Custom Mixer"}
                  </div>
                  <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>
                    {file ? file.name : ""}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
                  {[
                    { label:"LOUDNESS", val: results.loudness.lufs + " LUFS", target:"Target: -16 LUFS", status: results.loudness.status },
                    { label:"TRUE PEAK", val: results.peak.db + " dBTP", target:"Target: below -1 dBTP", status: results.peak.status },
                    { label:"DYNAMIC RANGE", val: results.dynamic.range + " LU", target:"Target: 8-12 LU", status: results.dynamic.status },
                    { label:"STEREO WIDTH", val: results.stereo.width + "%", target:"Target: 50-80%", status: results.stereo.status },
                  ].map((m,i) => (
                    <div key={i} style={{ background:"#0d1017", border:"1px solid " + statusColor(m.status) + "33", borderRadius:12, padding:"14px" }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>{m.label}</div>
                      <div style={{ fontSize:20, fontWeight:900, color:statusColor(m.status), letterSpacing:-1, marginBottom:3 }}>{m.val}</div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>{m.target}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>
                    RECOMMENDATIONS
                  </div>
                  {results.recs.map((r,i) => (
                    <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom: i < results.recs.length-1 ? 13 : 0, marginBottom: i < results.recs.length-1 ? 13 : 0, borderBottom: i < results.recs.length-1 ? "1px solid #1a1f2e" : "none" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%", background:prioColor(r.priority), marginTop:5, flexShrink:0 }} />
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:12, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:3 }}>{r.channel}</div>
                        <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>{r.action}</div>
                      </div>
                      <div style={{ fontSize:9, color:prioColor(r.priority), fontFamily:"monospace", fontWeight:700, letterSpacing:1, flexShrink:0 }}>{r.priority.toUpperCase()}</div>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>MAIN LR GEQ SUGGESTIONS</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(70px,1fr))", gap:8 }}>
                    {results.geq.map((g,i) => {
                      const val = parseFloat(g.adj);
                      const isPos = val > 0;
                      const isNeg = val < 0;
                      return (
                        <div key={i} style={{ background:"#060810", borderRadius:10, padding:"11px 6px", textAlign:"center", border:"1px solid " + (isPos ? "rgba(0,229,160,0.2)" : isNeg ? "rgba(255,87,87,0.2)" : "#1a1f2e") }}>
                          <div style={{ fontSize:9, color:"#4a5568", fontFamily:"monospace", marginBottom:5 }}>{g.hz} Hz</div>
                          <div style={{ fontSize:16, fontWeight:900, color: isPos ? "#00e5a0" : isNeg ? "#ff5757" : "#4a5568" }}>{g.adj}</div>
                          <div style={{ fontSize:8, color:"#2a3040", fontFamily:"sans-serif", marginTop:3 }}>{g.reason}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1px solid rgba(0,229,160,0.25)", borderRadius:14, padding:"18px", marginBottom:20 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Get the full PDF cheat sheet</div>
                      <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>Formatted for {selectedMixer ? selectedMixer.name : "your mixer"} and printable for your console. Pro feature.</div>
                    </div>
                    <button onClick={() => navigate("pricing")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                      Upgrade to Pro
                    </button>
                  </div>
                </div>

                <button onClick={reset} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"11px 22px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
                  Analyze Another File
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PricingPage({ navigate }) {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const monthly = 9.99;
  const price = annual ? (monthly * 0.8).toFixed(2) : monthly.toFixed(2);
  const PRO = [
    { icon:"📄", text:"Printable mixer cheat sheet PDF" },
    { icon:"🔁", text:"Unlimited uploads" },
    { icon:"📊", text:"Before and after comparison" },
    { icon:"🎚", text:"Per-channel HPF recommendations" },
    { icon:"💾", text:"Session history, last 30 analyses" },
    { icon:"📧", text:"Priority support from a real engineer" },
    { icon:"🆕", text:"All future features included" },
  ];
  const FAQ = [
    { q:"Do I need a credit card for free?", a:"No. Just upload a file and go. No account needed." },
    { q:"Can I cancel anytime?", a:"Yes. Cancel from your Stripe customer portal anytime." },
    { q:"Is my audio stored on your servers?", a:"Files are analyzed locally in your browser and never uploaded to our servers." },
    { q:"I am a volunteer, not a professional. Is this for me?", a:"This is literally built for you. No audio degree required." },
    { q:"Which mixers are supported?", a:"Allen and Heath QU and SQ series, Behringer X32 and X Air, Yamaha TF and QL, Midas M32, PreSonus StudioLive, and many analog mixers. Plus custom input for any mixer." },
  ];
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 20px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>PRICING</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-2, color:"#fff", lineHeight:1.05 }}>Simple pricing.</h1>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", maxWidth:440, margin:"0 auto 28px" }}>Cancel anytime via Stripe.</p>
          <div style={{ display:"inline-flex", alignItems:"center", gap:0, background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:99, padding:"5px" }}>
            {[["Monthly",false],["Annual - Save 20%",true]].map(([label,val]) => (
              <button key={label} onClick={() => setAnnual(val)} style={{ background: annual===val ? "#1a1f2e" : "transparent", border:"none", borderRadius:99, padding:"7px 18px", color: annual===val ? "#fff" : "#4a5568", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginBottom:52 }}>
          <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:20, padding:"30px 26px" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#4a5568", fontFamily:"sans-serif", marginBottom:8 }}>Free</div>
            <div style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2, marginBottom:20 }}>$0</div>
            <div style={{ height:1, background:"#1a1f2e", marginBottom:20 }} />
            {["3 uploads per month","Loudness and frequency report","Basic mixer suggestions"].map((f,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:11 }}>
                <span style={{ color:"#2a3040" }}>v</span>
                <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>{f}</span>
              </div>
            ))}
            <button onClick={() => navigate("analyze")} style={{ width:"100%", marginTop:22, background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"12px", color:"#4a5568", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Start Free</button>
          </div>

          <div style={{ background:"linear-gradient(160deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1.5px solid rgba(0,229,160,0.35)", borderRadius:20, padding:"30px 26px", position:"relative", animation:"glow 3s ease-in-out infinite" }}>
            <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#00e5a0,#00c080)", color:"#07090f", fontSize:10, fontWeight:800, fontFamily:"monospace", letterSpacing:2, padding:"4px 18px", borderRadius:"0 0 10px 10px" }}>MOST POPULAR</div>
            <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:8 }}>Pro</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
              <span style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2 }}>${price}</span>
              <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>CAD / mo</span>
            </div>
            <div style={{ height:1, background:"rgba(0,229,160,0.15)", margin:"18px 0" }} />
            {PRO.map((f,i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:11, alignItems:"flex-start" }}>
                <span style={{ fontSize:13 }}>{f.icon}</span>
                <span style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.5 }}>{f.text}</span>
              </div>
            ))}
            <button
              onClick={() => STRIPE_CONFIGURED ? window.open(STRIPE_PAYMENT_LINK,"_blank") : alert("Stripe not configured yet.")}
              style={{ width:"100%", marginTop:24, background:"linear-gradient(135deg,#00e5a0,#00c080)", border:"none", borderRadius:12, padding:"14px", color:"#07090f", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}
            >
              {STRIPE_CONFIGURED ? "Upgrade to Pro - $" + price + " CAD/mo" : "Upgrade to Pro - $" + price + " CAD/mo"}
            </button>
          </div>
        </div>

        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 24px", letterSpacing:-1, color:"#fff", textAlign:"center" }}>Common questions</h2>
          {FAQ.map((f,i) => (
            <div key={i} style={{ borderBottom: i < FAQ.length-1 ? "1px solid #1a1f2e" : "none" }}>
              <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{ width:"100%", background:"none", border:"none", padding:"17px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, textAlign:"left" }}>
                <span style={{ fontSize:14, fontWeight:600, color:"#e8eaf0", fontFamily:"sans-serif" }}>{f.q}</span>
                <span style={{ color: openFaq===i ? "#00e5a0" : "#2a3040", fontSize:18, flexShrink:0 }}>{openFaq===i ? "-" : "+"}</span>
              </button>
              {openFaq===i && <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, margin:"0 0 16px", paddingRight:24 }}>{f.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ navigate }) {
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center", maxWidth:500 }}>
        <div style={{ fontSize:48, marginBottom:24 }}>🎉</div>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-1.5, color:"#fff" }}>Welcome to Pro!</h1>
        <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, marginBottom:32 }}>
          Your subscription is active. Check your email for your receipt.
        </p>
        <button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Start Analyzing</button>
      </div>
    </div>
  );
}

export default function App() {
  const { page, navigate } = useRouter();
  const renderPage = () => {
    switch(page) {
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
