import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIcN6gBO375e6dbQkgbm03";

const VALID_CODE_HASHES = [
  btoa("MIXPRO2026"),
  btoa("CHURCHPRO1"),
  btoa("SOUNDTECH1"),
];

function usePro() {
  const [isPro, setIsPro] = useState(function() {
    try { return localStorage.getItem("mca_pro") === "true"; } catch(e) { return false; }
  });
  const unlockPro = function(code) {
    var hashed = btoa(code.trim().toUpperCase());
    if (VALID_CODE_HASHES.indexOf(hashed) !== -1) {
      try { localStorage.setItem("mca_pro", "true"); } catch(e) {}
      setIsPro(true);
      return true;
    }
    return false;
  };
  return { isPro, unlockPro };
}

function useRouter() {
  var getPage = function() { return window.location.hash.replace("#", "") || "home"; };
  var initialPage = getPage();
  var state = useState(initialPage);
  var page = state[0];
  var setPage = state[1];
  useEffect(function() {
    var h = function() { setPage(getPage()); };
    window.addEventListener("hashchange", h);
    return function() { window.removeEventListener("hashchange", h); };
  }, []);
  var navigate = function(to) { window.location.hash = to; window.scrollTo(0, 0); };
  return { page: page, navigate: navigate };
}

function ProUnlockModal({ onClose, onUnlock }) {
  var codeState = useState("");
  var code = codeState[0]; var setCode = codeState[1];
  var errorState = useState("");
  var error = errorState[0]; var setError = errorState[1];
  var successState = useState(false);
  var success = successState[0]; var setSuccess = successState[1];
  var submit = function() {
    if (onUnlock(code)) { setSuccess(true); setTimeout(onClose, 2000); }
    else setError("Invalid code. Check your email or contact hello@mixcheckai.com");
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={onClose}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:420, position:"relative" }}>
        {success ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#00e5a0", marginBottom:8, fontFamily:"sans-serif" }}>Pro Unlocked!</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif" }}>Welcome to MixCheck AI Pro!</div>
          </div>
        ) : (
          <div>
            <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:"#4a5568", fontSize:20, cursor:"pointer" }}>x</button>
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>UNLOCK PRO</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:8, fontFamily:"sans-serif" }}>Enter your access code</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:24 }}>Check your email after payment for your access code.</div>
            <input value={code} onChange={function(e) { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={function(e) { if(e.key === "Enter") submit(); }}
              placeholder="e.g. MIXPRO2026"
              style={{ width:"100%", background:"#060810", border:"1px solid " + (error ? "#ff5757" : "#1a1f2e"), borderRadius:10, padding:"14px 16px", color:"#e8eaf0", fontSize:15, fontFamily:"monospace", fontWeight:700, letterSpacing:2, outline:"none", marginBottom:error ? 8 : 16, textTransform:"uppercase" }}
            />
            {error && <div style={{ fontSize:12, color:"#ff5757", fontFamily:"sans-serif", marginBottom:16 }}>{error}</div>}
            <button onClick={submit} disabled={!code.trim()} style={{ width:"100%", background: code.trim() ? "#00e5a0" : "#1a1f2e", color: code.trim() ? "#07090f" : "#2a3040", border:"none", borderRadius:10, padding:"14px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor: code.trim() ? "pointer" : "not-allowed", marginBottom:16 }}>
              Unlock Pro Access
            </button>
            <div style={{ textAlign:"center", fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>
              No code yet? <a href={STRIPE_PAYMENT_LINK} target="_blank" rel="noopener noreferrer" style={{ color:"#00e5a0", textDecoration:"none" }}>Subscribe $9.99 CAD/mo</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Nav({ navigate, page, isPro, onUnlockClick }) {
  var scrolledState = useState(false);
  var scrolled = scrolledState[0]; var setScrolled = scrolledState[1];
  useEffect(function() {
    var h = function() { setScrolled(window.scrollY > 40); };
    window.addEventListener("scroll", h);
    return function() { window.removeEventListener("scroll", h); };
  }, []);
  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, background: scrolled ? "rgba(7,9,15,0.93)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none", padding:"0 20px", transition:"all 0.3s" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={function() { navigate("home"); }} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#00e5a0,#00b880)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:15 }}>🎛</div>
          <span style={{ fontFamily:"monospace", fontWeight:700, fontSize:15, color:"#fff" }}>MixCheck <span style={{ color:"#00e5a0" }}>AI</span></span>
        </button>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze"]].map(function(item) {
            var p = item[0]; var label = item[1];
            return (
              <button key={p} onClick={function() { navigate(p); }} style={{ background: page===p ? "rgba(0,229,160,0.1)" : "none", border: page===p ? "1px solid rgba(0,229,160,0.25)" : "1px solid transparent", borderRadius:8, padding:"6px 14px", cursor:"pointer", color: page===p ? "#00e5a0" : "#6b7280", fontSize:13, fontFamily:"sans-serif", fontWeight: page===p ? 600 : 400 }}>{label}</button>
            );
          })}
          {isPro ? (
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,229,160,0.1)", border:"1px solid rgba(0,229,160,0.3)", borderRadius:8, padding:"6px 14px" }}>
              <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0" }} />
              <span style={{ fontSize:12, color:"#00e5a0", fontFamily:"monospace", fontWeight:700 }}>PRO</span>
            </div>
          ) : (
            <button onClick={onUnlockClick} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", marginLeft:4 }}>Get Pro</button>
          )}
        </div>
      </div>
      <style>{`* { box-sizing:border-box; } @keyframes wave { from{transform:scaleY(0.35)} to{transform:scaleY(1)} } @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} } @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to{transform:rotate(360deg)} } @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,229,160,0.15)} 50%{box-shadow:0 0 40px rgba(0,229,160,0.35)} } html { scroll-behavior:smooth; }`}</style>
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
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze Free"]].map(function(item) {
            return <button key={item[0]} onClick={function() { navigate(item[0]); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>{item[1]}</button>;
          })}
        </div>
        <p style={{ fontSize:11, color:"#1a1f2e", fontFamily:"monospace", letterSpacing:1, margin:0 }}>2026 MIXCHECK AI</p>
      </div>
    </footer>
  );
}

// ── AUDIO ANALYSIS - uses Float32Array for speed, no array.push loops ─────────
async function measureAudio(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error("Cannot read file")); };
    reader.onload = async function(e) {
      try {
        var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtxClass) { reject(new Error("AudioContext not supported")); return; }
        var ctx = new AudioCtxClass();
        var buf;
        try { buf = await ctx.decodeAudioData(e.target.result.slice(0)); }
        catch(decodeErr) { ctx.close(); reject(new Error("Cannot decode audio. Try MP3 or WAV.")); return; }
        ctx.close();

        var sr = buf.sampleRate;
        var numCh = buf.numberOfChannels;
        var totalSamples = buf.getChannelData(0).length;
        var totalDuration = Math.round(totalSamples / sr);

        // For files over 10 min, analyze 3 slices of up to 3 min each
        // Use subarray instead of push - 100x faster, no memory blowup
        var isLongFile = totalDuration > 600;
        var sliceCount = 1;
        var L, R;

        if (!isLongFile) {
          // Short file - use whole thing directly (no copy)
          L = buf.getChannelData(0);
          R = numCh > 1 ? buf.getChannelData(1) : buf.getChannelData(0);
        } else {
          // Long file - concatenate 3 Float32Array slices efficiently
          var sliceSec = Math.min(180, Math.floor(totalDuration / 3));
          var sliceSamp = Math.floor(sliceSec * sr);
          var midStart = Math.floor(totalSamples / 2) - Math.floor(sliceSamp / 2);
          var starts = [0, Math.max(0, midStart), Math.max(0, totalSamples - sliceSamp)];
          sliceCount = 3;

          var rawL = buf.getChannelData(0);
          var rawR = numCh > 1 ? buf.getChannelData(1) : buf.getChannelData(0);
          var combined = sliceSamp * 3;
          var mergedL = new Float32Array(combined);
          var mergedR = new Float32Array(combined);
          for (var si = 0; si < 3; si++) {
            var st = starts[si];
            var en = Math.min(totalSamples, st + sliceSamp);
            mergedL.set(rawL.subarray(st, en), si * sliceSamp);
            mergedR.set(rawR.subarray(st, en), si * sliceSamp);
          }
          L = mergedL;
          R = mergedR;
        }

        var total = L.length;
        if (total < sr) { reject(new Error("File too short. Use at least 5 seconds.")); return; }

        // Integrated Loudness
        var blockLen = Math.floor(sr * 0.4);
        var hop = Math.floor(blockLen * 0.75);
        var loudSum = 0; var loudCount = 0;
        for (var i = 0; i + blockLen <= total; i += hop) {
          var sq = 0;
          for (var j = i; j < i + blockLen; j++) sq += L[j]*L[j] + R[j]*R[j];
          var rmsVal = Math.sqrt(sq / (blockLen * 2));
          if (rmsVal > 0.0001) { loudSum += rmsVal * rmsVal; loudCount++; }
        }
        var avgRMS = loudCount > 0 ? Math.sqrt(loudSum / loudCount) : 0.001;
        var lufs = Math.round(Math.max(-50, Math.min(-3, 20*Math.log10(avgRMS)-0.691)) * 10) / 10;

        // True Peak
        var maxPk = 0;
        var stride = Math.max(1, Math.floor(total / 200000));
        for (var i = 0; i < total; i += stride) {
          var pk = Math.abs(L[i]) > Math.abs(R[i]) ? Math.abs(L[i]) : Math.abs(R[i]);
          if (pk > maxPk) maxPk = pk;
        }
        var peakDb = maxPk > 0 ? Math.round(20*Math.log10(maxPk)*10)/10 : -60;

        // Dynamic Range
        var segLen = Math.floor(sr * 1.0);
        var segMax = -999; var segMin = 999; var segHigh = -999; var segLow = 999;
        var segCount = 0;
        var allSegs = [];
        for (var i = 0; i + segLen <= total; i += segLen) {
          var sq = 0;
          for (var j = i; j < i + segLen; j++) sq += L[j]*L[j];
          var segRMS = Math.sqrt(sq / segLen);
          if (segRMS > 0.0001) { allSegs.push(20*Math.log10(segRMS)); segCount++; }
        }
        allSegs.sort(function(a, b) { return b - a; });
        var topN = Math.max(1, Math.floor(allSegs.length * 0.1));
        var botN = Math.max(0, Math.floor(allSegs.length * 0.9));
        var topSum = 0; var botSum = 0; var botCount = 0;
        for (var k = 0; k < topN; k++) topSum += allSegs[k];
        for (var k = botN; k < allSegs.length; k++) { botSum += allSegs[k]; botCount++; }
        var topAvg = topSum / topN;
        var botAvg = botCount > 0 ? botSum / botCount : topAvg - 10;
        var dynRange = Math.round(Math.max(2, Math.min(40, topAvg - botAvg)) * 10) / 10;

        // Stereo Width
        var sumLR = 0; var sumL2 = 0; var sumR2 = 0;
        var strd = Math.max(1, Math.floor(total / 60000));
        for (var i = 0; i < total; i += strd) {
          sumLR += L[i]*R[i]; sumL2 += L[i]*L[i]; sumR2 += R[i]*R[i];
        }
        var corrDenom = Math.sqrt(sumL2 * sumR2);
        var corr = corrDenom > 0 ? Math.max(-1, Math.min(1, sumLR / corrDenom)) : 1;
        var stereoWidth = Math.round(Math.max(0, Math.min(1, (1-corr)/2)) * 100);

        // Frequency bands
        var fMid0 = Math.floor(total * 0.3);
        var fMid1 = Math.floor(total * 0.7);
        var getBand = function(loHz, hiHz) {
          var period = Math.max(2, Math.floor(sr / ((hiHz + loHz) / 2)));
          var bandSq = 0; var bandN = 0;
          for (var bi = fMid0; bi + period < fMid1; bi += period) {
            var bandS = 0;
            for (var bj = bi; bj < bi + period; bj++) bandS += Math.abs((L[bj]+R[bj])/2);
            bandSq += (bandS/period)*(bandS/period); bandN++;
          }
          return bandN > 0 ? 20*Math.log10(Math.sqrt(bandSq/bandN)+0.000001) : -60;
        };

        var freq = {
          sub: getBand(20,80), low: getBand(80,250), lowMid: getBand(250,600),
          mid: getBand(600,2500), highMid: getBand(2500,7000),
          high: getBand(7000,14000), air: getBand(14000,20000),
        };

        var clamp = function(v, mn, mx, def) {
          return (!isFinite(v) || isNaN(v)) ? def : Math.max(mn, Math.min(mx, v));
        };

        resolve({
          lufs: clamp(lufs, -60, 0, -20),
          peakDb: clamp(peakDb, -60, 0, -6),
          dynRange: clamp(dynRange, 0, 50, 12),
          stereoWidth: clamp(stereoWidth, 0, 100, 50),
          freq: {
            sub: clamp(freq.sub,-80,0,-40), low: clamp(freq.low,-80,0,-40),
            lowMid: clamp(freq.lowMid,-80,0,-40), mid: clamp(freq.mid,-80,0,-40),
            highMid: clamp(freq.highMid,-80,0,-40), high: clamp(freq.high,-80,0,-40),
            air: clamp(freq.air,-80,0,-40),
          },
          duration: clamp(totalDuration, 0, 99999, 0),
          isLongFile: isLongFile,
          sliceCount: sliceCount,
          sampleRate: sr || 44100,
          channels: numCh || 1,
          fileSize: Math.round(file.size / 1024),
        });
      } catch(analysisErr) { reject(analysisErr); }
    };
    reader.readAsArrayBuffer(file);
  });
}

// ── DIAGNOSIS HELPERS ─────────────────────────────────────────────────────────
function getLufsDiagnosis(lufs) {
  if (lufs < -24) return { label:"Very Quiet", color:"#ff5757", advice:"Your mix is significantly too quiet for streaming. This is the most important thing to fix." };
  if (lufs < -20) return { label:"Too Quiet", color:"#ff5757", advice:"Below streaming target. Viewers will struggle to hear it at normal volume." };
  if (lufs < -18) return { label:"Slightly Quiet", color:"#ffb347", advice:"A little below target. A small gain increase will bring it to the streaming sweet spot." };
  if (lufs <= -14) return { label:"Good", color:"#00e5a0", advice:"Your loudness is in the ideal range for streaming platforms." };
  if (lufs <= -10) return { label:"Slightly Loud", color:"#ffb347", advice:"Slightly above target. Consider pulling back your master level a little." };
  return { label:"Too Loud", color:"#ff5757", advice:"Your mix is very loud and may be clipping on some platforms." };
}
function getDynDiagnosis(dr) {
  if (dr < 4) return { label:"Over-compressed", color:"#ff5757", advice:"Very little dynamic range. The mix may sound flat. Ease off the compression." };
  if (dr < 8) return { label:"Slightly Compressed", color:"#ffb347", advice:"A little tight but acceptable for live streaming." };
  if (dr <= 14) return { label:"Good", color:"#00e5a0", advice:"Dynamic range is ideal for streaming. Natural and controlled." };
  if (dr <= 20) return { label:"Wide", color:"#ffb347", advice:"Quite dynamic. Add gentle compression on the master bus." };
  return { label:"Very Wide", color:"#ff5757", advice:"Extremely wide. Quiet parts will be inaudible on stream. Compression needed." };
}
function getPeakDiagnosis(peak) {
  if (peak > 0) return { label:"Clipping!", color:"#ff5757", advice:"Clipping! Causes distortion. Pull master level down immediately." };
  if (peak > -1) return { label:"Danger Zone", color:"#ff5757", advice:"Dangerously close to clipping. Reduce master level by at least 2 dB." };
  if (peak > -3) return { label:"A bit hot", color:"#ffb347", advice:"A little high. Pull back 1-2 dB for safer headroom." };
  if (peak > -6) return { label:"Good", color:"#00e5a0", advice:"Healthy peak level with good headroom." };
  return { label:"Low", color:"#ffb347", advice:"Peak level is low. You may have room to raise your overall level." };
}
function getStereoDiagnosis(sw) {
  if (sw < 10) return { label:"Nearly Mono", color:"#ffb347", advice:"Very narrow stereo. Try spreading instruments left and right." };
  if (sw <= 60) return { label:"Good", color:"#00e5a0", advice:"Healthy stereo width. Translates well to speakers and earphones." };
  if (sw <= 80) return { label:"Wide", color:"#ffb347", advice:"Quite wide. Check mono compatibility on a phone speaker." };
  return { label:"Very Wide", color:"#ff5757", advice:"Extremely wide. May cause phase issues on mono devices." };
}
function getFreqAdvice(freq) {
  if (!freq) return [{ band:"Frequency Balance", issue:"Unknown", fix:"Could not analyze frequency balance." }];
  var ref = ((freq.mid || -40) + (freq.highMid || -40)) / 2;
  var advice = [];
  if ((freq.sub || -60) > ref + 6) advice.push({ band:"Sub Bass (20-80 Hz)", issue:"Too much", fix:"Cut the sub-bass. Adding boom that wastes headroom on stream." });
  if ((freq.low || -60) > ref + 5) advice.push({ band:"Low Bass (80-250 Hz)", issue:"Too much", fix:"Cut the low-end. Mix sounds boomy. Apply high-pass filters on channels that do not need bass." });
  if ((freq.lowMid || -60) > ref + 4) advice.push({ band:"Low Mids (250-600 Hz)", issue:"Muddy", fix:"Cut here. This is the mud zone. Improves clarity and intelligibility significantly." });
  if ((freq.mid || -60) < ref - 5) advice.push({ band:"Mids (600Hz - 2.5kHz)", issue:"Scooped", fix:"The mids are too low. This is where voices live. Boost here for better intelligibility." });
  if ((freq.highMid || -60) < ref - 5) advice.push({ band:"Upper Mids (2.5-7kHz)", issue:"Dull", fix:"Boost upper mids to add presence and help vocals cut through on stream." });
  if ((freq.high || -60) < ref - 8) advice.push({ band:"Highs (7-14kHz)", issue:"Dark", fix:"Mix sounds dark or muffled. A gentle high-shelf boost adds air and clarity." });
  if ((freq.air || -60) < ref - 12) advice.push({ band:"Air (14-20kHz)", issue:"Missing", fix:"Very little high-frequency air. A gentle shelf above 12kHz adds sparkle and openness." });
  if (advice.length === 0) advice.push({ band:"Overall Frequency Balance", issue:"Good", fix:"Frequency balance looks reasonable. Focus on the loudness and dynamics recommendations." });
  return advice;
}
function generateRecs(lufs, peak, dynRange, stereoWidth, freq) {
  var safeL = isFinite(lufs) ? lufs : -20;
  var safeP = isFinite(peak) ? peak : -6;
  var safeD = isFinite(dynRange) ? dynRange : 12;
  var safeS = isFinite(stereoWidth) ? stereoWidth : 50;
  var safeF = freq || { sub:-40, low:-40, lowMid:-40, mid:-40, highMid:-40, high:-40, air:-40 };
  var recs = [];
  if (safeL < -20) recs.push({ priority:"high", title:"Increase Overall Level", detail:"At " + safeL + " LUFS your mix is too quiet for streaming. Target is -16 LUFS. Gradually increase your master output." });
  else if (safeL < -17) recs.push({ priority:"med", title:"Slightly Raise Your Level", detail:"At " + safeL + " LUFS you are close to target. Add 1-3 dB on your master output." });
  else recs.push({ priority:"ok", title:"Good Overall Level", detail:"Loudness at " + safeL + " LUFS is within the ideal streaming range. Maintain this." });
  if (safeP > -1) recs.push({ priority:"high", title:"Fix Clipping Immediately", detail:"Peaking at " + safeP + " dBTP causes distortion. Reduce master level before anything else." });
  else if (safeP > -3) recs.push({ priority:"med", title:"Reduce Headroom Risk", detail:"Peak at " + safeP + " dBTP is close to distorting. Pull master down by 2 dB." });
  if (safeD > 16) recs.push({ priority:"high", title:"Add Compression", detail:"Dynamic range of " + safeD + " LU is too wide for streaming. Quiet moments will be inaudible. Add a compressor at 2:1 or 3:1 on your master output." });
  else if (safeD < 4) recs.push({ priority:"med", title:"Ease Off Compression", detail:"Only " + safeD + " LU of dynamic range. Mix sounds flat. Reduce compression ratio or raise the threshold." });
  else recs.push({ priority:"ok", title:"Good Dynamic Control", detail:"Dynamic range of " + safeD + " LU is healthy for streaming." });
  if (safeS < 15) recs.push({ priority:"med", title:"Widen Stereo Image", detail:"Mix is nearly mono at " + safeS + "%. Pan instruments left and right for a wider, more immersive sound." });
  else if (safeS > 80) recs.push({ priority:"med", title:"Check Mono Compatibility", detail:"Very wide stereo at " + safeS + "%. Test on a phone speaker. If it sounds thin, narrow the stereo width." });
  var freqAdvice = getFreqAdvice(safeF);
  for (var fi = 0; fi < freqAdvice.length; fi++) {
    if (freqAdvice[fi].issue !== "Good") recs.push({ priority:"med", title:freqAdvice[fi].band + " - " + freqAdvice[fi].issue, detail:freqAdvice[fi].fix });
  }
  recs.push({ priority:"tip", title:"Dedicated Stream Output", detail:"Always use a dedicated output for your stream, separate from your main house speakers. This lets you control stream level independently." });
  recs.push({ priority:"tip", title:"High Pass Filter Every Channel", detail:"Apply a high-pass filter on every channel that does not need deep bass. Removes rumble and muddiness." });
  recs.push({ priority:"tip", title:"Phone Speaker Test", detail:"Check your stream on earbuds or a phone speaker before going live. If it sounds good there, it sounds good for most of your audience." });
  return recs;
}

function generatePDF(results, fileName) {
  var win = window.open("", "_blank");
  if (!win) { alert("Please allow popups to download the PDF report."); return; }
  var now = new Date().toLocaleDateString();
  var ld = getLufsDiagnosis(results.lufs);
  var dd = getDynDiagnosis(results.dynRange);
  var pd = getPeakDiagnosis(results.peakDb);
  var sd = getStereoDiagnosis(results.stereoWidth);
  var freqRows = results.freq ? [
    ["Sub Bass 20-80 Hz", Math.round(results.freq.sub)],
    ["Low Bass 80-250 Hz", Math.round(results.freq.low)],
    ["Low Mids 250-600 Hz", Math.round(results.freq.lowMid)],
    ["Mids 600Hz-2.5kHz", Math.round(results.freq.mid)],
    ["Upper Mids 2.5-7kHz", Math.round(results.freq.highMid)],
    ["Highs 7-14kHz", Math.round(results.freq.high)],
    ["Air 14-20kHz", Math.round(results.freq.air)],
  ] : [];
  var recHTML = results.recs.map(function(r) {
    return '<div class="rec ' + r.priority + '"><div class="rt">' + r.title + '</div><div class="rd">' + r.detail + '</div></div>';
  }).join("");
  var freqHTML = freqRows.map(function(row) {
    return '<div class="fi"><span>' + row[0] + '</span><span>' + row[1] + ' dB rel</span></div>';
  }).join("");
  win.document.write('<!DOCTYPE html><html><head><title>MixCheck AI Report</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#111}h1{font-size:28px;margin:0 0 4px}.sub{color:#666;font-size:13px;margin-bottom:32px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}.metric{border:1px solid #e0e0e0;border-radius:10px;padding:16px}.ml{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:6px}.mv{font-size:26px;font-weight:900;margin-bottom:4px}.ms{font-size:11px;font-weight:700;margin-bottom:6px}.ma{font-size:12px;color:#555;line-height:1.5}.st{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#00a070;border-bottom:2px solid #00a070;padding-bottom:8px;margin:28px 0 16px}.rec{border-left:3px solid #ccc;padding:10px 14px;margin-bottom:12px;background:#fafafa;border-radius:0 8px 8px 0}.rec.high{border-color:#e33}.rec.med{border-color:#f90}.rec.ok{border-color:#0a0}.rec.tip{border-color:#4a7cff}.rt{font-weight:700;font-size:14px;margin-bottom:4px}.rd{font-size:13px;color:#444;line-height:1.6}.fi{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}.footer{margin-top:48px;text-align:center;font-size:11px;color:#aaa}</style></head><body>');
  win.document.write('<h1>MixCheck AI</h1><div class="sub">Audio Analysis Report - ' + now + ' - ' + fileName + '</div>');
  win.document.write('<div class="grid">');
  win.document.write('<div class="metric"><div class="ml">Loudness</div><div class="mv">' + results.lufs + ' LUFS</div><div class="ms">Target: -16 LUFS | ' + ld.label + '</div><div class="ma">' + ld.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">True Peak</div><div class="mv">' + results.peakDb + ' dBTP</div><div class="ms">Target: below -1 dBTP | ' + pd.label + '</div><div class="ma">' + pd.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">Dynamic Range</div><div class="mv">' + results.dynRange + ' LU</div><div class="ms">Target: 8-14 LU | ' + dd.label + '</div><div class="ma">' + dd.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">Stereo Width</div><div class="mv">' + results.stereoWidth + '%</div><div class="ms">Target: 20-75% | ' + sd.label + '</div><div class="ma">' + sd.advice + '</div></div>');
  win.document.write('</div>');
  win.document.write('<div class="st">Recommendations</div>' + recHTML);
  if (freqHTML) win.document.write('<div class="st">Frequency Balance</div>' + freqHTML);
  win.document.write('<div class="st">File Info</div>');
  win.document.write('<div class="fi"><span>Duration</span><span>' + Math.floor(results.duration/60) + 'm ' + (results.duration%60) + 's</span></div>');
  win.document.write('<div class="fi"><span>Channels</span><span>' + (results.channels === 1 ? "Mono" : "Stereo") + '</span></div>');
  win.document.write('<div class="footer">MixCheck AI - mixcheckai.com - ' + now + '</div>');
  win.document.write('</body></html>');
  win.document.close();
  setTimeout(function() { win.print(); }, 500);
}

const MIXER_GROUPS = [
  { label:"Allen and Heath", mixers:[
    { id:"qu24", name:"QU-24", type:"digital", streams:"Mix 7+8" },
    { id:"qu16", name:"QU-16", type:"digital", streams:"Mix 3+4" },
    { id:"qu32", name:"QU-32", type:"digital", streams:"Mix 7+8" },
    { id:"sq5",  name:"SQ-5",  type:"digital", streams:"Mix 1-2" },
    { id:"sq6",  name:"SQ-6",  type:"digital", streams:"Mix 1-2" },
    { id:"zed10",name:"ZED-10",type:"analog",  streams:"Alt Out" },
  ]},
  { label:"Behringer", mixers:[
    { id:"x32",  name:"X32",         type:"digital", streams:"Bus 15-16" },
    { id:"x32c", name:"X32 Compact", type:"digital", streams:"Bus 15-16" },
    { id:"xr18", name:"XR18",        type:"digital", streams:"Bus 5-6" },
    { id:"xenyx",name:"Xenyx",       type:"analog",  streams:"Main Out" },
  ]},
  { label:"Yamaha", mixers:[
    { id:"tf1", name:"TF1",       type:"digital", streams:"Omni Out" },
    { id:"tf3", name:"TF3/TF5",   type:"digital", streams:"Omni Out" },
    { id:"ql1", name:"QL1/QL5",   type:"digital", streams:"Omni Out" },
    { id:"mg",  name:"MG Series", type:"analog",  streams:"2TR Out" },
  ]},
  { label:"Other", mixers:[
    { id:"m32",        name:"Midas M32",          type:"digital", streams:"Bus 15-16" },
    { id:"studiolive", name:"PreSonus StudioLive", type:"digital", streams:"Aux Out" },
    { id:"soundcraft", name:"Soundcraft EFX",      type:"analog",  streams:"2TR Out" },
    { id:"mackie",     name:"Mackie ProFX",        type:"analog",  streams:"Alt Out" },
  ]},
];

function AnalyzePage({ navigate, isPro, onUnlockClick }) {
  var stepState = useState(1); var step = stepState[0]; var setStep = stepState[1];
  var mixerState = useState(null); var mixer = mixerState[0]; var setMixer = mixerState[1];
  var customState = useState(""); var customMixer = customState[0]; var setCustomMixer = customState[1];
  var showCustState = useState(false); var showCustom = showCustState[0]; var setShowCustom = showCustState[1];
  var fileState = useState(null); var file = fileState[0]; var setFile = fileState[1];
  var analyzingState = useState(false); var analyzing = analyzingState[0]; var setAnalyzing = analyzingState[1];
  var statusState = useState(""); var analyzeStatus = statusState[0]; var setAnalyzeStatus = statusState[1];
  var resultsState = useState(null); var results = resultsState[0]; var setResults = resultsState[1];
  var dragState = useState(false); var dragOver = dragState[0]; var setDragOver = dragState[1];
  var fileRef = useRef(); var fileRef2 = useRef();

  var selectedMixer = showCustom && customMixer.trim()
    ? { id:"custom", name: customMixer.trim(), type:"unknown", streams:"Aux/Main Out" }
    : (mixer || { id:"none", name:"Unknown Mixer", type:"unknown", streams:"Aux Out" });

  var analyze = useCallback(async function(f) {
    if (!f) return;
    var ext = f.name.split(".").pop().toLowerCase();
    var validExts = ["mp3","wav","aac","m4a","flac","ogg","mp4","mov","webm","wma"];
    if (validExts.indexOf(ext) === -1) {
      setResults({ error:"File type not supported. Upload MP3, WAV, AAC, M4A, or FLAC." });
      setStep(3); return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setResults({ error:"File too large (max 500MB). For a 2-hour service, export as MP3 128kbps - it will be under 115MB." });
      setStep(3); return;
    }
    setFile(f); setAnalyzing(true); setResults(null);
    var mb = Math.round(f.size / 1024 / 1024);
    try {
      setAnalyzeStatus(mb > 50 ? "Reading " + mb + "MB file - please wait..." : "Reading audio file...");
      await new Promise(function(r) { setTimeout(r, 80); });
      setAnalyzeStatus(mb > 50 ? "Decoding and sampling key sections..." : "Measuring loudness, peak, dynamics...");
      var m = await measureAudio(f);
      setAnalyzeStatus("Analyzing frequency balance...");
      await new Promise(function(r) { setTimeout(r, 80); });
      setAnalyzeStatus("Generating recommendations...");
      var recs = generateRecs(
        m.lufs !== undefined ? m.lufs : -20,
        m.peakDb !== undefined ? m.peakDb : -6,
        m.dynRange !== undefined ? m.dynRange : 12,
        m.stereoWidth !== undefined ? m.stereoWidth : 50,
        m.freq || null
      );
      setResults(Object.assign({}, m, { recs: recs, mixer: selectedMixer }));
      setStep(3);
    } catch(err) {
      setResults({ error: (err && err.message) ? err.message : "Could not analyze. Try an MP3 or WAV file." });
      setStep(3);
    }
    setAnalyzing(false); setAnalyzeStatus("");
  }, [selectedMixer]);

  var onDrop = useCallback(function(e) {
    e.preventDefault(); setDragOver(false);
    var f = e.dataTransfer.files[0]; if(f) analyze(f);
  }, [analyze]);
  var onPick = function(e) { if (e.target.files[0]) analyze(e.target.files[0]); };
  var reset = function() { setStep(1); setMixer(null); setFile(null); setResults(null); setShowCustom(false); setCustomMixer(""); };
  var prioColor = function(p) { return ({ high:"#ff5757", med:"#ffb347", ok:"#00e5a0", tip:"#4a7cff" })[p] || "#4a5568"; };

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>AUDIO ANALYZER</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, margin:"0 0 8px", letterSpacing:-1.5, color:"#fff" }}>Analyze your mix.</h1>
          <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Upload a recording. Get real measurements and plain-English advice. Handles 2-hour files.</p>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:28, alignItems:"center" }}>
          {[["1","Mixer"],["2","Upload"],["3","Results"]].map(function(item, i) {
            return (
              <React.Fragment key={item[0]}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, fontFamily:"monospace", background: step>i+1?"#00e5a0":step===i+1?"rgba(0,229,160,0.15)":"#0d1017", border: step>=i+1?"1.5px solid #00e5a0":"1.5px solid #1a1f2e", color: step>i+1?"#07090f":step===i+1?"#00e5a0":"#2a3040" }}>{step>i+1?"v":item[0]}</div>
                  <span style={{ fontSize:9, color: step===i+1?"#e8eaf0":"#2a3040", fontFamily:"sans-serif" }}>{item[1]}</span>
                </div>
                {i<2 && <div style={{ flex:1, height:1, background: step>i+1?"#00e5a044":"#1a1f2e" }} />}
              </React.Fragment>
            );
          })}
        </div>

        {step === 1 && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>Select your mixer for best results. Works with any mixer.</div>
            {MIXER_GROUPS.map(function(g, gi) {
              return (
                <div key={gi} style={{ marginBottom:20 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>{g.label.toUpperCase()}</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
                    {g.mixers.map(function(m) {
                      var selected = mixer && mixer.id === m.id;
                      return (
                        <button key={m.id} onClick={function() { setMixer(m); setShowCustom(false); setStep(2); }}
                          style={{ background: selected?"rgba(0,229,160,0.1)":"#0d1017", border: selected?"1.5px solid #00e5a0":"1px solid #1a1f2e", borderRadius:10, padding:"12px 10px", cursor:"pointer", textAlign:"left" }}>
                          <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>{m.name}</div>
                          <div style={{ fontSize:9, color: m.type==="digital"?"#4a7cff":"#ffb347", background: m.type==="digital"?"rgba(74,124,255,0.1)":"rgba(255,179,71,0.1)", padding:"2px 6px", borderRadius:4, fontFamily:"monospace", fontWeight:700, display:"inline-block" }}>{m.type.toUpperCase()}</div>
                          <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif", marginTop:4 }}>{m.streams}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"16px" }}>
              <div style={{ fontSize:11, color:"#ffb347", fontFamily:"monospace", fontWeight:700, letterSpacing:2, marginBottom:12 }}>MY MIXER IS NOT LISTED</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input placeholder="Type your mixer name" value={customMixer}
                  onChange={function(e) { setCustomMixer(e.target.value); setShowCustom(true); setMixer(null); }}
                  style={{ flex:1, minWidth:180, background:"#060810", border:"1px solid #1a1f2e", borderRadius:8, padding:"10px 14px", color:"#e8eaf0", fontSize:13, fontFamily:"sans-serif", outline:"none" }} />
                <button onClick={function() { if(customMixer.trim()) { setShowCustom(true); setStep(2); } }} disabled={!customMixer.trim()}
                  style={{ background: customMixer.trim()?"#ffb347":"#1a1f2e", color: customMixer.trim()?"#07090f":"#2a3040", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor: customMixer.trim()?"pointer":"not-allowed" }}>
                  Use This
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && !analyzing && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:10, padding:"10px 16px", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>🎛</span>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif" }}>{selectedMixer.name}</div>
                  <div style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>Stream: {selectedMixer.streams}</div>
                </div>
              </div>
              <button onClick={function() { setStep(1); }} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Change</button>
            </div>
            <div style={{ background:"rgba(74,124,255,0.06)", border:"1px solid rgba(74,124,255,0.2)", borderRadius:10, padding:"10px 16px", marginBottom:16, fontSize:12, color:"#8892a4", fontFamily:"sans-serif" }}>
              Supports files up to 500MB. For 2-hour recordings, MP3 at 128kbps is recommended (approx 115MB).
            </div>
            <div
              onClick={function() { fileRef.current.click(); }}
              onDrop={onDrop}
              onDragOver={function(e) { e.preventDefault(); setDragOver(true); }}
              onDragLeave={function() { setDragOver(false); }}
              style={{ border:"2px dashed "+(dragOver?"#00e5a0":"#1a1f2e"), borderRadius:20, padding:"56px 32px", textAlign:"center", cursor:"pointer", background: dragOver?"rgba(0,229,160,0.04)":"#0d1017" }}
            >
              <div style={{ fontSize:44, marginBottom:14 }}>🎵</div>
              <div style={{ fontSize:16, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:8 }}>Drop your audio file here</div>
              <div style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif", marginBottom:20 }}>MP3, WAV, AAC, M4A, FLAC - up to 2 hours</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#00e5a0", color:"#07090f", borderRadius:8, padding:"10px 22px", fontSize:13, fontWeight:700, fontFamily:"sans-serif" }}>Choose File</div>
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

        {step === 3 && results && !analyzing && (
          <div style={{ animation:"fadein 0.4s ease" }}>
            {results.error ? (
              <div style={{ background:"rgba(255,87,87,0.08)", border:"1px solid rgba(255,87,87,0.3)", borderRadius:16, padding:"28px", textAlign:"center" }}>
                <div style={{ fontSize:32, marginBottom:16 }}>warning</div>
                <div style={{ fontSize:15, fontWeight:700, color:"#ff5757", fontFamily:"sans-serif", marginBottom:8 }}>Could not analyze this file</div>
                <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>{results.error}</div>
                <button onClick={reset} style={{ background:"#ff5757", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Try Another File</button>
              </div>
            ) : (
              <div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
                  {results.mixer && <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>{results.mixer.name}</div>}
                  {file && <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{file.name}</div>}
                  {results.duration > 0 && <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{Math.floor(results.duration/60)}m {results.duration%60}s</div>}
                  {results.isLongFile && <div style={{ background:"rgba(255,179,71,0.1)", border:"1px solid rgba(255,179,71,0.3)", borderRadius:8, padding:"6px 14px", fontSize:11, color:"#ffb347", fontFamily:"sans-serif" }}>Sampled {results.sliceCount} sections of long recording</div>}
                  {isPro && <button onClick={function() { generatePDF(results, file ? file.name : "recording"); }} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Download PDF Report</button>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10, marginBottom:20 }}>
                  {[
                    Object.assign({ label:"LOUDNESS", val:results.lufs+" LUFS", target:"Target: -16 LUFS" }, getLufsDiagnosis(results.lufs)),
                    Object.assign({ label:"TRUE PEAK", val:results.peakDb+" dBTP", target:"Below -1 dBTP" }, getPeakDiagnosis(results.peakDb)),
                    Object.assign({ label:"DYNAMIC RANGE", val:results.dynRange+" LU", target:"Target: 8-14 LU" }, getDynDiagnosis(results.dynRange)),
                    Object.assign({ label:"STEREO WIDTH", val:results.stereoWidth+"%", target:"Target: 20-75%" }, getStereoDiagnosis(results.stereoWidth)),
                  ].map(function(m, i) {
                    return (
                      <div key={i} style={{ background:"#0d1017", border:"1px solid "+m.color+"33", borderRadius:12, padding:"14px" }}>
                        <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>{m.label}</div>
                        <div style={{ fontSize:20, fontWeight:900, color:m.color, letterSpacing:-1, marginBottom:2 }}>{m.val}</div>
                        <div style={{ fontSize:10, color:m.color, fontWeight:700, fontFamily:"sans-serif", marginBottom:3 }}>{m.label}</div>
                        <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>{m.target}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>RECOMMENDATIONS</div>
                  {results.recs.map(function(r, i) {
                    return (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom:i<results.recs.length-1?13:0, marginBottom:i<results.recs.length-1?13:0, borderBottom:i<results.recs.length-1?"1px solid #1a1f2e":"none" }}>
                        <div style={{ width:6, height:6, borderRadius:"50%", background:prioColor(r.priority), marginTop:6, flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:3 }}>{r.title}</div>
                          <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>{r.detail}</div>
                        </div>
                        <div style={{ fontSize:9, color:prioColor(r.priority), fontFamily:"monospace", fontWeight:700, letterSpacing:1, flexShrink:0 }}>{r.priority.toUpperCase()}</div>
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                  <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>FREQUENCY BALANCE</div>
                  {getFreqAdvice(results.freq).map(function(f, i) {
                    var fa = getFreqAdvice(results.freq);
                    return (
                      <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start", paddingBottom:i<fa.length-1?12:0, marginBottom:i<fa.length-1?12:0, borderBottom:i<fa.length-1?"1px solid #1a1f2e":"none" }}>
                        <div style={{ minWidth:8, height:8, borderRadius:"50%", background: f.issue==="Good"?"#00e5a0":"#ffb347", marginTop:5, flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:11, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:2 }}>{f.band} <span style={{ color: f.issue==="Good"?"#00e5a0":"#ffb347", fontSize:10 }}>({f.issue})</span></div>
                          <div style={{ fontSize:11, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.5 }}>{f.fix}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!isPro && (
                  <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1px solid rgba(0,229,160,0.25)", borderRadius:14, padding:"18px", marginBottom:20 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Get your PDF Report</div>
                        <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>Pro users download a full printable PDF report. Unlimited uploads included.</div>
                      </div>
                      <button onClick={onUnlockClick} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"10px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Unlock Pro</button>
                    </div>
                  </div>
                )}
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  <button onClick={reset} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"11px 22px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>Analyze Another File</button>
                  {isPro && <button onClick={function() { generatePDF(results, file ? file.name : "recording"); }} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:10, padding:"11px 22px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Download PDF Report</button>}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function HomePage({ navigate, isPro, onUnlockClick }) {
  var STEPS = [
    { num:"01", icon:"🎙", title:"Upload Your Recording", desc:"Drop any file from your livestream or rehearsal. MP3, WAV, AAC supported. Works up to 2 hours. No account needed." },
    { num:"02", icon:"📊", title:"Get Real Measurements", desc:"We measure actual loudness, dynamic range, frequency balance and stereo width from your file. Every recording gives unique results." },
    { num:"03", icon:"💡", title:"Follow Plain-English Advice", desc:"No jargon. Clear, actionable steps to make your stream sound better this Sunday. Works with any mixer." },
  ];
  var FEATS = [
    { icon:"📡", t:"Livestream Optimized", d:"Analysis targets -16 LUFS for Facebook and YouTube streams." },
    { icon:"🎚", t:"25 Plus Mixers", d:"Allen & Heath, Behringer, Yamaha, Midas, and more. Plus custom input." },
    { icon:"📄", t:"PDF Report (Pro)", d:"Download a printable full report. Pro feature." },
    { icon:"🔁", t:"Real Measurements", d:"Every file analyzed uniquely. No fixed default numbers." },
    { icon:"📱", t:"Works on Any Device", d:"Check your mix on your phone between songs." },
    { icon:"🧠", t:"Plain English Advice", d:"Built for volunteers. No audio degree needed." },
  ];
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", color:"#e8eaf0", fontFamily:"Georgia,serif" }}>
      <section style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"120px 20px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"25%", left:"50%", transform:"translateX(-50%)", width:600, height:400, background:"radial-gradient(ellipse,rgba(0,229,160,0.07) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:999, padding:"6px 16px", marginBottom:28, animation:"float 3s ease-in-out infinite" }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0" }} />
          <span style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>Built for Sound Tech Volunteers</span>
        </div>
        <h1 style={{ fontSize:"clamp(34px,7vw,70px)", fontWeight:900, lineHeight:1.05, margin:"0 0 20px", color:"#fff", maxWidth:780, letterSpacing:-2 }}>Your livestream mix,<br /><span style={{ color:"#00e5a0", fontStyle:"italic" }}>finally sounding right.</span></h1>
        <p style={{ fontSize:"clamp(15px,2.5vw,19px)", color:"#6b7280", maxWidth:520, lineHeight:1.7, margin:"0 0 14px", fontFamily:"sans-serif" }}>Upload your recording. Get real measurements and plain-English advice to fix your stream.</p>
        <p style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginBottom:36 }}>Trusted by sound tech volunteers worldwide</p>
        <div style={{ display:"flex", alignItems:"center", gap:3, height:44, marginBottom:40 }}>
          {[0.4,0.7,1,0.6,0.9,0.5,0.8,1,0.3,0.7,0.9,0.6,0.4,0.8,0.5,0.7,1,0.6,0.9,0.4].map(function(h,i) {
            return <div key={i} style={{ width:3, height:(h*100)+"%", background:"rgba(0,229,160,"+(0.3+h*0.5)+")", borderRadius:2, animation:"wave "+(0.8+(i%5)*0.2)+"s ease-in-out infinite alternate", animationDelay:(i*0.05)+"s" }} />;
          })}
        </div>
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
          <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", boxShadow:"0 0 32px rgba(0,229,160,0.25)" }}>Analyze My Mix Free</button>
          {!isPro && <button onClick={onUnlockClick} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 32px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Unlock Pro</button>}
        </div>
      </section>
      <section style={{ padding:"100px 20px", background:"#07090f" }}>
        <div style={{ maxWidth:960, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize:"clamp(26px,4vw,42px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Three steps to a better stream.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20 }}>
            {STEPS.map(function(s,i) {
              return (
                <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"28px 24px", position:"relative" }}>
                  <div style={{ position:"absolute", top:18, right:18, fontSize:11, fontFamily:"monospace", fontWeight:700, color:"#1e2535" }}>{s.num}</div>
                  <div style={{ fontSize:34, marginBottom:18 }}>{s.icon}</div>
                  <h3 style={{ fontSize:17, fontWeight:800, margin:"0 0 10px", color:"#fff" }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.7, margin:0, fontFamily:"sans-serif" }}>{s.desc}</p>
                </div>
              );
            })}
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
            {FEATS.map(function(f,i) {
              return (
                <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"22px 20px", display:"flex", gap:14, alignItems:"flex-start" }}>
                  <div style={{ fontSize:24, lineHeight:1, marginTop:2 }}>{f.icon}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", marginBottom:5, fontFamily:"sans-serif" }}>{f.t}</div>
                    <div style={{ fontSize:12, color:"#6b7280", lineHeight:1.6, fontFamily:"sans-serif" }}>{f.d}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section style={{ padding:"80px 20px", textAlign:"center" }}>
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, letterSpacing:-1.5, margin:"0 0 18px", color:"#fff" }}>Ready to sound better this Sunday?</h2>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", marginBottom:32 }}>Free to start. No credit card. Works on your phone.</p>
          <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Analyze Free</button>
            {!isPro && <button onClick={onUnlockClick} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"14px 30px", fontSize:15, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Unlock Pro</button>}
          </div>
        </div>
      </section>
    </div>
  );
}

function PricingPage({ navigate, isPro, onUnlockClick }) {
  var annualState = useState(false); var annual = annualState[0]; var setAnnual = annualState[1];
  var faqState = useState(null); var openFaq = faqState[0]; var setOpenFaq = faqState[1];
  var monthly = 9.99;
  var price = annual ? (monthly * 0.8).toFixed(2) : monthly.toFixed(2);
  var PRO = [
    { icon:"📄", text:"Full PDF analysis report - download and print" },
    { icon:"🔁", text:"Unlimited uploads - analyze every rehearsal" },
    { icon:"📊", text:"Detailed frequency breakdown per analysis" },
    { icon:"💾", text:"Priority support from a real engineer" },
    { icon:"🆕", text:"All future features included" },
  ];
  var FAQ = [
    { q:"Do I need a credit card to try free?", a:"No. Just upload a file and go. No account needed for the free tier." },
    { q:"Can I cancel anytime?", a:"Yes. Cancel from your Stripe customer portal anytime with no questions." },
    { q:"Is my audio stored on your servers?", a:"No. Files are analyzed entirely in your browser and never uploaded to our servers." },
    { q:"I am a volunteer, not a professional. Is this for me?", a:"This is literally built for you. No audio degree required. Plain English only." },
    { q:"How do I unlock Pro after paying?", a:"After payment you receive an access code by email. Go to mixcheckai.com, tap Get Pro in the top menu, and enter your code." },
    { q:"Can it handle long recordings?", a:"Yes. The analyzer handles files up to 500MB and 2 hours long. For long recordings it analyzes key sections and gives you accurate measurements." },
  ];
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:860, margin:"0 auto", padding:"48px 20px 80px" }}>
        <div style={{ textAlign:"center", marginBottom:44 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>PRICING</div>
          <h1 style={{ fontSize:"clamp(28px,5vw,52px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-2, color:"#fff", lineHeight:1.05 }}>Simple pricing.</h1>
          <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", maxWidth:440, margin:"0 auto 28px" }}>Cancel anytime via Stripe.</p>
          {!isPro && (
            <div style={{ display:"inline-flex", alignItems:"center", gap:0, background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:99, padding:"5px" }}>
              {[["Monthly",false],["Annual - Save 20%",true]].map(function(item) {
                return <button key={item[0]} onClick={function() { setAnnual(item[1]); }} style={{ background: annual===item[1]?"#1a1f2e":"transparent", border:"none", borderRadius:99, padding:"7px 18px", color: annual===item[1]?"#fff":"#4a5568", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>{item[0]}</button>;
              })}
            </div>
          )}
        </div>
        {isPro ? (
          <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.08),rgba(0,229,160,0.02))", border:"1.5px solid rgba(0,229,160,0.4)", borderRadius:20, padding:"40px 32px", textAlign:"center", marginBottom:48 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:24, fontWeight:900, color:"#00e5a0", marginBottom:8, fontFamily:"sans-serif" }}>You are on Pro!</div>
            <div style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:24 }}>You have full access to all Pro features including unlimited uploads and PDF reports.</div>
            <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 32px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>Go Analyze a Mix</button>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:20, marginBottom:52 }}>
            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:20, padding:"30px 26px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#4a5568", fontFamily:"sans-serif", marginBottom:8 }}>Free</div>
              <div style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2, marginBottom:20 }}>$0</div>
              <div style={{ height:1, background:"#1a1f2e", marginBottom:20 }} />
              {["3 uploads per month","Real loudness and frequency analysis","General recommendations"].map(function(f,i) {
                return <div key={i} style={{ display:"flex", gap:10, marginBottom:11 }}><span style={{ color:"#2a3040" }}>v</span><span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>{f}</span></div>;
              })}
              <button onClick={function() { navigate("analyze"); }} style={{ width:"100%", marginTop:22, background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"12px", color:"#4a5568", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Start Free</button>
            </div>
            <div style={{ background:"linear-gradient(160deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1.5px solid rgba(0,229,160,0.35)", borderRadius:20, padding:"30px 26px", position:"relative", animation:"glow 3s ease-in-out infinite" }}>
              <div style={{ position:"absolute", top:-1, left:"50%", transform:"translateX(-50%)", background:"linear-gradient(90deg,#00e5a0,#00c080)", color:"#07090f", fontSize:10, fontWeight:800, fontFamily:"monospace", letterSpacing:2, padding:"4px 18px", borderRadius:"0 0 10px 10px" }}>MOST POPULAR</div>
              <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:8 }}>Pro</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2 }}>${price}</span>
                <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>CAD / mo</span>
              </div>
              <div style={{ height:1, background:"rgba(0,229,160,0.15)", margin:"18px 0" }} />
              {PRO.map(function(f,i) {
                return <div key={i} style={{ display:"flex", gap:10, marginBottom:11, alignItems:"flex-start" }}><span style={{ fontSize:13 }}>{f.icon}</span><span style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.5 }}>{f.text}</span></div>;
              })}
              <button onClick={function() { window.open(STRIPE_PAYMENT_LINK,"_blank"); }} style={{ width:"100%", marginTop:24, background:"linear-gradient(135deg,#00e5a0,#00c080)", border:"none", borderRadius:12, padding:"14px", color:"#07090f", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>
                Subscribe - ${price} CAD/mo
              </button>
              <button onClick={onUnlockClick} style={{ width:"100%", marginTop:10, background:"transparent", border:"1px solid rgba(0,229,160,0.2)", borderRadius:12, padding:"11px", color:"#00e5a0", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                Already paid? Enter access code
              </button>
            </div>
          </div>
        )}
        <div style={{ maxWidth:580, margin:"0 auto" }}>
          <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 24px", letterSpacing:-1, color:"#fff", textAlign:"center" }}>Common questions</h2>
          {FAQ.map(function(f,i) {
            return (
              <div key={i} style={{ borderBottom: i<FAQ.length-1?"1px solid #1a1f2e":"none" }}>
                <button onClick={function() { setOpenFaq(openFaq===i?null:i); }} style={{ width:"100%", background:"none", border:"none", padding:"17px 0", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", gap:14, textAlign:"left" }}>
                  <span style={{ fontSize:14, fontWeight:600, color:"#e8eaf0", fontFamily:"sans-serif" }}>{f.q}</span>
                  <span style={{ color: openFaq===i?"#00e5a0":"#2a3040", fontSize:18, flexShrink:0 }}>{openFaq===i?"-":"+"}</span>
                </button>
                {openFaq===i && <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, margin:"0 0 16px", paddingRight:24 }}>{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SuccessPage({ navigate, isPro, onUnlockClick }) {
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center", maxWidth:520 }}>
        <div style={{ fontSize:48, marginBottom:24 }}>🎉</div>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-1.5, color:"#fff" }}>Payment Successful!</h1>
        <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, marginBottom:28 }}>Thank you for subscribing! Check your email for your Pro access code.</p>
        {isPro ? (
          <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.3)", borderRadius:14, padding:"20px", marginBottom:28 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Pro is Active!</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif" }}>You have full access to all Pro features.</div>
          </div>
        ) : (
          <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"24px", marginBottom:28 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>NEXT STEP</div>
            <div style={{ fontSize:14, color:"#e8eaf0", fontFamily:"sans-serif", fontWeight:600, marginBottom:8 }}>Enter your Pro access code</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:20 }}>Your access code was sent to your email. Check inbox or spam folder.</div>
            <button onClick={onUnlockClick} style={{ width:"100%", background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>Enter My Access Code</button>
            <div style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginTop:12 }}>No email? Contact hello@mixcheckai.com</div>
          </div>
        )}
        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Start Analyzing</button>
          <button onClick={function() { navigate("home"); }} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Go Home</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  var routerResult = useRouter();
  var page = routerResult.page; var navigate = routerResult.navigate;
  var proResult = usePro();
  var isPro = proResult.isPro; var unlockPro = proResult.unlockPro;
  var unlockState = useState(false); var showUnlock = unlockState[0]; var setShowUnlock = unlockState[1];
  useEffect(function() {
    if (page === "success" && !isPro) setShowUnlock(true);
  }, [page, isPro]);
  var renderPage = function() {
    var props = { navigate:navigate, isPro:isPro, onUnlockClick:function() { setShowUnlock(true); } };
    if (page === "home") return React.createElement(HomePage, props);
    if (page === "analyze") return React.createElement(AnalyzePage, props);
    if (page === "pricing") return React.createElement(PricingPage, props);
    if (page === "success") return React.createElement(SuccessPage, props);
    return React.createElement(HomePage, props);
  };
  return (
    <div>
      <Nav navigate={navigate} page={page} isPro={isPro} onUnlockClick={function() { setShowUnlock(true); }} />
      {renderPage()}
      {page !== "success" && <Footer navigate={navigate} />}
      {showUnlock && <ProUnlockModal onClose={function() { setShowUnlock(false); }} onUnlock={unlockPro} />}
    </div>
  );
}
