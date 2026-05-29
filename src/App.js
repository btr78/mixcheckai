import React, { useState, useEffect, useRef, useCallback } from "react";

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/3cIcN6gBO375e6dbQkgbm03";
const STRIPE_PAYMENT_LINK_NOTRIAL = "https://buy.stripe.com/dRmbJ271e9vte6d5rWgbm04"; // no-trial link — pay $9.99 today, unlimited stems immediately
const STRIPE_CREDITS_LINK = "https://buy.stripe.com/3cI4gA85iePNaU1f2wgbm05"; // one-time $2.99 for 10 stem credits

// ── STRIPE PAYMENT LINKS ──────────────────────────────────────────────────────
const STRIPE_TEAM_LINK = "https://buy.stripe.com/3cIcN6gBO375e6dbQkgbm03"; // replace with team plan link
const STRIPE_PORTAL_LINK = "https://billing.stripe.com/p/login/fZu9AU2KY3757HP4nSgbm00";

// ── MIX SCORE ─────────────────────────────────────────────────────────────────
function calcMixScore(lufs, peakDb, dynRange, stereoWidth) {
  var score = 100;
  // Loudness (30 pts)
  var lufsTarget = -16;
  var lufsDiff = Math.abs((isFinite(lufs) ? lufs : -20) - lufsTarget);
  var lufsScore = Math.max(0, 30 - lufsDiff * 4);
  // Peak (20 pts)
  var peakScore = 20;
  if (peakDb > 0) peakScore = 0;
  else if (peakDb > -1) peakScore = 5;
  else if (peakDb > -3) peakScore = 12;
  else if (peakDb > -6) peakScore = 20;
  else peakScore = 14;
  // Dynamics (25 pts)
  var dr = isFinite(dynRange) ? dynRange : 12;
  var dynScore = 0;
  if (dr >= 8 && dr <= 14) dynScore = 25;
  else if (dr >= 6 && dr <= 16) dynScore = 18;
  else if (dr >= 4 && dr <= 20) dynScore = 10;
  else dynScore = 4;
  // Stereo (25 pts)
  var sw = isFinite(stereoWidth) ? stereoWidth : 50;
  var stereoScore = 0;
  if (sw >= 20 && sw <= 75) stereoScore = 25;
  else if (sw >= 10 && sw <= 85) stereoScore = 16;
  else stereoScore = 8;
  var total = Math.round(lufsScore + peakScore + dynScore + stereoScore);
  return Math.max(0, Math.min(100, total));
}

function getScoreLabel(score) {
  if (score >= 90) return { label:"Excellent", color:"#00e5a0", emoji:"🏆" };
  if (score >= 75) return { label:"Good", color:"#4a7cff", emoji:"✅" };
  if (score >= 55) return { label:"Needs Work", color:"#ffb347", emoji:"⚠" };
  return { label:"Needs Attention", color:"#ff5757", emoji:"🔴" };
}

// ── SESSION HISTORY ───────────────────────────────────────────────────────────
function loadHistory() {
  try {
    var raw = localStorage.getItem("mca_history");
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

function saveToHistory(entry) {
  try {
    var history = loadHistory();
    history.unshift(entry);
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem("mca_history", JSON.stringify(history));
  } catch(e) {}
}

function clearHistory() {
  try { localStorage.removeItem("mca_history"); } catch(e) {}
}

// ── USAGE COUNTER ─────────────────────────────────────────────────────────────
function getUsageCount() {
  try {
    var data = JSON.parse(localStorage.getItem("mca_usage") || "{}");
    var month = new Date().getFullYear() + "-" + new Date().getMonth();
    return data.month === month ? (data.count || 0) : 0;
  } catch(e) { return 0; }
}

function incrementUsage() {
  try {
    var month = new Date().getFullYear() + "-" + new Date().getMonth();
    var data = JSON.parse(localStorage.getItem("mca_usage") || "{}");
    var count = data.month === month ? (data.count || 0) + 1 : 1;
    localStorage.setItem("mca_usage", JSON.stringify({ month: month, count: count }));
    return count;
  } catch(e) { return 1; }
}

var FREE_LIMIT = 3;

// ── SUNDAY CHECKLIST ──────────────────────────────────────────────────────────
var CHECKLIST_ITEMS = [
  { id:"hpf",    text:"HPF applied on all channels (except kick and bass)" },
  { id:"stream", text:"Stream send is a separate aux/mix bus from FOH" },
  { id:"limiter",text:"Master limiter is active on your stream output" },
  { id:"mono",   text:"Checked mix in mono on a phone speaker" },
  { id:"gain",   text:"All channel gains set before the service (not during)" },
  { id:"vocal",  text:"Lead vocal level checked and sitting above the instruments" },
  { id:"comp",   text:"Bus compressor active on stream output" },
  { id:"levels", text:"Stream output level peaking around -6 to -3 dBFS" },
];

function SundayChecklist() {
  var savedState = useState(function() {
    try { return JSON.parse(localStorage.getItem("mca_checklist") || "{}"); }
    catch(e) { return {}; }
  });
  var checked = savedState[0]; var setChecked = savedState[1];

  var toggle = function(id) {
    var next = Object.assign({}, checked);
    next[id] = !next[id];
    setChecked(next);
    try { localStorage.setItem("mca_checklist", JSON.stringify(next)); } catch(e) {}
  };

  var resetAll = function() {
    setChecked({});
    try { localStorage.removeItem("mca_checklist"); } catch(e) {}
  };

  var doneCount = CHECKLIST_ITEMS.filter(function(item) { return checked[item.id]; }).length;
  var pct = Math.round((doneCount / CHECKLIST_ITEMS.length) * 100);
  var allDone = doneCount === CHECKLIST_ITEMS.length;

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>SUNDAY CHECKLIST</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,34px)", fontWeight:900, margin:"0 0 8px", letterSpacing:-1.5, color:"#fff" }}>Pre-Service Checklist</h1>
          <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Run through this before every service. Saves you from 90% of stream problems.</p>
        </div>

        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"16px 20px", marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{doneCount} of {CHECKLIST_ITEMS.length} complete</div>
            <div style={{ fontSize:14, fontWeight:900, color: allDone?"#00e5a0":"#ffb347" }}>{pct}%</div>
          </div>
          <div style={{ height:6, background:"#1a1f2e", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:pct+"%", background: allDone?"#00e5a0":"linear-gradient(90deg,#ffb347,#ff5757)", borderRadius:3, transition:"width 0.3s" }} />
          </div>
          {allDone && <div style={{ fontSize:13, color:"#00e5a0", fontFamily:"sans-serif", marginTop:10, textAlign:"center", fontWeight:700 }}>You are ready for Sunday! 🎉</div>}
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:24 }}>
          {CHECKLIST_ITEMS.map(function(item) {
            var isDone = !!checked[item.id];
            return (
              <button key={item.id} onClick={function() { toggle(item.id); }}
                style={{ display:"flex", alignItems:"center", gap:14, background: isDone?"rgba(0,229,160,0.06)":"#0d1017", border:"1px solid "+(isDone?"rgba(0,229,160,0.25)":"#1a1f2e"), borderRadius:12, padding:"14px 18px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
                <div style={{ width:22, height:22, borderRadius:"50%", border:"2px solid "+(isDone?"#00e5a0":"#2a3040"), background: isDone?"#00e5a0":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:12, color:"#07090f", fontWeight:900, transition:"all 0.15s" }}>
                  {isDone ? "v" : ""}
                </div>
                <span style={{ fontSize:14, color: isDone?"#6b7280":"#e8eaf0", fontFamily:"sans-serif", textDecoration: isDone?"line-through":"none", transition:"all 0.15s" }}>{item.text}</span>
              </button>
            );
          })}
        </div>

        <button onClick={resetAll} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"10px 20px", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>
          Reset for next service
        </button>
      </div>
    </div>
  );
}

// ── SESSION HISTORY PAGE ──────────────────────────────────────────────────────
function HistoryPage({ navigate }) {
  var histState = useState(loadHistory);
  var history = histState[0]; var setHistory = histState[1];

  var handleClear = function() {
    clearHistory();
    setHistory([]);
  };

  if (history.length === 0) {
    return (
      <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
        <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:20 }}>📊</div>
          <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:10, fontFamily:"sans-serif" }}>No analyses yet</div>
          <div style={{ fontSize:14, color:"#6b7280", fontFamily:"sans-serif", marginBottom:28 }}>Analyze your first recording to start tracking your improvement.</div>
          <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Analyze Now</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:780, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>SESSION HISTORY</div>
            <h1 style={{ fontSize:"clamp(20px,4vw,32px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Your Mix Progress</h1>
          </div>
          <button onClick={handleClear} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:8, padding:"8px 16px", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Clear History</button>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {history.map(function(entry, i) {
            var scoreInfo = getScoreLabel(entry.score || 0);
            var date = entry.date ? new Date(entry.date).toLocaleDateString() : "Unknown date";
            return (
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px 20px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:8, marginBottom:12 }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>{entry.fileName || "Recording"}</div>
                    <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>{date} {entry.mixer ? "• " + entry.mixer : ""} {entry.mode ? "• " + entry.mode : ""}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ fontSize:11, color:scoreInfo.color, fontFamily:"monospace", fontWeight:700 }}>{scoreInfo.emoji} {scoreInfo.label}</div>
                    <div style={{ fontSize:26, fontWeight:900, color:scoreInfo.color, letterSpacing:-1 }}>{entry.score}</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:8 }}>
                  {[
                    { label:"LUFS", val:entry.lufs },
                    { label:"PEAK", val:entry.peakDb + " dBTP" },
                    { label:"DYNAMIC", val:entry.dynRange + " LU" },
                    { label:"STEREO", val:entry.stereoWidth + "%" },
                  ].map(function(m, j) {
                    return (
                      <div key={j} style={{ background:"#060810", borderRadius:8, padding:"8px 10px" }}>
                        <div style={{ fontSize:8, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", marginBottom:3 }}>{m.label}</div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif" }}>{m.val}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── AI CHAT ASSISTANT ─────────────────────────────────────────────────────────
var FREE_CHAT_LIMIT = 5; // free users get 5 messages per day

function getChatUsage() {
  try {
    var data = JSON.parse(localStorage.getItem("mca_chat_usage") || "{}");
    var today = new Date().toDateString();
    return data.day === today ? (data.count || 0) : 0;
  } catch(e) { return 0; }
}

function incrementChatUsage() {
  try {
    var today = new Date().toDateString();
    var data = JSON.parse(localStorage.getItem("mca_chat_usage") || "{}");
    var count = data.day === today ? (data.count || 0) + 1 : 1;
    localStorage.setItem("mca_chat_usage", JSON.stringify({ day: today, count: count }));
    return count;
  } catch(e) { return 1; }
}

function AIChatPage({ isPro, onUnlockClick }) {
  var msgsState = useState([{
    role:"assistant",
    content:"Hi! I am your MixCheck AI audio assistant. Ask me anything about your livestream mix, EQ, compression, effects, or mixer settings. Tell me what mixer you use and what problem you are hearing for the best advice."
  }]);
  var msgs = msgsState[0]; var setMsgs = msgsState[1];
  var inputState = useState(""); var input = inputState[0]; var setInput = inputState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];
  var usageState = useState(getChatUsage); var chatUsage = usageState[0]; var setChatUsage = usageState[1];
  var bottomRef = useRef();

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" });
  }, [msgs]);

  var remaining = isPro ? 999 : Math.max(0, FREE_CHAT_LIMIT - chatUsage);
  var isLimited = !isPro && chatUsage >= FREE_CHAT_LIMIT;

  var send = async function() {
    if (!input.trim() || loading || isLimited) return;
    var userText = input.trim();
    setInput("");

    var newMsgs = msgs.concat([{ role:"user", content: userText }]);
    setMsgs(newMsgs);
    setLoading(true);

    // Build message history for the API (last 10 only to save cost)
    var apiMessages = newMsgs.slice(-10).map(function(m) {
      return { role: m.role, content: m.content };
    });

    try {
      var response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          isPro: isPro,
        }),
      });

      var data = await response.json();

      if (!response.ok || data.error) {
        setMsgs(function(prev) {
          return prev.concat([{ role:"assistant", content: data.error || "Something went wrong. Please try again." }]);
        });
      } else {
        setMsgs(function(prev) {
          return prev.concat([{ role:"assistant", content: data.reply }]);
        });
        // Increment usage for free users
        if (!isPro) {
          var newCount = incrementChatUsage();
          setChatUsage(newCount);
        }
      }
    } catch(err) {
      setMsgs(function(prev) {
        return prev.concat([{ role:"assistant", content:"Connection error. Please check your internet and try again." }]);
      });
    }
    setLoading(false);
  };

  var suggestions = [
    "Why does my stream sound quiet even when the room is loud?",
    "My vocals sound muddy on stream. What should I cut?",
    "What compression settings work for a live worship vocal?",
    "How do I stop feedback without ruining the stream mix?",
    "What is -16 LUFS and how do I hit it?",
  ];

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0", display:"flex", flexDirection:"column" }}>
      <div style={{ maxWidth:780, margin:"0 auto", width:"100%", padding:"20px 20px 0", flex:1, display:"flex", flexDirection:"column" }}>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, flexWrap:"wrap", gap:10 }}>
          <div>
            <div style={{ fontSize:10, letterSpacing:4, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>AI ASSISTANT</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", letterSpacing:-0.5, fontFamily:"sans-serif" }}>Ask me anything about your mix 🤖</div>
          </div>
          {!isPro && (
            <div style={{ background:"rgba(255,87,87,0.08)", border:"1px solid rgba(255,87,87,0.2)", borderRadius:10, padding:"8px 14px", textAlign:"right" }}>
              <div style={{ fontSize:12, color: remaining > 1 ? "#ffb347" : "#ff5757", fontFamily:"sans-serif", fontWeight:600 }}>{remaining} free messages today</div>
              <button onClick={onUnlockClick} style={{ fontSize:11, color:"#00e5a0", background:"none", border:"none", cursor:"pointer", fontFamily:"sans-serif", padding:0, marginTop:2 }}>Upgrade for unlimited</button>
            </div>
          )}
        </div>

        <div style={{ flex:1, overflowY:"auto", paddingBottom:16, minHeight:280, maxHeight:"58vh" }}>
          {msgs.map(function(m, i) {
            var isAI = m.role === "assistant";
            return (
              <div key={i} style={{ display:"flex", justifyContent: isAI?"flex-start":"flex-end", marginBottom:12 }}>
                <div style={{ maxWidth:"82%", background: isAI?"#0d1017":"rgba(0,229,160,0.1)", border:"1px solid "+(isAI?"#1a1f2e":"rgba(0,229,160,0.25)"), borderRadius: isAI?"4px 14px 14px 14px":"14px 4px 14px 14px", padding:"12px 16px" }}>
                  {isAI && <div style={{ fontSize:10, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>MIXCHECK AI</div>}
                  <div style={{ fontSize:13, color:"#e8eaf0", fontFamily:"sans-serif", lineHeight:1.7, whiteSpace:"pre-wrap" }}>{m.content}</div>
                </div>
              </div>
            );
          })}
          {loading && (
            <div style={{ display:"flex", justifyContent:"flex-start", marginBottom:12 }}>
              <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:"4px 14px 14px 14px", padding:"12px 16px" }}>
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  {[0,1,2].map(function(j) { return <div key={j} style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0", animation:"wave 0.8s ease-in-out infinite alternate", animationDelay:(j*0.2)+"s" }} />; })}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {msgs.length <= 1 && (
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
            {suggestions.slice(0, isPro ? 5 : 3).map(function(s, i) {
              return (
                <button key={i} onClick={function() { setInput(s); }}
                  style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#6b7280", fontFamily:"sans-serif", cursor:"pointer", textAlign:"left" }}>
                  {s}
                </button>
              );
            })}
          </div>
        )}

        {isLimited && (
          <div style={{ background:"rgba(255,87,87,0.08)", border:"1px solid rgba(255,87,87,0.25)", borderRadius:12, padding:"14px 18px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
            <div style={{ fontSize:13, color:"#ff5757", fontFamily:"sans-serif" }}>You have used your {FREE_CHAT_LIMIT} free messages today. Resets tomorrow or upgrade for unlimited.</div>
            <button onClick={onUnlockClick} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Unlock Pro</button>
          </div>
        )}

        <div style={{ display:"flex", gap:10, paddingBottom:20 }}>
          <input
            value={input}
            onChange={function(e) { setInput(e.target.value); }}
            onKeyDown={function(e) { if(e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={isLimited ? "Upgrade to Pro for unlimited messages..." : "Ask about EQ, compression, routing, effects..."}
            disabled={isLimited}
            style={{ flex:1, background: isLimited?"#060810":"#0d1017", border:"1px solid "+(isLimited?"#1a1f2e":"#2a3040"), borderRadius:12, padding:"13px 16px", color: isLimited?"#2a3040":"#e8eaf0", fontSize:14, fontFamily:"sans-serif", outline:"none" }}
          />
          <button onClick={send} disabled={!input.trim() || loading || isLimited}
            style={{ background: (input.trim()&&!loading&&!isLimited)?"#00e5a0":"#1a1f2e", color: (input.trim()&&!loading&&!isLimited)?"#07090f":"#2a3040", border:"none", borderRadius:12, padding:"13px 20px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor: (input.trim()&&!loading&&!isLimited)?"pointer":"not-allowed", whiteSpace:"nowrap" }}>
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}

function getDeviceId() {
  try {
    var signals = [
      navigator.userAgent || "",
      (screen.width||0)+"x"+(screen.height||0)+"x"+(screen.colorDepth||0),
      navigator.language || "",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      (navigator.hardwareConcurrency||0).toString(),
      navigator.platform || ""
    ].join("|");
    var h = 5381;
    for (var i = 0; i < signals.length; i++) {
      h = ((h << 5) + h) ^ signals.charCodeAt(i);
      h = h & 0x7fffffff;
    }
    return h.toString(36);
  } catch(e) { return "unknown"; }
}

var TRIAL_STEM_LIMIT = 3;
var TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
var TRIAL_MAX_SECONDS = 120; // 2 minutes

function getTrialInfo() {
  try {
    var d = JSON.parse(localStorage.getItem("mca_pro_v2") || "{}");
    var isTrial = d.activated && !d.lifetime && (Date.now() - (d.ts || 0)) < TRIAL_DURATION_MS;
    var stemsUsed = parseInt(localStorage.getItem("mca_trial_stems") || "0", 10);
    return { isTrial: isTrial, stemsUsed: stemsUsed, stemsLeft: Math.max(0, TRIAL_STEM_LIMIT - stemsUsed) };
  } catch(e) { return { isTrial: false, stemsUsed: 0, stemsLeft: TRIAL_STEM_LIMIT }; }
}

function encodeWAV(audioBuffer) {
  var numCh = Math.min(audioBuffer.numberOfChannels, 2);
  var sr = audioBuffer.sampleRate;
  var numFrames = audioBuffer.length;
  var dataSize = numFrames * numCh * 2;
  var buf = new ArrayBuffer(44 + dataSize);
  var v = new DataView(buf);
  var ws = function(o, s) { for (var i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0,"RIFF"); v.setUint32(4, 36 + dataSize, true); ws(8,"WAVE");
  ws(12,"fmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, numCh, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * numCh * 2, true); v.setUint16(32, numCh * 2, true);
  v.setUint16(34, 16, true); ws(36,"data"); v.setUint32(40, dataSize, true);
  var off = 44;
  for (var i = 0; i < numFrames; i++) {
    for (var ch = 0; ch < numCh; ch++) {
      var s = Math.max(-1, Math.min(1, audioBuffer.getChannelData(ch)[i]));
      v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7FFF, true); off += 2;
    }
  }
  return buf;
}

function wavToBase64DataUrl(buffer) {
  var bytes = new Uint8Array(buffer);
  var str = ""; var chunk = 0x8000;
  for (var i = 0; i < bytes.length; i += chunk)
    str += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  return "data:audio/wav;base64," + btoa(str);
}

function usePro() {
  var initPro = (function() {
    try {
      var d = JSON.parse(localStorage.getItem("mca_pro_v2") || "{}");
      if (!d.activated) return false;
      if (d.lifetime) return true;
      return d.deviceId === getDeviceId();
    } catch(e) { return false; }
  })();
  const [isPro, setIsPro] = useState(initPro);
  const unlockPro = async function(code) {
    try {
      var deviceId = getDeviceId();
      var resp = await fetch("/api/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), deviceId: deviceId }),
      });
      var data = await resp.json();
      if (resp.ok && data.ok) {
        var saved = { activated: true, lifetime: !!data.lifetime, deviceId: deviceId, ts: Date.now() };
        try { localStorage.setItem("mca_pro_v2", JSON.stringify(saved)); } catch(e) {}
        setIsPro(true);
        return { ok: true };
      }
      return { ok: false, error: data.error || "Invalid code" };
    } catch(e) {
      return { ok: false, error: "Network error. Check your connection and try again." };
    }
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
  var codeState = useState(""); var code = codeState[0]; var setCode = codeState[1];
  var errorState = useState(""); var error = errorState[0]; var setError = errorState[1];
  var successState = useState(false); var success = successState[0]; var setSuccess = successState[1];
  var loadingState = useState(false); var loading = loadingState[0]; var setLoading = loadingState[1];
  var submit = async function() {
    if (!code.trim() || loading) return;
    setLoading(true); setError("");
    var result = await onUnlock(code);
    setLoading(false);
    if (result.ok) { setSuccess(true); setTimeout(onClose, 2200); }
    else setError(result.error || "Invalid code. Contact hello@mixcheckai.com");
  };
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={loading ? null : onClose}>
      <div onClick={function(e) { e.stopPropagation(); }} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:20, padding:"32px 28px", width:"100%", maxWidth:420, position:"relative" }}>
        {success ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#00e5a0", marginBottom:8, fontFamily:"sans-serif" }}>Pro Unlocked!</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif" }}>Welcome to MixCheck AI Pro!</div>
          </div>
        ) : (
          <div>
            {!loading && <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:"#4a5568", fontSize:20, cursor:"pointer" }}>x</button>}
            <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>UNLOCK PRO</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#fff", marginBottom:8, fontFamily:"sans-serif" }}>Enter your access code</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:24 }}>Check your email after payment for your access code.</div>
            <input value={code} onChange={function(e) { setCode(e.target.value.toUpperCase()); setError(""); }}
              onKeyDown={function(e) { if(e.key === "Enter") submit(); }}
              placeholder="e.g. GMPRO2026"
              disabled={loading}
              style={{ width:"100%", background:"#060810", border:"1px solid " + (error ? "#ff5757" : "#1a1f2e"), borderRadius:10, padding:"14px 16px", color:"#e8eaf0", fontSize:15, fontFamily:"monospace", fontWeight:700, letterSpacing:2, outline:"none", marginBottom:error ? 8 : 16, textTransform:"uppercase", opacity: loading ? 0.5 : 1 }}
            />
            {error && <div style={{ fontSize:12, color:"#ff5757", fontFamily:"sans-serif", marginBottom:16 }}>{error}</div>}
            <button onClick={submit} disabled={!code.trim() || loading}
              style={{ width:"100%", background: (code.trim() && !loading) ? "#00e5a0" : "#1a1f2e", color: (code.trim() && !loading) ? "#07090f" : "#2a3040", border:"none", borderRadius:10, padding:"14px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor: (code.trim() && !loading) ? "pointer" : "not-allowed", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {loading ? (
                <>
                  <div style={{ width:16, height:16, border:"2px solid #2a3040", borderTop:"2px solid #00e5a0", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
                  Verifying...
                </>
              ) : "Unlock Pro Access"}
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

function Nav({ navigate, page, isPro, onUnlockClick, appMode, setAppMode }) {
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
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#00e5a0,#00b880)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="9" width="3" height="7" rx="1.5" fill="#07090f" opacity="0.85"/>
              <rect x="7" y="6" width="3" height="10" rx="1.5" fill="#07090f" opacity="0.85"/>
              <rect x="12" y="3" width="3" height="16" rx="1.5" fill="#07090f" opacity="0.85"/>
              <rect x="17" y="7" width="3" height="9" rx="1.5" fill="#07090f" opacity="0.85"/>
            </svg>
          </div>
          <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:15, color:"#fff", letterSpacing:"-0.3px" }}>MixCheck <span style={{ color:"#00e5a0", fontWeight:300 }}>AI</span></span>
        </button>
        <div style={{ display:"flex", gap:4, alignItems:"center", overflowX:"auto" }}>
          {[["home","Home"],["analyze","Analyze"],["checklist","Checklist"],["history","History"],["chat","AI"],["pricing","Pricing"],["about","About"]].map(function(item) {
            var p = item[0]; var label = item[1];
            return (
              <button key={p} onClick={function() { navigate(p); }} style={{ background: page===p ? "rgba(0,229,160,0.1)" : "none", border: page===p ? "1px solid rgba(0,229,160,0.25)" : "1px solid transparent", borderRadius:8, padding:"6px 10px", cursor:"pointer", color: page===p ? "#00e5a0" : "#6b7280", fontSize:12, fontFamily:"sans-serif", fontWeight: page===p ? 600 : 400, whiteSpace:"nowrap", flexShrink:0 }}>{label}</button>
            );
          })}
          {setAppMode && (
            <button onClick={function() { setAppMode(appMode === "church" ? "studio" : "church"); }}
              style={{ background:"rgba(255,179,71,0.1)", border:"1px solid rgba(255,179,71,0.25)", borderRadius:8, padding:"6px 10px", cursor:"pointer", color:"#ffb347", fontSize:11, fontFamily:"monospace", fontWeight:700, whiteSpace:"nowrap", flexShrink:0, marginLeft:4 }}>
              {appMode === "church" ? "CHURCH" : "STUDIO"}
            </button>
          )}
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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap'); * { box-sizing:border-box; } @keyframes wave { from{transform:scaleY(0.35)} to{transform:scaleY(1)} } @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} } @keyframes fadein { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to{transform:rotate(360deg)} } @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(0,229,160,0.15)} 50%{box-shadow:0 0 40px rgba(0,229,160,0.35)} } html { scroll-behavior:smooth; }`}</style>
    </nav>
  );
}

function Footer({ navigate }) {
  return (
    <footer style={{ background:"#060810", borderTop:"1px solid #1a1f2e", padding:"40px 20px" }}>
      <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", flexWrap:"wrap", justifyContent:"space-between", alignItems:"center", gap:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <div style={{ width:24, height:24, borderRadius:6, background:"linear-gradient(135deg,#00e5a0,#00b880)", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="9" width="3" height="7" rx="1.5" fill="#07090f" opacity="0.85"/>
                <rect x="7" y="6" width="3" height="10" rx="1.5" fill="#07090f" opacity="0.85"/>
                <rect x="12" y="3" width="3" height="16" rx="1.5" fill="#07090f" opacity="0.85"/>
                <rect x="17" y="7" width="3" height="9" rx="1.5" fill="#07090f" opacity="0.85"/>
              </svg>
            </div>
            <span style={{ fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14, color:"#fff", letterSpacing:"-0.3px" }}>MixCheck AI</span>
          </div>
          <p style={{ fontSize:12, color:"#2a3040", fontFamily:"sans-serif", margin:0 }}>Built for sound tech volunteers everywhere</p>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {[["home","Home"],["pricing","Pricing"],["analyze","Analyze Free"],["about","About Us"]].map(function(item) {
            return <button key={item[0]} onClick={function() { navigate(item[0]); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>{item[1]}</button>;
          })}
          <a href={STRIPE_PORTAL_LINK} target="_blank" rel="noopener noreferrer"
            style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", textDecoration:"none" }}>
            Manage Subscription
          </a>
        </div>
        <p style={{ fontSize:11, color:"#1a1f2e", fontFamily:"monospace", letterSpacing:1, margin:0 }}>2026 MIXCHECK AI</p>
      </div>
    </footer>
  );
}

// ── KEY DETECTION — Goertzel + Krumhansl-Schmuckler ──────────────────────────
var KS_MAJOR = [6.35,2.23,3.48,2.33,4.38,4.09,2.52,5.19,2.39,3.66,2.29,2.88];
var KS_MINOR = [6.33,2.68,3.52,5.38,2.60,3.53,2.54,4.75,3.98,2.69,3.34,3.17];
var KEY_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

function goertzelPow(buf, sampleRate, freq) {
  var N = buf.length;
  var k = Math.round(N * freq / sampleRate);
  var omega = 2 * Math.PI * k / N;
  var coeff = 2 * Math.cos(omega);
  var s1 = 0, s2 = 0, s0;
  for (var i = 0; i < N; i++) { s0 = buf[i] + coeff * s1 - s2; s2 = s1; s1 = s0; }
  return s2*s2 + s1*s1 - coeff*s1*s2;
}

function detectKey(signal, sampleRate) {
  var segLen = Math.min(signal.length, Math.floor(sampleRate * 1.5));
  var off = Math.floor((signal.length - segLen) / 2);
  var seg = new Float32Array(segLen);
  for (var i = 0; i < segLen; i++) {
    seg[i] = signal[off + i] * 0.5 * (1 - Math.cos(2 * Math.PI * i / (segLen - 1)));
  }
  var chroma = new Array(12).fill(0);
  for (var midi = 48; midi < 96; midi++) {
    chroma[midi % 12] += goertzelPow(seg, sampleRate, 440 * Math.pow(2, (midi - 69) / 12));
  }
  function pearson(a, b) {
    var n = a.length, sa = 0, sb = 0;
    for (var i = 0; i < n; i++) { sa += a[i]; sb += b[i]; }
    var ma = sa/n, mb = sb/n, num = 0, da = 0, db = 0;
    for (var i = 0; i < n; i++) { num += (a[i]-ma)*(b[i]-mb); da += (a[i]-ma)*(a[i]-ma); db += (b[i]-mb)*(b[i]-mb); }
    return (da > 0 && db > 0) ? num / Math.sqrt(da * db) : 0;
  }
  var best = -Infinity, bestKey = 'C Major';
  for (var root = 0; root < 12; root++) {
    var rotMaj = [], rotMin = [];
    for (var i = 0; i < 12; i++) { rotMaj.push(KS_MAJOR[(i-root+12)%12]); rotMin.push(KS_MINOR[(i-root+12)%12]); }
    var mc = pearson(chroma, rotMaj), nc = pearson(chroma, rotMin);
    if (mc > best) { best = mc; bestKey = KEY_NAMES[root] + ' Major'; }
    if (nc > best) { best = nc; bestKey = KEY_NAMES[root] + ' Minor'; }
  }
  return bestKey;
}

// ── BPM DETECTION — onset autocorrelation ────────────────────────────────────
function detectBPM(L, R, sr) {
  var hop = 512;
  var maxSamples = Math.min(L.length, sr * 30);
  var start = Math.max(0, Math.floor((L.length - maxSamples) / 2));
  var frames = Math.floor(maxSamples / hop);
  if (frames < 10) return 120;
  var env = new Float32Array(frames);
  for (var i = 0; i < frames; i++) {
    var sq = 0, off = start + i * hop;
    for (var j = 0; j < hop && off + j < L.length; j++) {
      var s = (L[off + j] + R[off + j]) * 0.5;
      sq += s * s;
    }
    env[i] = Math.sqrt(sq / hop);
  }
  var onset = new Float32Array(frames);
  for (var i = 1; i < frames; i++) {
    var d = env[i] - env[i - 1];
    onset[i] = d > 0 ? d : 0;
  }
  var fps = sr / hop;
  var minLag = Math.max(2, Math.floor(fps * 60 / 200));
  var maxLag = Math.floor(fps * 60 / 60);
  var bestLag = minLag, bestCorr = -Infinity;
  for (var lag = minLag; lag <= maxLag; lag++) {
    var c = 0, n = frames - lag;
    for (var i = 0; i < n; i++) c += onset[i] * onset[i + lag];
    if (c > bestCorr) { bestCorr = c; bestLag = lag; }
  }
  var bpm = Math.round(fps * 60 / bestLag);
  while (bpm < 60) bpm *= 2;
  while (bpm > 200) bpm /= 2;
  return bpm;
}

// ── AUDIO ANALYSIS - slices file BEFORE decoding, never loads full 2hr file ───
async function decodeSlice(blob) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onerror = function() { reject(new Error("Read error")); };
    reader.onload = async function(e) {
      try {
        var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
        var ctx = new AudioCtxClass();
        var buf;
        try { buf = await ctx.decodeAudioData(e.target.result); }
        catch(de) { ctx.close(); resolve(null); return; }
        ctx.close();
        var sr = buf.sampleRate;
        var numCh = buf.numberOfChannels;
        var L = buf.getChannelData(0);
        var R = numCh > 1 ? buf.getChannelData(1) : buf.getChannelData(0);
        var total = L.length;
        if (total < 100) { resolve(null); return; }

        // Loudness
        var blockLen = Math.floor(sr * 0.4);
        var hop = Math.floor(blockLen * 0.75);
        var loudSum = 0; var loudCount = 0;
        for (var i = 0; i + blockLen <= total; i += hop) {
          var sq = 0;
          for (var j = i; j < i + blockLen; j++) sq += L[j]*L[j] + R[j]*R[j];
          var rv = Math.sqrt(sq / (blockLen * 2));
          if (rv > 0.0001) { loudSum += rv * rv; loudCount++; }
        }
        var avgRMS = loudCount > 0 ? Math.sqrt(loudSum / loudCount) : 0.001;
        var lufs = Math.round(Math.max(-50, Math.min(-3, 20*Math.log10(avgRMS)-0.691))*10)/10;

        // True Peak
        var maxPk = 0;
        var stride = Math.max(1, Math.floor(total / 100000));
        for (var i = 0; i < total; i += stride) {
          var pk = Math.abs(L[i]) > Math.abs(R[i]) ? Math.abs(L[i]) : Math.abs(R[i]);
          if (pk > maxPk) maxPk = pk;
        }
        var peakDb = maxPk > 0 ? Math.round(20*Math.log10(maxPk)*10)/10 : -60;

        // Dynamic Range
        var segLen = Math.floor(sr * 1.0);
        var segArr = [];
        for (var i = 0; i + segLen <= total; i += segLen) {
          var sq = 0;
          for (var j = i; j < i + segLen; j++) sq += L[j]*L[j];
          var sr2 = Math.sqrt(sq / segLen);
          if (sr2 > 0.0001) segArr.push(20*Math.log10(sr2));
        }
        segArr.sort(function(a,b){return b-a;});
        var topN = Math.max(1, Math.floor(segArr.length*0.1));
        var botStart = Math.max(0, Math.floor(segArr.length*0.9));
        var tSum = 0; var bSum = 0; var bN = 0;
        for (var k = 0; k < topN; k++) tSum += segArr[k];
        for (var k = botStart; k < segArr.length; k++) { bSum += segArr[k]; bN++; }
        var dynRange = Math.round(Math.max(2, Math.min(40, (tSum/topN) - (bN>0?bSum/bN:(tSum/topN)-10)))*10)/10;

        // Stereo Width
        var sLR=0,sL2=0,sR2=0;
        var st = Math.max(1, Math.floor(total/40000));
        for (var i = 0; i < total; i += st) { sLR+=L[i]*R[i]; sL2+=L[i]*L[i]; sR2+=R[i]*R[i]; }
        var cd = Math.sqrt(sL2*sR2);
        var corr = cd > 0 ? Math.max(-1,Math.min(1,sLR/cd)) : 1;
        var stereoWidth = Math.round(Math.max(0,Math.min(1,(1-corr)/2))*100);

        // Freq bands
        var m0 = Math.floor(total*0.3); var m1 = Math.floor(total*0.7);
        var gb = function(lo,hi) {
          var per = Math.max(2,Math.floor(sr/((hi+lo)/2)));
          var bq=0,bn=0;
          for (var bi=m0; bi+per<m1; bi+=per) {
            var bs=0;
            for (var bj=bi; bj<bi+per; bj++) bs+=Math.abs((L[bj]+R[bj])/2);
            bq+=(bs/per)*(bs/per); bn++;
          }
          return bn>0 ? 20*Math.log10(Math.sqrt(bq/bn)+0.000001) : -60;
        };

        var mono = new Float32Array(total);
        for (var mi = 0; mi < total; mi++) mono[mi] = (L[mi] + R[mi]) * 0.5;
        var detectedKey = detectKey(mono, sr);
        var detectedBpm = detectBPM(L, R, sr);

        resolve({
          lufs:lufs, peakDb:peakDb, dynRange:dynRange, stereoWidth:stereoWidth,
          duration: Math.round(total/sr), sampleRate:sr, channels:numCh,
          freq:{ sub:gb(20,80), low:gb(80,250), lowMid:gb(250,600), mid:gb(600,2500), highMid:gb(2500,7000), high:gb(7000,14000), air:gb(14000,20000) },
          detectedKey:detectedKey, bpm:detectedBpm,
        });
      } catch(err) { resolve(null); }
    };
    reader.readAsArrayBuffer(blob);
  });
}

function average(arr) {
  if (!arr || arr.length === 0) return 0;
  var s = 0; for (var i=0; i<arr.length; i++) s+=arr[i]; return s/arr.length;
}

async function measureAudio(file) {
  var sizeMB = file.size / (1024*1024);
  var isLarge = sizeMB > 25; // Over 25MB use slice approach

  var sliceResults = [];
  var sliceCount = 1;
  var isLongFile = false;

  if (!isLarge) {
    // Small file - decode whole thing at once
    var result = await decodeSlice(file);
    if (!result) throw new Error("Cannot decode audio. Try MP3 or WAV.");
    sliceResults = [result];
  } else {
    // Large file - read 3 byte slices BEFORE decoding
    // This means we NEVER load more than ~5MB into RAM at once
    isLongFile = true;
    sliceCount = 3;
    var sliceSize = Math.min(5*1024*1024, Math.floor(file.size/5)); // 5MB per slice max
    var positions = [
      0,
      Math.floor(file.size/2 - sliceSize/2),
      Math.max(0, file.size - sliceSize)
    ];
    for (var pi = 0; pi < positions.length; pi++) {
      var start = Math.max(0, positions[pi]);
      var end = Math.min(file.size, start + sliceSize);
      var blob = file.slice(start, end);
      var res = await decodeSlice(blob);
      if (res) sliceResults.push(res);
    }
    if (sliceResults.length === 0) throw new Error("Cannot decode audio. Try exporting as MP3 or WAV.");
  }

  // Average all slice measurements
  var clamp = function(v,mn,mx,def) { return (!isFinite(v)||isNaN(v)) ? def : Math.max(mn,Math.min(mx,v)); };

  var lufsArr = sliceResults.map(function(r){return r.lufs;});
  var peakArr = sliceResults.map(function(r){return r.peakDb;});
  var dynArr  = sliceResults.map(function(r){return r.dynRange;});
  var swArr   = sliceResults.map(function(r){return r.stereoWidth;});

  var totalDur = 0;
  for (var i=0; i<sliceResults.length; i++) totalDur += sliceResults[i].duration;

  var freq = {
    sub: average(sliceResults.map(function(r){return r.freq.sub;})),
    low: average(sliceResults.map(function(r){return r.freq.low;})),
    lowMid: average(sliceResults.map(function(r){return r.freq.lowMid;})),
    mid: average(sliceResults.map(function(r){return r.freq.mid;})),
    highMid: average(sliceResults.map(function(r){return r.freq.highMid;})),
    high: average(sliceResults.map(function(r){return r.freq.high;})),
    air: average(sliceResults.map(function(r){return r.freq.air;})),
  };

  return {
    lufs: clamp(average(lufsArr),-60,0,-20),
    peakDb: clamp(Math.max.apply(null,peakArr),-60,0,-6),
    dynRange: clamp(average(dynArr),0,50,12),
    stereoWidth: clamp(average(swArr),0,100,50),
    freq: {
      sub: clamp(freq.sub,-80,0,-40), low: clamp(freq.low,-80,0,-40),
      lowMid: clamp(freq.lowMid,-80,0,-40), mid: clamp(freq.mid,-80,0,-40),
      highMid: clamp(freq.highMid,-80,0,-40), high: clamp(freq.high,-80,0,-40),
      air: clamp(freq.air,-80,0,-40),
    },
    duration: file.size > 25*1024*1024 ? Math.round(file.size / (sizeMB > 100 ? 16000 : 32000)) : totalDur,
    isLongFile: isLongFile,
    sliceCount: sliceCount,
    sampleRate: sliceResults[0] ? sliceResults[0].sampleRate : 44100,
    channels: sliceResults[0] ? sliceResults[0].channels : 2,
    fileSize: Math.round(file.size/1024),
    detectedKey: sliceResults[0] ? sliceResults[0].detectedKey : null,
    bpm: sliceResults[0] ? sliceResults[0].bpm : null,
  };
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
  if (peak > 0) return { label:"Clipping!", color:"#ff5757", advice:"Clipping causes distortion. Pull master level down immediately." };
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
  if ((freq.mid || -60) < ref - 5) advice.push({ band:"Mids (600Hz-2.5kHz)", issue:"Scooped", fix:"The mids are too low. This is where voices live. Boost here for better intelligibility." });
  if ((freq.highMid || -60) < ref - 5) advice.push({ band:"Upper Mids (2.5-7kHz)", issue:"Dull", fix:"Boost upper mids to add presence and help vocals cut through on stream." });
  if ((freq.high || -60) < ref - 8) advice.push({ band:"Highs (7-14kHz)", issue:"Dark", fix:"Mix sounds dark or muffled. A gentle high-shelf boost adds air and clarity." });
  if ((freq.air || -60) < ref - 12) advice.push({ band:"Air (14-20kHz)", issue:"Missing", fix:"Very little high-frequency air. A gentle shelf above 12kHz adds sparkle." });
  if (advice.length === 0) advice.push({ band:"Overall Frequency Balance", issue:"Good", fix:"Frequency balance looks reasonable. Focus on loudness and dynamics recommendations." });
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
  else recs.push({ priority:"ok", title:"Good Overall Level", detail:"Loudness at " + safeL + " LUFS is within the ideal streaming range." });
  if (safeP > -1) recs.push({ priority:"high", title:"Fix Clipping Immediately", detail:"Peaking at " + safeP + " dBTP causes distortion. Reduce master level before anything else." });
  else if (safeP > -3) recs.push({ priority:"med", title:"Reduce Headroom Risk", detail:"Peak at " + safeP + " dBTP is close to distorting. Pull master down by 2 dB." });
  if (safeD > 16) recs.push({ priority:"high", title:"Add Compression", detail:"Dynamic range of " + safeD + " LU is too wide for streaming. Add a compressor at 2:1 or 3:1 on your master output." });
  else if (safeD < 4) recs.push({ priority:"med", title:"Ease Off Compression", detail:"Only " + safeD + " LU of dynamic range. Mix sounds flat. Reduce compression ratio or raise threshold." });
  else recs.push({ priority:"ok", title:"Good Dynamic Control", detail:"Dynamic range of " + safeD + " LU is healthy for streaming." });
  if (safeS < 15) recs.push({ priority:"med", title:"Widen Stereo Image", detail:"Mix is nearly mono at " + safeS + "%. Pan instruments left and right for a wider sound." });
  else if (safeS > 80) recs.push({ priority:"med", title:"Check Mono Compatibility", detail:"Very wide stereo at " + safeS + "%. Test on a phone speaker. If it sounds thin, narrow the stereo width." });
  var freqAdvice = getFreqAdvice(safeF);
  for (var fi = 0; fi < freqAdvice.length; fi++) {
    if (freqAdvice[fi].issue !== "Good") recs.push({ priority:"med", title:freqAdvice[fi].band + " - " + freqAdvice[fi].issue, detail:freqAdvice[fi].fix });
  }
  recs.push({ priority:"tip", title:"Dedicated Stream Output", detail:"Always use a dedicated output for your stream, separate from your main house speakers. This lets you control stream level independently." });
  recs.push({ priority:"tip", title:"High Pass Filter Every Channel", detail:"Apply a high-pass filter on every channel that does not need deep bass. Removes rumble and muddiness that hurts stream quality." });
  recs.push({ priority:"tip", title:"Phone Speaker Test", detail:"Check your stream on earbuds or a phone speaker before going live. If it sounds good there, it will sound good for most of your audience." });
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
  var recHTML = results.recs.map(function(r) {
    return '<div class="rec ' + r.priority + '"><div class="rt">' + r.title + '</div><div class="rd">' + r.detail + '</div></div>';
  }).join("");
  var freqRows = results.freq ? [
    ["Sub Bass 20-80 Hz", Math.round(results.freq.sub)],
    ["Low Bass 80-250 Hz", Math.round(results.freq.low)],
    ["Low Mids 250-600 Hz", Math.round(results.freq.lowMid)],
    ["Mids 600Hz-2.5kHz", Math.round(results.freq.mid)],
    ["Upper Mids 2.5-7kHz", Math.round(results.freq.highMid)],
    ["Highs 7-14kHz", Math.round(results.freq.high)],
    ["Air 14-20kHz", Math.round(results.freq.air)],
  ] : [];
  var freqHTML = freqRows.map(function(row) { return '<div class="fi"><span>' + row[0] + '</span><span>' + row[1] + ' dB rel</span></div>'; }).join("");
  win.document.write('<!DOCTYPE html><html><head><title>MixCheck AI Report</title><style>body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#111}h1{font-size:28px;margin:0 0 4px}.sub{color:#666;font-size:13px;margin-bottom:32px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:32px}.metric{border:1px solid #e0e0e0;border-radius:10px;padding:16px}.ml{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#888;margin-bottom:6px}.mv{font-size:26px;font-weight:900;margin-bottom:4px}.ms{font-size:11px;font-weight:700;margin-bottom:6px}.ma{font-size:12px;color:#555;line-height:1.5}.st{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:#00a070;border-bottom:2px solid #00a070;padding-bottom:8px;margin:28px 0 16px}.rec{border-left:3px solid #ccc;padding:10px 14px;margin-bottom:12px;background:#fafafa;border-radius:0 8px 8px 0}.rec.high{border-color:#e33}.rec.med{border-color:#f90}.rec.ok{border-color:#0a0}.rec.tip{border-color:#4a7cff}.rt{font-weight:700;font-size:14px;margin-bottom:4px}.rd{font-size:13px;color:#444;line-height:1.6}.fi{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:13px}.footer{margin-top:48px;text-align:center;font-size:11px;color:#aaa}</style></head><body>');
  win.document.write('<h1>MixCheck AI</h1><div class="sub">Audio Analysis Report - ' + now + ' - ' + fileName + '</div>');
  win.document.write('<div class="grid">');
  win.document.write('<div class="metric"><div class="ml">Loudness</div><div class="mv">' + results.lufs + ' LUFS</div><div class="ms">Target: -16 LUFS | ' + ld.label + '</div><div class="ma">' + ld.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">True Peak</div><div class="mv">' + results.peakDb + ' dBTP</div><div class="ms">Below -1 dBTP | ' + pd.label + '</div><div class="ma">' + pd.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">Dynamic Range</div><div class="mv">' + results.dynRange + ' LU</div><div class="ms">Target: 8-14 LU | ' + dd.label + '</div><div class="ma">' + dd.advice + '</div></div>');
  win.document.write('<div class="metric"><div class="ml">Stereo Width</div><div class="mv">' + results.stereoWidth + '%</div><div class="ms">Target: 20-75% | ' + sd.label + '</div><div class="ma">' + sd.advice + '</div></div>');
  win.document.write('</div><div class="st">Recommendations</div>' + recHTML);
  if (freqHTML) win.document.write('<div class="st">Frequency Balance</div>' + freqHTML);
  win.document.write('<div class="st">File Info</div>');
  win.document.write('<div class="fi"><span>Duration</span><span>' + Math.floor(results.duration/60) + 'm ' + (results.duration%60) + 's</span></div>');
  win.document.write('<div class="fi"><span>Channels</span><span>' + (results.channels === 1 ? "Mono" : "Stereo") + '</span></div>');
  win.document.write('<div class="footer">MixCheck AI - mixcheckai.com - ' + now + '</div></body></html>');
  win.document.close();
  setTimeout(function() { win.print(); }, 500);
}

// ── CHEAT SHEET DATA ──────────────────────────────────────────────────────────
var CHEAT_INSTRUMENTS = [
  { id:"lead_vocal",    name:"Lead Vocal",       icon:"🎤" },
  { id:"bgv",           name:"Backing Vocals",    icon:"🎙" },
  { id:"ac_drums",      name:"Acoustic Drums",    icon:"🥁" },
  { id:"ac_guitar",     name:"Acoustic Guitar",   icon:"🪕" },
  { id:"bass",          name:"Bass Guitar",       icon:"🎸" },
  { id:"el_lead",       name:"Electric Lead Guitar",   icon:"⚡" },
  { id:"el_rhythm",     name:"Rhythm Guitar",     icon:"🎵" },
  { id:"pad",           name:"Synth Pad",         icon:"🌊" },
  { id:"piano",         name:"Piano / Keys",      icon:"🎹" },
  { id:"grand_piano",   name:"Grand Piano",       icon:"🎼" },
  { id:"el_drums",      name:"Electric Drums",    icon:"🔌" },
];

function getMixerType(mixer) {
  if (!mixer) return "digital";
  var id = mixer.id || "";
  if (id === "custom" || id === "none") return mixer.type || "digital";
  return mixer.type || "digital";
}

function getCheatSheet(instrument, mixer) {
  var isDigital = getMixerType(mixer) !== "analog";
  var mixerName = mixer ? mixer.name : "your mixer";
  var data = {};

  if (instrument.id === "lead_vocal") {
    data = {
      hpf: "100-130 Hz. Removes handling noise, breath rumble, and low-end buildup. Start at 120 Hz and adjust to taste.",
      peq: [
        { band:"Low Mids", freq:"200-350 Hz", action:"Cut 2-4 dB", q:"Medium (1.0-1.5)", reason:"Remove boxy chest resonance. Sweep to find the exact frequency on your singer." },
        { band:"Mud Zone", freq:"350-500 Hz", action:"Cut 1-3 dB", q:"Medium-Wide (0.7-1.0)", reason:"Clean up muddiness, especially in smaller rooms or with close mic technique." },
        { band:"Presence", freq:"2.5-4 kHz", action:"Boost 1-3 dB", q:"Medium (1.0)", reason:"The intelligibility zone. Helps vocals cut through the mix and sound clear on stream." },
        { band:"Air", freq:"10-16 kHz", action:"Boost 1-2 dB", q:"Wide shelf", reason:"Add shimmer and openness. Makes the vocal sound polished and modern." },
      ],
      comp: { ratio:"2:1 to 4:1", threshold:"Set so gain reduction is 3-8 dB on loud phrases", attack:"10-30 ms - slower preserves the breath attack", release:"80-150 ms - musical and natural", gain:"Add 2-4 dB makeup gain", notes:"Lead vocal compressor is the most important on the whole board. Tame peaks, add sustain, keep consistent level for stream." },
      geq_stream: "If using a stream GEQ: boost 3-4 kHz slightly for more presence. Cut 200-300 Hz if the stream sounds muddy. Gentle high shelf boost above 8 kHz adds clarity.",
      effects: [
        { name:"Reverb", type:"Hall or Plate", settings:"Pre-delay 15-25 ms, Decay 1.2-2.0 sec, Mix 15-25%", purpose:"Adds space and depth. Pre-delay keeps the dry vocal forward in the mix." },
        { name:"Delay", type:"Short slapback or quarter-note", settings:"80-150 ms slapback or 1/4 note synced to tempo, Mix 8-15%", purpose:"Adds width and thickens the vocal without sounding artificial." },
        { name:"De-esser", type:"Dynamic EQ or dedicated de-esser", settings:"Target 5-8 kHz range, threshold where sibilance triggers", purpose:"Controls harsh S and T sounds that sound piercing on stream." },
      ],
      stream_tips: ["Use a dedicated aux or mix bus for your stream vocal - keep it slightly higher than FOH", "A limiter after your vocal compressor (threshold -3 dBFS) prevents unexpected loud moments from clipping the stream", "Mono compatibility: lead vocal should sound full even in mono - test with one earbud"],
    };
  } else if (instrument.id === "bgv") {
    data = {
      hpf: "150-200 Hz. BG vocals need a higher HPF than lead. Cut more aggressively to keep them thin and supportive.",
      peq: [
        { band:"Low Mids", freq:"200-400 Hz", action:"Cut 3-5 dB", q:"Medium (1.0)", reason:"BG vocals must be thinner than lead. Aggressive low-mid cut keeps them from competing." },
        { band:"Presence", freq:"3-5 kHz", action:"Cut 1-2 dB", q:"Medium (0.8)", reason:"Roll off presence slightly so BG vocals sit behind the lead. They should support, not compete." },
        { band:"Air", freq:"12-16 kHz", action:"Boost 1-2 dB", q:"Wide shelf", reason:"Air helps BG vocals blend without adding mud. Keeps them bright but not harsh." },
      ],
      comp: { ratio:"4:1 to 6:1", threshold:"More aggressive than lead - set for 5-10 dB of gain reduction", attack:"8-15 ms", release:"60-100 ms", gain:"Makeup as needed", notes:"BG vocals need tighter compression than lead vocals. Keep them consistent and controlled." },
      geq_stream: "In the stream mix: reduce BG vocal send by 3-6 dB compared to lead vocal. They should be barely audible on their own but add fullness to the overall sound.",
      effects: [
        { name:"Reverb", type:"Same space as lead vocal", settings:"Slightly shorter decay than lead (0.8-1.5 sec), Mix 20-30%", purpose:"Match the acoustic space of the lead to glue the vocals together." },
        { name:"Chorus or Doubler", type:"Subtle stereo widener", settings:"Very subtle width or short doubling, Mix 10-20%", purpose:"BG vocals can be spread wider in stereo to surround the lead vocal." },
      ],
      stream_tips: ["Pan BG vocals: spread L and R slightly (L-25, R+25 or similar) for width", "BG vocals on stream should be lower than you think - they add fill, not focus", "Group all BG vocals to a sub-group so you can control the overall level easily"],
    };
  } else if (instrument.id === "ac_drums") {
    data = {
      hpf: "Per channel: Kick 40-60 Hz, Snare 80-100 Hz, Hi-Hat 200-400 Hz, Toms 60-80 Hz, Overheads 100-200 Hz. High-pass everything except kick to remove bleed.",
      peq: [
        { band:"Kick - Punch", freq:"60-100 Hz", action:"Boost 2-4 dB on kick channel", q:"Medium (1.2)", reason:"The fundamental thump of the kick. Sweep between 60-100 Hz to find the room resonance of the drum." },
        { band:"Kick - Attack", freq:"3-5 kHz", action:"Boost 1-3 dB on kick channel", q:"Medium (1.0)", reason:"Beater click and attack. Essential for kick to cut through on stream where low end is often lost on small speakers." },
        { band:"Snare - Body", freq:"150-250 Hz", action:"Boost 1-3 dB on snare channel", q:"Medium (1.2)", reason:"Snare body and fatness. Small boost adds weight without muddiness." },
        { band:"Snare - Crack", freq:"2-5 kHz", action:"Boost 2-4 dB on snare channel", q:"Medium (1.0)", reason:"The crack and snap of the snare. The most important frequency for snare on livestream." },
        { band:"Overhead - Mud", freq:"200-400 Hz", action:"Cut 3-5 dB on overheads", q:"Wide (0.7)", reason:"Overheads capture lots of low-mid bleed. A wide cut cleans them up significantly." },
      ],
      comp: { ratio:"4:1 to 6:1 on kick and snare, 2:1 on overheads", threshold:"Kick: set for 4-8 dB GR. Snare: 3-6 dB GR", attack:"Kick: 3-8 ms (fast to control transient). Snare: 5-15 ms (keep the crack)", release:"Set to musical feel - too fast sounds pumpy, too slow adds buildup", gain:"Makeup as needed", notes:"Gate the kick and snare channels before the compressor to eliminate bleed from other drums. Set gate threshold around -30 to -40 dBFS." },
      geq_stream: "On the stream output: cut 200-350 Hz to reduce drum bleed muddiness. The kick-snare interaction at 400 Hz often causes a boxy sound on stream.",
      effects: [
        { name:"Gate", type:"Expander/Gate on kick and snare", settings:"Threshold: -30 to -40 dBFS, Attack: 1 ms, Release: 50-200 ms, Range: 40-60 dB", purpose:"Eliminates bleed between drums. Essential for a clean drum sound on stream." },
        { name:"Reverb on Snare", type:"Short plate or room", settings:"Pre-delay 5-15 ms, Decay 0.4-0.8 sec, Mix 15-25%", purpose:"Snare reverb adds crack and power. Keep it short and punchy." },
        { name:"Parallel Compression", type:"New York or crush compression", settings:"Heavy compression (10:1+) blended with dry signal at 15-30%", purpose:"Adds density and power to the drum bus without losing dynamics." },
      ],
      stream_tips: ["Reduce overhead fader on the stream send by 3-6 dB - cymbals are harsh on stream", "The kick and snare should be louder in the stream mix than in FOH", "If you only have 2 drum mics, gate them aggressively and compress harder"],
    };
  } else if (instrument.id === "ac_guitar") {
    data = {
      hpf: "80-120 Hz. Acoustic guitar has body resonance below this that causes muddiness. Start at 100 Hz and adjust to the instrument.",
      peq: [
        { band:"Low Mid Mud", freq:"200-350 Hz", action:"Cut 2-4 dB", q:"Medium (1.0-1.2)", reason:"The main problem zone for acoustic guitar. Where boxy, muddy tone lives. Sweep slowly to find the worst frequency." },
        { band:"Body Warmth", freq:"100-150 Hz", action:"Boost 1-2 dB if thin", q:"Wide (0.6-0.8)", reason:"If the guitar sounds too thin or hollow after the low-mid cut, a gentle boost here restores warmth." },
        { band:"Pick Attack", freq:"2-4 kHz", action:"Boost 1-2 dB", q:"Medium (1.0)", reason:"Pick attack and string definition. Helps the guitar cut through the mix and sound articulate." },
        { band:"String Brightness", freq:"6-10 kHz", action:"Boost 2-3 dB", q:"Wide shelf", reason:"Shimmer and brightness. The characteristic acoustic guitar sparkle that translates well on stream." },
      ],
      comp: { ratio:"2:1 to 4:1", threshold:"Set for 3-6 dB of gain reduction on strums", attack:"15-30 ms - slower preserves the pick transient", release:"100-200 ms - natural and musical", gain:"Makeup 2-3 dB", notes:"Acoustic guitar compressor should be subtle. The goal is consistency, not squashing. A slower attack preserves the natural pick dynamics." },
      geq_stream: "Stream mix GEQ: cut 250-350 Hz to prevent the acoustic guitar from muddying the vocal range. A gentle boost at 8-10 kHz adds brightness without harshness.",
      effects: [
        { name:"Reverb", type:"Small room or hall", settings:"Pre-delay 10-20 ms, Decay 0.8-1.5 sec, Mix 10-20%", purpose:"Adds natural space. Keep it subtle - acoustic guitar already has its own natural reverb." },
        { name:"Compression", type:"Optical or FET style", settings:"Already covered above - optical gives a musical, transparent sound", purpose:"Tames pick attack peaks and adds sustain to chord strums." },
        { name:"Chorus (optional)", type:"Very subtle stereo width", settings:"Rate slow (0.3-0.8 Hz), Depth minimal, Mix 10-15%", purpose:"Adds a gentle shimmer and width to acoustic guitar. Very light touch - should be imperceptible on its own." },
      ],
      stream_tips: ["Pan acoustic guitar 15-30 degrees off center if electric guitar is also in the mix", "DI acoustic guitar almost always sounds better than microphone for stream", "If the guitar sounds harsh, first cut 3-5 kHz before boosting elsewhere"],
    };
  } else if (instrument.id === "bass") {
    data = {
      hpf: "40-60 Hz. Sub frequencies below this waste headroom and are inaudible on most stream playback systems. Cut firmly.",
      peq: [
        { band:"Sub Fundamental", freq:"60-80 Hz", action:"Boost 1-3 dB", q:"Medium (1.0-1.2)", reason:"The core fundamental of the bass. Gives weight and power. Find the fundamental note of the open E or B string." },
        { band:"Low Mid Mud", freq:"200-400 Hz", action:"Cut 2-4 dB", q:"Medium (1.0)", reason:"Where bass gets muddy and interferes with kick drum and vocals. A cut here cleans up the whole mix." },
        { band:"Note Definition", freq:"700-1000 Hz", action:"Boost 1-2 dB if thin", q:"Medium (0.8)", reason:"Note definition and finger noise. Helps each note speak clearly at lower listening levels." },
        { band:"Pick or Slap Attack", freq:"2-4 kHz", action:"Boost 1-3 dB for pick bass", q:"Medium (1.0)", reason:"Attack and click for pick or slap bass. Helps bass translate on stream on small speakers where low end is lost." },
      ],
      comp: { ratio:"4:1 to 6:1", threshold:"Set for 4-8 dB of gain reduction during normal playing", attack:"15-30 ms - preserves the pick attack character", release:"150-250 ms - long enough to not pump", gain:"Makeup 3-4 dB", notes:"Bass needs firm compression for stream. Without it, bass level varies wildly from note to note. A limiter (8:1+) as a second stage catches peaks." },
      geq_stream: "Stream output GEQ: the bass and kick occupy similar frequency space (60-120 Hz). Boost the frequency where kick lives, cut slightly where bass dominates. This creates separation.",
      effects: [
        { name:"Compressor", type:"VCA or optical", settings:"As above - focus on consistency over character", purpose:"Level consistency is the most critical effect for bass on stream." },
        { name:"Limiter", type:"Brick wall after compressor", settings:"Threshold -3 to -6 dBFS, Release fast", purpose:"Catches hard transients that slip through the compressor. Protects the stream signal from clipping." },
        { name:"Sub Harmonics (optional)", type:"Sub harmonic synthesizer", settings:"Generate one octave below, blend gently", purpose:"If the bass sounds thin on stream, a gentle sub harmonic adds low-end weight without boosting real low frequencies." },
      ],
      stream_tips: ["Always DI the bass directly - never use a microphone on a bass cabinet for stream", "Sidechain the bass compressor to the kick: when the kick hits, bass ducks slightly. Creates punch and separation", "On stream, bass should be felt more than heard. If you can hear it easily, it may be too loud"],
    };
  } else if (instrument.id === "el_lead") {
    data = {
      hpf: "80-120 Hz. Electric guitar has very little useful energy below this. A firm HPF cleans up low-end bleed from the cabinet.",
      peq: [
        { band:"Low Mid Body", freq:"150-250 Hz", action:"Cut 2-4 dB", q:"Medium (1.0)", reason:"Where electric guitar sounds boxy and interferes with bass and kick. Cut more on high-gain tones." },
        { band:"Mid Honk", freq:"400-600 Hz", action:"Cut 1-3 dB", q:"Medium (1.2)", reason:"The nasal honky midrange of electric guitar. Reduces the harsh, forward tone that fatigues listeners on stream." },
        { band:"Presence Bite", freq:"2-4 kHz", action:"Boost 1-3 dB", q:"Medium (1.0)", reason:"Lead guitar cuts through here. The bite and aggression that defines the lead guitar character." },
        { band:"High End Sparkle", freq:"8-12 kHz", action:"Boost 1-2 dB or Cut 1-2 dB", q:"Wide shelf", reason:"Boost for more pick attack and brightness. Cut if the guitar sounds harsh or shrill." },
      ],
      comp: { ratio:"2:1 to 4:1", threshold:"Light to medium - 3-6 dB of gain reduction", attack:"10-20 ms", release:"100-200 ms", gain:"Makeup as needed", notes:"Lead guitar usually needs less compression than rhythm. The goal is sustain, not level control. A slightly slower attack lets the pick attack breathe." },
      geq_stream: "Lead guitar on stream should be louder in the 2-4 kHz range than the rhythm guitar. This creates separation. If both guitars sound similar, one will disappear on stream.",
      effects: [
        { name:"Delay", type:"Quarter note or dotted eighth note synced to tempo", settings:"1-2 repeats, Mix 15-25%, High cut on repeats at 4-6 kHz", purpose:"Adds dimension and fills space during lead lines. The classic lead guitar effect for live performance." },
        { name:"Reverb", type:"Spring or plate for vintage, hall for modern", settings:"Pre-delay 10-20 ms, Decay 0.8-1.5 sec, Mix 15-25%", purpose:"Glues the lead guitar into the room. Spring reverb is authentic for most genres." },
        { name:"Light Compression", type:"Optical (LA-2A style)", settings:"Gentle ratio, slow attack, very natural sound", purpose:"Adds sustain to lead lines without sounding processed. The warmth of optical compression suits lead guitar." },
      ],
      stream_tips: ["Lead guitar should be louder in the stream mix than rhythm guitar - it is the focal point", "If using distortion, high-pass at 100-120 Hz to prevent low-end mud on stream", "Pan lead guitar slightly off-center (10-20 degrees) to leave the center for vocals"],
    };
  } else if (instrument.id === "el_rhythm") {
    data = {
      hpf: "100-150 Hz. Rhythm guitar sits above the bass and kick. A higher HPF creates space for the low end instruments.",
      peq: [
        { band:"Low Mid Cut", freq:"200-400 Hz", action:"Cut 3-5 dB", q:"Medium (1.0-1.2)", reason:"Rhythm guitar must give way to bass and kick. A firm low-mid cut creates separation and clarity." },
        { band:"Upper Mid Body", freq:"800-1200 Hz", action:"Boost 1-2 dB", q:"Medium (0.8)", reason:"Adds body and fullness to chord strums without adding mud. The rhythm guitar presence zone." },
        { band:"Presence Roll-off", freq:"3-5 kHz", action:"Cut 1-2 dB", q:"Medium (0.8)", reason:"Rhythm guitar should not compete with lead guitar. Roll off presence slightly to keep it supportive." },
        { band:"Air", freq:"8-12 kHz", action:"Boost 1-2 dB", q:"Wide shelf", reason:"High end sparkle keeps rhythm guitar sounding fresh and detailed without adding harshness." },
      ],
      comp: { ratio:"4:1 to 6:1", threshold:"Set for 4-8 dB gain reduction on loud strums", attack:"5-15 ms - tighter than lead guitar", release:"80-150 ms", gain:"Makeup 2-3 dB", notes:"Rhythm guitar benefits from more compression than lead. The goal is consistency across chord strums and palm mutes. A squashed, controlled rhythm guitar sits in the mix perfectly." },
      geq_stream: "Rhythm guitar on stream should be lower in level and less prominent than lead guitar. Pan it to create width - if lead is slightly right, put rhythm slightly left.",
      effects: [
        { name:"Reverb", type:"Room or small hall", settings:"Shorter than lead (0.6-1.0 sec), Mix 10-18%", purpose:"Glues rhythm guitar into the room sound. Keep it shorter than any lead guitar reverb." },
        { name:"Stereo Width", type:"Doubler or stereo delay", settings:"Very short delays (5-20 ms L and R), blend subtly", purpose:"Widens rhythm guitar in stereo to create a fuller, bigger sound without taking up more frequency space." },
      ],
      stream_tips: ["Pan rhythm guitar opposite to lead if both are present", "Rhythm guitar in the stream mix should support, not lead - think of it as texture", "If using a heavily distorted rhythm tone, consider using a DI and amp sim instead of micing the cabinet for stream"],
    };
  } else if (instrument.id === "pad") {
    data = {
      hpf: "150-250 Hz. Pad sounds can fill the entire spectrum. A high HPF keeps them from muddying the low end where kick and bass live.",
      peq: [
        { band:"Low End Control", freq:"150-300 Hz", action:"Cut 4-6 dB", q:"Wide (0.6)", reason:"Pads often have excessive low-mid content that muddles the mix. This is the most important cut for pads." },
        { band:"Mid Transparency", freq:"500-800 Hz", action:"Cut 1-3 dB", q:"Wide (0.7)", reason:"Pads in this range interfere with vocals. A gentle cut keeps pads transparent and supportive." },
        { band:"Air and Shimmer", freq:"8-16 kHz", action:"Boost 1-2 dB", q:"Wide shelf", reason:"High frequency shimmer is what makes pads sound lush and beautiful. Gentle boost here adds magic." },
      ],
      comp: { ratio:"2:1 to 3:1", threshold:"Very gentle - just 2-4 dB of gain reduction", attack:"50-100 ms - slow to preserve the pad swells", release:"300-500 ms - slow and musical", gain:"Minimal makeup", notes:"Pads usually need light compression. The natural volume swells are part of their character. Over-compressing kills the life of a pad." },
      geq_stream: "In the stream mix: pads should be lower than you think. They add atmosphere, not focus. If you can hear the pad clearly, it is probably too loud.",
      effects: [
        { name:"Reverb", type:"Large hall or cathedral", settings:"Long decay 2.0-4.0 sec, Mix 25-40%", purpose:"Pads love lots of reverb. A large hall makes them feel massive and immersive." },
        { name:"Chorus or Ensemble", type:"Rich chorus", settings:"Rate: slow (0.2-0.5 Hz), Depth: moderate, Mix 30-50%", purpose:"Gives pads that classic lush, wide, moving quality. Essential for worship and ambient music." },
        { name:"Stereo Width", type:"Mid-side processing or stereo widener", settings:"Widen the sides, keep the center tight", purpose:"Pads can be spread very wide in stereo. They fill the sides of the stereo field beautifully." },
      ],
      stream_tips: ["Pads should be panned wide - full stereo L and R if the instrument allows", "If the stream sounds washy or muddy, the pad is usually the culprit - pull it down first", "Filter the pad on the stream send: high-pass at 200 Hz and low-pass at 8-10 kHz for a cleaner stream"],
    };
  } else if (instrument.id === "piano") {
    data = {
      hpf: "60-100 Hz for acoustic piano. 80-150 Hz for digital/electric piano. The low end of piano is musical but can be excessive.",
      peq: [
        { band:"Low Mid Mud", freq:"200-400 Hz", action:"Cut 2-4 dB", q:"Medium (1.0)", reason:"The main problem zone for piano on stream. Where the piano sounds boxy and interferes with vocals and guitar." },
        { band:"Mid Presence", freq:"1-2 kHz", action:"Boost 1-2 dB", q:"Medium (0.8)", reason:"Note definition and clarity. Helps the piano melody cut through the mix without adding harshness." },
        { band:"High Clarity", freq:"5-8 kHz", action:"Boost 1-3 dB", q:"Wide (0.7)", reason:"Brilliance and clarity of the piano keys. Adds the characteristic sparkle of a well-maintained piano." },
        { band:"Top Air", freq:"12-16 kHz", action:"Boost 1-2 dB", q:"Wide shelf", reason:"High-end shimmer and air. Makes the piano sound open and beautiful on stream." },
      ],
      comp: { ratio:"2:1 to 4:1", threshold:"3-6 dB gain reduction on loud passages", attack:"10-20 ms", release:"100-200 ms", gain:"Makeup 2-3 dB", notes:"Piano benefits from gentle compression to control the dynamic range of different players. A softer attack preserves the hammer strike character." },
      geq_stream: "Piano and vocals share the 200-2000 Hz range. On the stream GEQ: if the piano sounds like it is fighting the vocals, cut 500-800 Hz on the piano send to create space.",
      effects: [
        { name:"Reverb", type:"Concert hall or plate", settings:"Pre-delay 15-25 ms, Decay 1.5-2.5 sec, Mix 15-25%", purpose:"Piano needs room to breathe. A concert hall reverb sounds most natural and beautiful." },
        { name:"Compression", type:"Optical or VCA - gentle", settings:"As above - focused on evening out dynamics across the keyboard range", purpose:"Piano dynamics vary enormously across the keyboard. Compression gives a more consistent level." },
      ],
      stream_tips: ["If the piano player plays chords behind the vocalist, reduce the stream send by 3-5 dB during sung sections", "Piano recorded as stereo (L and R) should be panned naturally - wide but not extreme", "Electric piano (Rhodes, Wurlitzer) often benefits from a slightly more aggressive comp than acoustic"],
    };
  } else if (instrument.id === "grand_piano") {
    data = {
      hpf: "40-60 Hz for grand piano. Grand pianos have true sub-bass energy that is musical. Cut firmly below 40 Hz only.",
      peq: [
        { band:"Sub Control", freq:"40-80 Hz", action:"Gentle high-pass, not a hard cut", q:"Gentle slope", reason:"Grand piano has real sub-bass energy. A very gentle HPF is better than a hard cut. Preserve the bass register." },
        { band:"Low Mid Shape", freq:"200-400 Hz", action:"Cut 1-3 dB", q:"Wide (0.6)", reason:"Reduce muddiness without destroying the warmth that makes a grand piano special." },
        { band:"String Brilliance", freq:"3-6 kHz", action:"Boost 1-2 dB", q:"Wide (0.7)", reason:"The bright, clear character of grand piano strings. Very gentle - a grand piano already has this naturally." },
        { band:"Hammer Strike", freq:"6-10 kHz", action:"Boost 1-2 dB or leave flat", q:"Medium (0.8)", reason:"The percussive attack of the hammer hitting the strings. Adds definition and presence without harshness." },
      ],
      comp: { ratio:"1.5:1 to 3:1 - very gentle", threshold:"Only 2-4 dB of gain reduction", attack:"20-40 ms - slow, preserves the piano attack", release:"200-400 ms", gain:"Minimal makeup", notes:"Grand piano is the most dynamic instrument. Over-compression destroys what makes it special. Use very gentle settings and rely on the pianist to control their dynamics." },
      geq_stream: "Grand piano on stream: the challenge is its massive frequency range. On the stream GEQ, a gentle mid-range dip (500 Hz-2 kHz, 1-2 dB) creates space for vocals while keeping the piano full.",
      effects: [
        { name:"Reverb", type:"Concert hall - the longer the better", settings:"Pre-delay 20-40 ms, Decay 2.0-3.5 sec, Mix 20-35%", purpose:"A grand piano sounds best in a large acoustic space. Match the reverb to the music style." },
        { name:"Minimal processing is best", type:"EQ and light comp only", settings:"Let the instrument breathe", purpose:"Grand piano is one of the instruments that benefits most from minimal processing. Clean mic placement beats heavy EQ." },
      ],
      stream_tips: ["Mic placement matters more than EQ for grand piano - close mics for attack, room mics for character", "Blend two or three mic positions for richness on stream", "Grand piano and pads together can create a very muddy stream mix - HPF the pad aggressively when both play"],
    };
  } else {
    // el_drums
    data = {
      hpf: "Per channel: Kick 40-60 Hz, Snare 80-100 Hz, Toms 60-80 Hz, Overheads 150-300 Hz. Electronic drums usually have less bleed so HPF can be gentler.",
      peq: [
        { band:"Kick Sub", freq:"60-90 Hz", action:"Boost 2-4 dB", q:"Medium (1.2)", reason:"Electronic kick often lacks the sub-bass punch of acoustic. A boost here adds the weight and thump." },
        { band:"Kick Click", freq:"3-5 kHz", action:"Boost 2-3 dB", q:"Medium (1.0)", reason:"Beater click for definition on small speakers and stream playback where low end disappears." },
        { band:"Snare Crack", freq:"2-5 kHz", action:"Boost 2-4 dB", q:"Medium (1.0)", reason:"Electronic snare can sound flat and lifeless. A boost here adds the crack and snap." },
        { band:"Cymbal Harshness", freq:"6-10 kHz", action:"Cut 2-4 dB on electronic cymbal channels", q:"Medium (1.0)", reason:"Electronic cymbals are often harsh and digital-sounding. A cut here makes them more natural." },
      ],
      comp: { ratio:"4:1 to 6:1 on kick and snare", threshold:"4-8 dB gain reduction", attack:"2-5 ms on kick (fast), 8-15 ms on snare (keep the crack)", release:"50-150 ms", gain:"Makeup as needed", notes:"Electronic drums often already have compression baked in from the drum module. Verify the module output is not already clipping before adding more compression." },
      geq_stream: "Electronic drums on stream: often the overhead or room simulation channel is the muddy culprit. Roll off the overheads at 200-300 Hz and reduce their stream send level.",
      effects: [
        { name:"Reverb on Snare", type:"Plate or short hall", settings:"Decay 0.3-0.8 sec, Mix 20-35%", purpose:"Electronic snare needs reverb to sound real. A plate reverb is the most natural-sounding choice." },
        { name:"Reverb on Kick (subtle)", type:"Room", settings:"Decay 0.1-0.3 sec, Mix 10-15%", purpose:"A tiny room reverb makes electronic kick sound less synthetic and more three-dimensional." },
        { name:"Transient Shaper on Kick", type:"Transient designer", settings:"Add attack, reduce sustain", purpose:"Sharpens the punch of an electronic kick. Attack knob adds the initial thump, sustain knob removes the ring." },
      ],
      stream_tips: ["Run electronic drums through a sub-group and compress the whole kit together for glue", "The drum module headphone output is not always the same as the main output - check levels properly", "Many e-drum pads have velocity curves - set to maximum dynamic range for the most natural feel"],
    };
  }

  return data;
}

function generateCheatSheetPDF(instrument, mixer, data) {
  var win = window.open("", "_blank");
  if (!win) { alert("Please allow popups."); return; }
  var now = new Date().toLocaleDateString();
  var peqRows = data.peq ? data.peq.map(function(p) {
    return '<tr><td>' + p.band + '</td><td>' + p.freq + '</td><td><strong>' + p.action + '</strong></td><td>' + p.q + '</td><td>' + p.reason + '</td></tr>';
  }).join("") : "";
  var fxRows = data.effects ? data.effects.map(function(fx) {
    return '<div class="fx"><div class="fx-name">' + fx.name + ' <span class="fx-type">(' + fx.type + ')</span></div><div class="fx-set">Settings: ' + fx.settings + '</div><div class="fx-purpose">' + fx.purpose + '</div></div>';
  }).join("") : "";
  var tipRows = data.stream_tips ? data.stream_tips.map(function(t) { return '<li>' + t + '</li>'; }).join("") : "";
  win.document.write('<!DOCTYPE html><html><head><title>MixCheck AI Cheat Sheet - ' + instrument.name + '</title><style>');
  win.document.write('body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:40px;color:#111}');
  win.document.write('h1{font-size:24px;margin:0 0 4px}h2{font-size:16px;color:#00a070;border-bottom:2px solid #00a070;padding-bottom:6px;margin:24px 0 12px}');
  win.document.write('.sub{color:#666;font-size:13px;margin-bottom:28px}.hpf{background:#f0fff8;border:1px solid #00c070;border-radius:8px;padding:12px;margin-bottom:20px;font-size:13px}');
  win.document.write('table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:20px}th{background:#00a070;color:#fff;padding:8px;text-align:left}td{padding:8px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9f9f9}');
  win.document.write('.comp{background:#f5f5f5;border-radius:8px;padding:14px;font-size:13px;margin-bottom:20px}.comp p{margin:4px 0}');
  win.document.write('.fx{border-left:3px solid #4a7cff;padding:8px 12px;margin-bottom:10px;background:#f9f9f9}.fx-name{font-weight:700;font-size:13px}.fx-type{color:#666;font-weight:400}.fx-set{font-size:12px;color:#444;margin:3px 0}.fx-purpose{font-size:12px;color:#666}');
  win.document.write('.tips{background:#fffbf0;border:1px solid #f0a000;border-radius:8px;padding:14px}.tips li{font-size:13px;margin-bottom:6px}');
  win.document.write('.footer{margin-top:40px;text-align:center;font-size:11px;color:#aaa}');
  win.document.write('</style></head><body>');
  win.document.write('<h1>MixCheck AI Cheat Sheet</h1>');
  win.document.write('<div class="sub">' + instrument.icon + ' ' + instrument.name + ' | Mixer: ' + (mixer ? mixer.name : "General") + ' | ' + now + '</div>');
  win.document.write('<div class="hpf"><strong>HIGH PASS FILTER (HPF):</strong> ' + data.hpf + '</div>');
  if (data.peq && data.peq.length) {
    win.document.write('<h2>Parametric EQ (PEQ) - Channel Strip</h2>');
    win.document.write('<table><tr><th>Band</th><th>Frequency</th><th>Adjustment</th><th>Q / Width</th><th>Why</th></tr>' + peqRows + '</table>');
  }
  if (data.comp) {
    win.document.write('<h2>Compression Settings</h2><div class="comp">');
    win.document.write('<p><strong>Ratio:</strong> ' + data.comp.ratio + '</p>');
    win.document.write('<p><strong>Threshold:</strong> ' + data.comp.threshold + '</p>');
    win.document.write('<p><strong>Attack:</strong> ' + data.comp.attack + '</p>');
    win.document.write('<p><strong>Release:</strong> ' + data.comp.release + '</p>');
    win.document.write('<p><strong>Makeup Gain:</strong> ' + data.comp.gain + '</p>');
    win.document.write('<p style="margin-top:8px;font-style:italic;color:#555">' + data.comp.notes + '</p></div>');
  }
  if (data.geq_stream) {
    win.document.write('<h2>Stream / Mix Bus GEQ Tips</h2><p style="font-size:13px">' + data.geq_stream + '</p>');
  }
  if (fxRows) { win.document.write('<h2>Recommended Effects Chain</h2>' + fxRows); }
  if (tipRows) { win.document.write('<h2>Stream Tips</h2><div class="tips"><ul>' + tipRows + '</ul></div>'); }
  win.document.write('<div class="footer">MixCheck AI Cheat Sheet - mixcheckai.com - ' + now + '</div>');
  win.document.write('</body></html>');
  win.document.close();
  setTimeout(function() { win.print(); }, 500);
}

function ProGate({ onUnlockClick, what }) {
  return (
    <div style={{ position:"relative", marginBottom:16 }}>
      <div style={{ filter:"blur(4px)", pointerEvents:"none", userSelect:"none", opacity:0.4, background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px" }}>
        <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>{what}</div>
        <div style={{ height:12, background:"#1a1f2e", borderRadius:4, marginBottom:8, width:"80%" }} />
        <div style={{ height:12, background:"#1a1f2e", borderRadius:4, marginBottom:8, width:"60%" }} />
        <div style={{ height:12, background:"#1a1f2e", borderRadius:4, width:"70%" }} />
      </div>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"rgba(7,9,15,0.7)", backdropFilter:"blur(2px)", borderRadius:14, border:"1px solid rgba(74,124,255,0.3)" }}>
        <div style={{ fontSize:20, marginBottom:8 }}>🔒</div>
        <div style={{ fontSize:13, fontWeight:700, color:"#fff", fontFamily:"sans-serif", marginBottom:4 }}>{what}</div>
        <div style={{ fontSize:11, color:"#6b7280", fontFamily:"sans-serif", marginBottom:14, textAlign:"center", maxWidth:240 }}>Upgrade to Pro to unlock this section</div>
        <button onClick={onUnlockClick} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
          Unlock Pro - $9.99 CAD/mo
        </button>
      </div>
    </div>
  );
}

function CheatSheetPage({ mixer, instrument, isPro, onUnlockClick, onReset }) {
  var data = getCheatSheet(instrument, mixer);
  var isDigital = getMixerType(mixer) !== "analog";
  var freePeqLimit = 2; // Free users see first 2 PEQ bands only

  return (
    <div style={{ animation:"fadein 0.4s ease" }}>
      {/* Header badges */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:20 }}>
        <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>{mixer ? mixer.name : "General"}</div>
        <div style={{ background:"rgba(74,124,255,0.1)", border:"1px solid rgba(74,124,255,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#4a7cff", fontFamily:"sans-serif", fontWeight:600 }}>{instrument.icon} {instrument.name} Cheat Sheet</div>
        {isPro ? (
          <button onClick={function() { generateCheatSheetPDF(instrument, mixer, data); }}
            style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
            Download PDF
          </button>
        ) : (
          <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,179,71,0.1)", border:"1px solid rgba(255,179,71,0.3)", borderRadius:8, padding:"6px 14px" }}>
            <span style={{ fontSize:11, color:"#ffb347", fontFamily:"sans-serif" }}>Free preview - 2 of {data.peq ? data.peq.length : 4} EQ bands shown</span>
          </div>
        )}
      </div>

      {/* HPF - always free */}
      <div style={{ background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.25)", borderRadius:12, padding:"14px 18px", marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700 }}>HIGH PASS FILTER</div>
          <span style={{ fontSize:9, color:"#00e5a0", background:"rgba(0,229,160,0.1)", borderRadius:4, padding:"2px 8px", fontFamily:"monospace" }}>FREE</span>
        </div>
        <div style={{ fontSize:13, color:"#e8eaf0", fontFamily:"sans-serif", lineHeight:1.6 }}>{data.hpf}</div>
      </div>

      {/* PEQ - free gets first 2, rest locked */}
      {data.peq && data.peq.length > 0 && (
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#4a7cff", fontFamily:"monospace", fontWeight:700 }}>
              PARAMETRIC EQ (PEQ) {!isDigital && <span style={{ color:"#ffb347", fontSize:9, marginLeft:8 }}>ANALOG: use available bands</span>}
            </div>
            {!isPro && <span style={{ fontSize:9, color:"#ffb347", background:"rgba(255,179,71,0.1)", borderRadius:4, padding:"2px 8px", fontFamily:"monospace" }}>{freePeqLimit} of {data.peq.length} bands</span>}
          </div>
          {data.peq.map(function(p, i) {
            var isLocked = !isPro && i >= freePeqLimit;
            return (
              <div key={i} style={{ paddingBottom:i<data.peq.length-1?14:0, marginBottom:i<data.peq.length-1?14:0, borderBottom:i<data.peq.length-1?"1px solid #1a1f2e":"none", position:"relative" }}>
                {isLocked ? (
                  <div style={{ filter:"blur(5px)", pointerEvents:"none", userSelect:"none", opacity:0.35 }}>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                      <span style={{ background:"rgba(74,124,255,0.15)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#4a7cff", fontFamily:"monospace", fontWeight:700 }}>{p.band}</span>
                      <span style={{ background:"rgba(0,229,160,0.1)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#00e5a0", fontFamily:"monospace" }}>{p.freq}</span>
                      <span style={{ background:"rgba(255,87,87,0.15)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#ff5757", fontFamily:"monospace", fontWeight:700 }}>{p.action}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{p.reason}</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:6 }}>
                      <span style={{ background:"rgba(74,124,255,0.15)", border:"1px solid rgba(74,124,255,0.3)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#4a7cff", fontFamily:"monospace", fontWeight:700 }}>{p.band}</span>
                      <span style={{ background:"rgba(0,229,160,0.1)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:6, padding:"3px 10px", fontSize:11, color:"#00e5a0", fontFamily:"monospace" }}>{p.freq}</span>
                      <span style={{ background: p.action.includes("Boost")?"rgba(0,229,160,0.15)":"rgba(255,87,87,0.15)", border:"1px solid "+(p.action.includes("Boost")?"rgba(0,229,160,0.3)":"rgba(255,87,87,0.3)"), borderRadius:6, padding:"3px 10px", fontSize:11, color: p.action.includes("Boost")?"#00e5a0":"#ff5757", fontFamily:"monospace", fontWeight:700 }}>{p.action}</span>
                      <span style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif", padding:"3px 0" }}>Q: {p.q}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.5 }}>{p.reason}</div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Unlock CTA inline after last visible free band */}
          {!isPro && (
            <div style={{ marginTop:16, background:"rgba(74,124,255,0.06)", border:"1px solid rgba(74,124,255,0.2)", borderRadius:10, padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"#4a7cff", fontFamily:"sans-serif", marginBottom:3 }}>🔒 {data.peq.length - freePeqLimit} more EQ bands locked</div>
                <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>Plus full compression, effects chain and stream tips</div>
              </div>
              <button onClick={onUnlockClick} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"9px 18px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                Unlock Pro
              </button>
            </div>
          )}
        </div>
      )}

      {/* Compression - Pro only */}
      {isPro && data.comp && (
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px", marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>COMPRESSION SETTINGS</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:10, marginBottom:12 }}>
            {[
              { label:"RATIO", val:data.comp.ratio },
              { label:"ATTACK", val:data.comp.attack },
              { label:"RELEASE", val:data.comp.release },
              { label:"MAKEUP GAIN", val:data.comp.gain },
            ].map(function(c, i) {
              return (
                <div key={i} style={{ background:"#060810", borderRadius:8, padding:"10px 12px" }}>
                  <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:4 }}>{c.label}</div>
                  <div style={{ fontSize:13, color:"#e8eaf0", fontFamily:"sans-serif", fontWeight:600 }}>{c.val}</div>
                </div>
              );
            })}
          </div>
          <div style={{ background:"rgba(255,179,71,0.06)", borderRadius:8, padding:"10px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>THRESHOLD</div>
            <div style={{ fontSize:12, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.5 }}>{data.comp.threshold}</div>
          </div>
          <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginTop:10, fontStyle:"italic" }}>{data.comp.notes}</div>
        </div>
      )}
      {!isPro && data.comp && <ProGate onUnlockClick={onUnlockClick} what="COMPRESSION SETTINGS" />}

      {/* GEQ Stream Tips - Pro only */}
      {isPro && data.geq_stream && (
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px", marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>STREAM MIX / GEQ TIPS</div>
          <div style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.6 }}>{data.geq_stream}</div>
        </div>
      )}
      {!isPro && data.geq_stream && <ProGate onUnlockClick={onUnlockClick} what="STREAM MIX / GEQ TIPS" />}

      {/* Effects Chain - Pro only */}
      {isPro && data.effects && data.effects.length > 0 && (
        <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"18px", marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:"#a78bfa", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>RECOMMENDED EFFECTS CHAIN</div>
          {data.effects.map(function(fx, i) {
            return (
              <div key={i} style={{ paddingBottom:i<data.effects.length-1?14:0, marginBottom:i<data.effects.length-1?14:0, borderBottom:i<data.effects.length-1?"1px solid #1a1f2e":"none" }}>
                <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif" }}>{fx.name}</span>
                  <span style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>({fx.type})</span>
                </div>
                <div style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Settings: {fx.settings}</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.5 }}>{fx.purpose}</div>
              </div>
            );
          })}
        </div>
      )}
      {!isPro && data.effects && data.effects.length > 0 && <ProGate onUnlockClick={onUnlockClick} what="RECOMMENDED EFFECTS CHAIN" />}

      {/* Stream Tips - Pro only */}
      {isPro && data.stream_tips && data.stream_tips.length > 0 && (
        <div style={{ background:"rgba(255,179,71,0.06)", border:"1px solid rgba(255,179,71,0.2)", borderRadius:14, padding:"18px", marginBottom:16 }}>
          <div style={{ fontSize:10, letterSpacing:3, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>STREAM TIPS FOR {instrument.name.toUpperCase()}</div>
          {data.stream_tips.map(function(t, i) {
            return (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:i<data.stream_tips.length-1?10:0 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:"#ffb347", marginTop:5, flexShrink:0 }} />
                <div style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.6 }}>{t}</div>
              </div>
            );
          })}
        </div>
      )}
      {!isPro && data.stream_tips && data.stream_tips.length > 0 && <ProGate onUnlockClick={onUnlockClick} what="STREAM TIPS" />}

      {/* Big Pro upsell at bottom for free users */}
      {!isPro && (
        <div style={{ background:"linear-gradient(135deg,rgba(74,124,255,0.1),rgba(124,58,237,0.08))", border:"1.5px solid rgba(74,124,255,0.35)", borderRadius:16, padding:"24px", marginBottom:16, textAlign:"center" }}>
          <div style={{ fontSize:28, marginBottom:12 }}>🔒</div>
          <div style={{ fontSize:16, fontWeight:900, color:"#fff", fontFamily:"sans-serif", marginBottom:8, letterSpacing:-0.5 }}>Unlock the Full Cheat Sheet</div>
          <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:20, maxWidth:380, margin:"0 auto 20px" }}>
            You are seeing 2 of {data.peq ? data.peq.length : 4} EQ bands. Pro unlocks full PEQ, compression, effects chain, stream tips, and PDF export for all 11 instruments.
          </div>
          <button onClick={onUnlockClick} style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:10, padding:"13px 32px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>
            Unlock Pro - $9.99 CAD/mo
          </button>
          <div style={{ fontSize:11, color:"#2a3040", fontFamily:"sans-serif", marginTop:10 }}>Cancel anytime. Instant access after payment.</div>
        </div>
      )}

      <button onClick={onReset} style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:10, padding:"11px 22px", color:"#6b7280", fontSize:13, fontFamily:"sans-serif", cursor:"pointer" }}>
        Start Over
      </button>
    </div>
  );
}

function AnalyzePage({ navigate, isPro, onUnlockClick, appMode }) {
  var stepState = useState(1); var step = stepState[0]; var setStep = stepState[1];
  var mixerState = useState(null); var mixer = mixerState[0]; var setMixer = mixerState[1];
  var customState = useState(""); var customMixer = customState[0]; var setCustomMixer = customState[1];
  var showCustState = useState(false); var showCustom = showCustState[0]; var setShowCustom = showCustState[1];
  var modeState = useState(null); var mode = modeState[0]; var setMode = modeState[1];
  var csInstState = useState(null); var csInstrument = csInstState[0]; var setCsInstrument = csInstState[1];
  var fileState = useState(null); var file = fileState[0]; var setFile = fileState[1];
  var analyzingState = useState(false); var analyzing = analyzingState[0]; var setAnalyzing = analyzingState[1];
  var statusState = useState(""); var analyzeStatus = statusState[0]; var setAnalyzeStatus = statusState[1];
  var resultsState = useState(null); var results = resultsState[0]; var setResults = resultsState[1];
  var dragState = useState(false); var dragOver = dragState[0]; var setDragOver = dragState[1];
  var fileRef = useRef(); var fileRef2 = useRef();
  var stemStatusState = useState(null); var stemStatus = stemStatusState[0]; var setStemStatus = stemStatusState[1];
  var stemOutputsState = useState(null); var stemOutputs = stemOutputsState[0]; var setStemOutputs = stemOutputsState[1];
  var stemErrorState = useState(""); var stemError = stemErrorState[0]; var setStemError = stemErrorState[1];
  var stemMutedState = useState({ drums:false, bass:false, vocals:false, other:false });
  var stemMuted = stemMutedState[0]; var setStemMuted = stemMutedState[1];
  var stemPlayingState = useState(false); var stemPlaying = stemPlayingState[0]; var setStemPlaying = stemPlayingState[1];
  var stemAudioRefs = useRef({});
  var stemsBalanceState = useState(null); var stemsBalance = stemsBalanceState[0]; var setStemsBalance = stemsBalanceState[1];
  var clickMutedState = useState(true); var clickMuted = clickMutedState[0]; var setClickMuted = clickMutedState[1];
  var clickBpmState = useState(120); var clickBpm = clickBpmState[0]; var setClickBpm = clickBpmState[1];
  var clickRef = useRef({ ctx:null, intervalId:null, gainNode:null });

  var selectedMixer = showCustom && customMixer.trim()
    ? { id:"custom", name: customMixer.trim(), type:"unknown", streams:"Aux/Main Out" }
    : (mixer || { id:"none", name:"Unknown Mixer", type:"unknown", streams:"Aux Out" });

  var analyze = useCallback(async function(f) {
    if (!f) return;
    // Check usage limit for free users
    if (!isPro) {
      var usageNow = getUsageCount();
      if (usageNow >= FREE_LIMIT) {
        setResults({ error:"You have used your " + FREE_LIMIT + " free analyses this month. Upgrade to Pro for unlimited analyses." });
        setStep(4); return;
      }
    }
    var ext = f.name.split(".").pop().toLowerCase();
    var validExts = ["mp3","wav","aac","m4a","flac","ogg","mp4","mov","webm","wma"];
    if (validExts.indexOf(ext) === -1) {
      setResults({ error:"File type not supported. Upload MP3, WAV, AAC, M4A, or FLAC." });
      setStep(4); return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setResults({ error:"File too large (max 500MB). For a 2-hour service, export as MP3 128kbps." });
      setStep(4); return;
    }
    setFile(f); setAnalyzing(true); setResults(null);
    var mb = Math.round(f.size / 1024 / 1024);
    try {
      setAnalyzeStatus(mb > 50 ? "Reading " + mb + "MB file - please wait..." : "Reading audio file...");
      await new Promise(function(r) { setTimeout(r, 80); });
      setAnalyzeStatus(mb > 50 ? "Decoding and sampling key sections..." : "Measuring loudness, peak, dynamics...");
      var m = await measureAudio(f);
      setAnalyzeStatus("Calculating mix score...");
      await new Promise(function(r) { setTimeout(r, 60); });
      setAnalyzeStatus("Generating recommendations...");
      var lufsVal = m.lufs !== undefined ? m.lufs : -20;
      var peakVal = m.peakDb !== undefined ? m.peakDb : -6;
      var dynVal  = m.dynRange !== undefined ? m.dynRange : 12;
      var swVal   = m.stereoWidth !== undefined ? m.stereoWidth : 50;
      var recs    = generateRecs(lufsVal, peakVal, dynVal, swVal, m.freq || null);
      var score   = calcMixScore(lufsVal, peakVal, dynVal, swVal);
      var finalR  = Object.assign({}, m, { recs:recs, mixer:selectedMixer, score:score, lufs:lufsVal, peakDb:peakVal, dynRange:dynVal, stereoWidth:swVal });
      saveToHistory({
        fileName: f.name, date: new Date().toISOString(),
        score: score, lufs: lufsVal, peakDb: peakVal, dynRange: dynVal, stereoWidth: swVal,
        mixer: selectedMixer ? selectedMixer.name : "", mode: appMode || "church",
      });
      if (!isPro) incrementUsage();
      setResults(finalR);
      setStep(4);
    } catch(err) {
      setResults({ error: (err && err.message) ? err.message : "Could not analyze. Try an MP3 or WAV file." });
      setStep(4);
    }
    setAnalyzing(false); setAnalyzeStatus("");
  }, [selectedMixer, isPro, appMode]);

  var onDrop = useCallback(function(e) {
    e.preventDefault(); setDragOver(false);
    var f = e.dataTransfer.files[0]; if(f) analyze(f);
  }, [analyze]);
  var onPick = function(e) { if (e.target.files[0]) analyze(e.target.files[0]); };
  var reset = function() {
    setStep(1); setMixer(null); setFile(null); setResults(null);
    setShowCustom(false); setCustomMixer("");
    setMode(null); setCsInstrument(null);
    setStemStatus(null); setStemOutputs(null); setStemError("");
    Object.values(stemAudioRefs.current).forEach(function(a) { a.pause(); a.src = ""; });
    stemAudioRefs.current = {};
    setStemMuted({ drums:false, bass:false, vocals:false, other:false });
    setStemPlaying(false);
    if (clickRef.current.intervalId) clearInterval(clickRef.current.intervalId);
    if (clickRef.current.ctx) { try { clickRef.current.ctx.close(); } catch(e) {} }
    clickRef.current = { ctx:null, intervalId:null, gainNode:null };
    setClickMuted(true);
    setClickBpm(120);
  };
  var prioColor = function(p) { return ({ high:"#ff5757", med:"#ffb347", ok:"#00e5a0", tip:"#4a7cff" })[p] || "#4a5568"; };

  var handleStemSeparation = useCallback(async function() {
    if (!file) return;
    var trial = getTrialInfo();
    if (trial.isTrial && trial.stemsLeft <= 0) {
      setStemError("You've used all " + TRIAL_STEM_LIMIT + " trial stem separations. Unlimited access starts when your trial converts to a paid subscription.");
      setStemStatus("error"); return;
    }
    var MAX_STEM_BYTES = 3 * 1024 * 1024;
    if (!trial.isTrial && file.size > MAX_STEM_BYTES) {
      setStemStatus("toolarge"); return;
    }
    setStemStatus("loading"); setStemOutputs(null); setStemError("");
    var errMsg = "";
    try {
      var dataUrl;
      if (trial.isTrial) {
        // Truncate to 2 minutes for trial users
        var ab = await new Promise(function(resolve, reject) {
          var rd = new FileReader(); rd.onload = function(e) { resolve(e.target.result); }; rd.onerror = reject; rd.readAsArrayBuffer(file);
        });
        var tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
        var decoded = await tmpCtx.decodeAudioData(ab);
        tmpCtx.close().catch(function(){});
        var maxSamples = Math.min(decoded.length, TRIAL_MAX_SECONDS * decoded.sampleRate);
        var numCh = Math.min(decoded.numberOfChannels, 2);
        var truncBuf = new AudioBuffer({ numberOfChannels: numCh, length: maxSamples, sampleRate: decoded.sampleRate });
        for (var ch = 0; ch < numCh; ch++) truncBuf.getChannelData(ch).set(decoded.getChannelData(ch).subarray(0, maxSamples));
        dataUrl = wavToBase64DataUrl(encodeWAV(truncBuf));
      } else {
        dataUrl = await new Promise(function(resolve, reject) {
          var rd = new FileReader(); rd.onload = function(e) { resolve(e.target.result); }; rd.onerror = reject; rd.readAsDataURL(file);
        });
      }
      var resp = await fetch("/api/stems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: dataUrl, deviceId: getDeviceId(), isTrial: trial.isTrial }),
      });
      var data = await resp.json();
      if (!resp.ok) { errMsg = data.error || "Server error"; throw new Error(errMsg); }
      if (trial.isTrial) {
        try { localStorage.setItem("mca_trial_stems", String(trial.stemsUsed + 1)); } catch(e) {}
      } else if (data.balance) {
        setStemsBalance(data.balance);
      }
      var predId = data.predictionId;
      for (var attempt = 0; attempt < 72; attempt++) {
        await new Promise(function(r) { setTimeout(r, 5000); });
        var sr2 = await fetch("/api/stems-status?id=" + predId);
        if (!sr2.ok) continue;
        var sd = await sr2.json();
        if (sd.status === "succeeded") { setStemOutputs(sd.output); setStemStatus("done"); return; }
        if (sd.status === "failed" || sd.status === "canceled") { errMsg = "Stem separation failed on server"; throw new Error(errMsg); }
      }
      errMsg = "Timed out — try a shorter file (under 3 min)";
      throw new Error(errMsg);
    } catch (e) { setStemError(errMsg || e.message || "Unknown error"); setStemStatus("error"); }
  }, [file]);

  useEffect(function() {
    if (!stemOutputs) return;
    var created = [];
    Object.keys(stemOutputs).forEach(function(k) {
      var a = new Audio(stemOutputs[k]);
      a.crossOrigin = "anonymous";
      stemAudioRefs.current[k] = a;
      created.push(a);
    });
    return function() {
      created.forEach(function(a) { a.pause(); a.src = ""; });
      stemAudioRefs.current = {};
    };
  }, [stemOutputs]);

  useEffect(function() {
    if (results && results.bpm) setClickBpm(results.bpm);
  }, [results]);

  useEffect(function() {
    if (!isPro) return;
    var trial = getTrialInfo();
    if (trial.isTrial) return; // trial balance is tracked separately
    fetch("/api/stems-balance?deviceId=" + encodeURIComponent(getDeviceId()))
      .then(function(r) { return r.json(); })
      .then(function(d) { setStemsBalance(d); })
      .catch(function() {});
  }, [isPro]);

  var startClick = function(bpm) {
    var ref = clickRef.current;
    if (ref.intervalId) clearInterval(ref.intervalId);
    if (ref.ctx) { try { ref.ctx.close(); } catch(e) {} }
    var AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtxClass) return;
    var ctx = new AudioCtxClass();
    var gainNode = ctx.createGain();
    gainNode.gain.value = clickMuted ? 0.0 : 1.0;
    gainNode.connect(ctx.destination);
    var beatDur = 60 / bpm;
    var nextBeat = ctx.currentTime + 0.05;
    var beatNum = 0;
    var schedule = function() {
      while (nextBeat < ctx.currentTime + 0.25) {
        var osc = ctx.createOscillator();
        var env2 = ctx.createGain();
        osc.frequency.value = beatNum % 4 === 0 ? 1200 : 880;
        env2.gain.setValueAtTime(0.7, nextBeat);
        env2.gain.exponentialRampToValueAtTime(0.001, nextBeat + 0.018);
        osc.connect(env2); env2.connect(gainNode);
        osc.start(nextBeat); osc.stop(nextBeat + 0.02);
        nextBeat += beatDur; beatNum++;
      }
    };
    schedule();
    var id = setInterval(schedule, 50);
    clickRef.current = { ctx:ctx, intervalId:id, gainNode:gainNode };
  };

  var stopClick = function() {
    var ref = clickRef.current;
    if (ref.intervalId) clearInterval(ref.intervalId);
    if (ref.ctx) { try { ref.ctx.close(); } catch(e) {} }
    clickRef.current = { ctx:null, intervalId:null, gainNode:null };
  };

  var handleClickMute = function() {
    var next = !clickMuted;
    setClickMuted(next);
    var ref = clickRef.current;
    if (ref.gainNode) ref.gainNode.gain.value = next ? 0.0 : 1.0;
  };

  var handleClickBpmChange = function(delta) {
    var next = Math.max(40, Math.min(240, clickBpm + delta));
    setClickBpm(next);
    if (stemPlaying) { stopClick(); startClick(next); }
  };

  var handleStemPlayPause = function() {
    var refs = stemAudioRefs.current;
    var keys = Object.keys(refs);
    if (keys.length === 0) return;
    if (stemPlaying) {
      keys.forEach(function(k) { refs[k].pause(); });
      stopClick();
      setStemPlaying(false);
    } else {
      var t = refs[keys[0]].currentTime;
      keys.forEach(function(k) { refs[k].currentTime = t; });
      var plays = keys.map(function(k) { return refs[k].play().catch(function(){}); });
      Promise.all(plays).then(function() { setStemPlaying(true); });
      startClick(clickBpm);
    }
  };

  var handleStemStop = function() {
    var refs = stemAudioRefs.current;
    Object.keys(refs).forEach(function(k) { refs[k].pause(); refs[k].currentTime = 0; });
    stopClick();
    setStemPlaying(false);
  };

  var handleStemMute = function(key) {
    var a = stemAudioRefs.current[key];
    if (!a) return;
    var next = Object.assign({}, stemMuted);
    next[key] = !next[key];
    a.muted = next[key];
    setStemMuted(next);
  };

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", paddingTop:80, fontFamily:"Georgia,serif", color:"#e8eaf0" }}>
      <div style={{ maxWidth:820, margin:"0 auto", padding:"40px 20px" }}>
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>AUDIO ANALYZER</div>
          <h1 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, margin:"0 0 8px", letterSpacing:-1.5, color:"#fff" }}>Analyze your mix.</h1>
          <p style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", margin:0 }}>Upload a recording. Get real measurements and plain-English advice. Handles 2-hour files.</p>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:28, alignItems:"center" }}>
          {[["1","Mixer"],["2","Service"],["3", mode==="cheatsheet"?"Instrument":"Upload"],["4","Results"]].map(function(item, i) {
            return (
              <React.Fragment key={item[0]}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, flexShrink:0 }}>
                  <div style={{ width:26, height:26, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, fontFamily:"monospace", background: step>i+1?"#00e5a0":step===i+1?"rgba(0,229,160,0.15)":"#0d1017", border: step>=i+1?"1.5px solid #00e5a0":"1.5px solid #1a1f2e", color: step>i+1?"#07090f":step===i+1?"#00e5a0":"#2a3040" }}>{step>i+1?"v":item[0]}</div>
                  <span style={{ fontSize:9, color: step===i+1?"#e8eaf0":"#2a3040", fontFamily:"sans-serif" }}>{item[1]}</span>
                </div>
                {i<3 && <div style={{ flex:1, height:1, background: step>i+1?"#00e5a044":"#1a1f2e" }} />}
              </React.Fragment>
            );
          })}
        </div>

        {step === 1 && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:16 }}>Select your mixer for best results. Works with any mixer.</div>

            {/* Search box */}
            <div style={{ position:"relative", marginBottom:20 }}>
              <input
                placeholder="Search your mixer e.g. QU-24, X32, TF1..."
                value={customMixer}
                onChange={function(e) { setCustomMixer(e.target.value); setShowCustom(false); setMixer(null); }}
                style={{ width:"100%", background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:10, padding:"12px 16px 12px 40px", color:"#e8eaf0", fontSize:13, fontFamily:"sans-serif", outline:"none" }}
              />
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:14, opacity:0.4 }}>🔍</div>
              {customMixer.trim() && (
                <button onClick={function() { setCustomMixer(""); setShowCustom(false); }}
                  style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#4a5568", fontSize:16, cursor:"pointer", lineHeight:1 }}>
                  x
                </button>
              )}
            </div>

            {/* Filtered mixer groups */}
            {(function() {
              var query = customMixer.trim().toLowerCase();
              var filteredGroups = MIXER_GROUPS.map(function(g) {
                return {
                  label: g.label,
                  mixers: g.mixers.filter(function(m) {
                    return !query || m.name.toLowerCase().indexOf(query) !== -1 || g.label.toLowerCase().indexOf(query) !== -1;
                  })
                };
              }).filter(function(g) { return g.mixers.length > 0; });

              var totalFound = filteredGroups.reduce(function(acc, g) { return acc + g.mixers.length; }, 0);

              if (query && totalFound === 0) {
                return (
                  <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"32px 24px", textAlign:"center", marginBottom:20 }}>
                    <div style={{ fontSize:36, marginBottom:14 }}>🎛</div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:8 }}>
                      Mixer not found
                    </div>
                    <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, marginBottom:20, maxWidth:340, margin:"0 auto 20px" }}>
                      We do not have <span style={{ color:"#ffb347", fontWeight:600 }}>"{customMixer}"</span> in our list yet. Try a different spelling, or scroll down to use it as a custom mixer - our recommendations still work on any board.
                    </div>
                    <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
                      <button onClick={function() { setCustomMixer(""); }}
                        style={{ background:"#1a1f2e", color:"#e8eaf0", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                        Try again
                      </button>
                      <button onClick={function() { setShowCustom(true); setStep(2); }}
                        style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"9px 20px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                        Use "{customMixer}" anyway
                      </button>
                    </div>
                  </div>
                );
              }

              return filteredGroups.map(function(g, gi) {
                return (
                  <div key={gi} style={{ marginBottom:20 }}>
                    <div style={{ fontSize:10, letterSpacing:3, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:10 }}>{g.label.toUpperCase()}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))", gap:8 }}>
                      {g.mixers.map(function(m) {
                        var selected = mixer && mixer.id === m.id;
                        return (
                          <button key={m.id} onClick={function() { setMixer(m); setShowCustom(false); setCustomMixer(""); setStep(2); }}
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
              });
            })()}

            {/* Custom mixer option - only show when search has no matches or is empty */}
            {(function() {
              var query = customMixer.trim().toLowerCase();
              var totalFound = MIXER_GROUPS.reduce(function(acc, g) {
                return acc + g.mixers.filter(function(m) {
                  return !query || m.name.toLowerCase().indexOf(query) !== -1;
                }).length;
              }, 0);
              if (totalFound > 0 || !query) return null;
              return null; // handled by the "try again" block above
            })()}

            <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"16px", marginTop:8 }}>
              <div style={{ fontSize:11, color:"#ffb347", fontFamily:"monospace", fontWeight:700, letterSpacing:2, marginBottom:10 }}>MY MIXER IS NOT IN THE LIST</div>
              <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:12 }}>No problem - type your mixer name and we will give you general recommendations that work on any board.</div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <input placeholder="e.g. Mackie 1642, Soundcraft Signature" value={showCustom ? customMixer : ""}
                  onChange={function(e) { setCustomMixer(e.target.value); setShowCustom(true); setMixer(null); }}
                  style={{ flex:1, minWidth:180, background:"#060810", border:"1px solid #1a1f2e", borderRadius:8, padding:"10px 14px", color:"#e8eaf0", fontSize:13, fontFamily:"sans-serif", outline:"none" }} />
                <button onClick={function() { if(customMixer.trim()) { setShowCustom(true); setStep(2); } }} disabled={!customMixer.trim()}
                  style={{ background: customMixer.trim()?"#ffb347":"#1a1f2e", color: customMixer.trim()?"#07090f":"#2a3040", border:"none", borderRadius:8, padding:"10px 18px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor: customMixer.trim()?"pointer":"not-allowed" }}>
                  Use This
                </button>
              </div>
              {(function() {
                if (!showCustom || !customMixer.trim()) return null;
                var q = customMixer.trim().toLowerCase();
                var found = MIXER_GROUPS.some(function(g) {
                  return g.mixers.some(function(m) {
                    return m.name.toLowerCase().indexOf(q) !== -1;
                  });
                });
                if (!found && customMixer.trim().length >= 2) {
                  return (
                    <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:12, color:"#ff5757", fontFamily:"sans-serif" }}>
                        Mixer not found.
                      </span>
                      <button onClick={function() { setCustomMixer(""); setShowCustom(false); }}
                        style={{ background:"none", border:"none", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", padding:0, textDecoration:"underline" }}>
                        Try again
                      </button>
                      <span style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif" }}>
                        or press Use This to continue with general settings.
                      </span>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        )}

        {step === 2 && !analyzing && !mode && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>What would you like to do with <strong style={{ color:"#e8eaf0" }}>{selectedMixer.name}</strong>?</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:14, marginBottom:16 }}>
              <button onClick={function() { setMode("full"); setStep(3); }} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"24px 20px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}>
                <div style={{ fontSize:28, marginBottom:12 }}>📊</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:"sans-serif", marginBottom:6 }}>Full Mix Analysis</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>Upload your recording. Get real loudness, dynamic range, and frequency measurements with recommendations.</div>
                <div style={{ marginTop:12, fontSize:10, color:"#00e5a0", fontFamily:"monospace", fontWeight:700 }}>FREE</div>
              </button>
              <button onClick={function() { setMode("cheatsheet"); setStep(3); }} style={{ background:"linear-gradient(135deg,rgba(74,124,255,0.08),rgba(74,124,255,0.02))", border:"1px solid rgba(74,124,255,0.3)", borderRadius:14, padding:"24px 20px", cursor:"pointer", textAlign:"left", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:-1, right:14, background:"linear-gradient(90deg,#4a7cff,#7c3aed)", color:"#fff", fontSize:9, fontWeight:800, fontFamily:"monospace", letterSpacing:2, padding:"4px 10px", borderRadius:"0 0 8px 8px" }}>PRO PDF</div>
                <div style={{ fontSize:28, marginBottom:12 }}>🎛</div>
                <div style={{ fontSize:15, fontWeight:800, color:"#fff", fontFamily:"sans-serif", marginBottom:6 }}>Mixer Cheat Sheet</div>
                <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6 }}>Get PEQ, GEQ, compression, and effects settings for a specific instrument. No file upload needed.</div>
                <div style={{ marginTop:12, display:"flex", gap:6, flexWrap:"wrap" }}>
                  {["Vocal","Bass","Drums","Guitar","Keys","Pad"].map(function(n) {
                    return <span key={n} style={{ fontSize:9, color:"#4a7cff", background:"rgba(74,124,255,0.1)", borderRadius:4, padding:"2px 6px", fontFamily:"monospace" }}>{n}</span>;
                  })}
                </div>
              </button>
            </div>
            <button onClick={function() { setStep(1); }} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Back to mixer select</button>
          </div>
        )}

        {step === 3 && mode === "cheatsheet" && !csInstrument && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:20 }}>Pick an instrument to get the full cheat sheet for <strong style={{ color:"#e8eaf0" }}>{selectedMixer.name}</strong>.</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:10, marginBottom:16 }}>
              {CHEAT_INSTRUMENTS.map(function(inst) {
                return (
                  <button key={inst.id} onClick={function() { setCsInstrument(inst); setStep(4); }}
                    style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:12, padding:"16px 14px", cursor:"pointer", textAlign:"left", transition:"border-color 0.15s" }}>
                    <div style={{ fontSize:26, marginBottom:10 }}>{inst.icon}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif" }}>{inst.name}</div>
                  </button>
                );
              })}
            </div>
            <button onClick={function() { setMode(null); setStep(2); }} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Back to service select</button>
          </div>
        )}

        {step === 4 && mode === "cheatsheet" && csInstrument && (
          <CheatSheetPage mixer={selectedMixer} instrument={csInstrument} isPro={isPro} onUnlockClick={onUnlockClick} onReset={reset} />
        )}

        {step === 3 && mode === "full" && !analyzing && (
          <div style={{ animation:"fadein 0.3s ease" }}>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(0,229,160,0.06)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:10, padding:"10px 16px", flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ fontSize:16 }}>🎛</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif" }}>{selectedMixer.name}</div>
                    <div style={{ fontSize:10, color:"#4a5568", fontFamily:"sans-serif" }}>Stream: {selectedMixer.streams}</div>
                  </div>
                </div>
                <button onClick={function() { setStep(1); }} style={{ background:"none", border:"none", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", cursor:"pointer" }}>Change</button>
              </div>
              <div style={{ background: appMode==="studio"?"rgba(255,179,71,0.1)":"rgba(74,124,255,0.08)", border:"1px solid "+(appMode==="studio"?"rgba(255,179,71,0.3)":"rgba(74,124,255,0.2)"), borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center" }}>
                <div style={{ fontSize:11, fontWeight:700, color: appMode==="studio"?"#ffb347":"#4a7cff", fontFamily:"monospace" }}>{appMode === "studio" ? "STUDIO MODE" : "CHURCH MODE"}</div>
              </div>
            </div>
            {!isPro && (
              <div style={{ background:"rgba(255,87,87,0.06)", border:"1px solid rgba(255,87,87,0.2)", borderRadius:10, padding:"10px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:12, color:"#ff5757", fontFamily:"sans-serif" }}>
                  Free: {Math.max(0, FREE_LIMIT - getUsageCount())} of {FREE_LIMIT} analyses remaining this month
                </div>
                <button onClick={onUnlockClick} style={{ background:"none", border:"none", color:"#00e5a0", fontSize:11, fontFamily:"sans-serif", cursor:"pointer", fontWeight:700 }}>Upgrade</button>
              </div>
            )}
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

        {step === 4 && mode === "full" && results && !analyzing && (
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
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
                  {results.mixer && <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600 }}>{results.mixer.name}</div>}
                  {file && <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{file.name}</div>}
                  {results.duration > 0 && <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:8, padding:"6px 14px", fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>{Math.floor(results.duration/60)}m {results.duration%60}s</div>}
                  {results.isLongFile && <div style={{ background:"rgba(255,179,71,0.1)", border:"1px solid rgba(255,179,71,0.3)", borderRadius:8, padding:"6px 14px", fontSize:11, color:"#ffb347", fontFamily:"sans-serif" }}>Sampled {results.sliceCount} sections</div>}
                </div>

                {/* MIX SCORE */}
                {results.score !== undefined && (function() {
                  var si = getScoreLabel(results.score);
                  return (
                    <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.07),rgba(0,229,160,0.02))", border:"1px solid rgba(0,229,160,0.2)", borderRadius:16, padding:"20px 24px", marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
                      <div>
                        <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:8 }}>MIX SCORE</div>
                        <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
                          <div style={{ fontSize:56, fontWeight:900, color:si.color, letterSpacing:-3, lineHeight:1 }}>{results.score}</div>
                          <div style={{ fontSize:22, color:"#2a3040" }}>/100</div>
                        </div>
                        <div style={{ fontSize:14, color:si.color, fontWeight:700, fontFamily:"sans-serif", marginTop:4 }}>{si.emoji} {si.label}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif", marginBottom:6 }}>Analyze again after applying the fixes below to raise your score.</div>
                        <div style={{ fontSize:11, color:"#2a3040", fontFamily:"monospace" }}>{appMode === "studio" ? "STUDIO MODE • -14 LUFS target" : "CHURCH MODE • -16 LUFS target"}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* PDF + Email buttons for Pro */}
                {isPro && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:20 }}>
                    <button onClick={function() { generatePDF(results, file ? file.name : "recording"); }}
                      style={{ background:"linear-gradient(135deg,#4a7cff,#7c3aed)", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                      Download PDF Report
                    </button>
                    <button onClick={function() {
                      var subject = "MixCheck AI Report - " + (file ? file.name : "Recording");
                      var body = "MixCheck AI Analysis\n\nMix Score: " + results.score + "/100 (" + getScoreLabel(results.score).label + ")\n\nLoudness: " + results.lufs + " LUFS\nTrue Peak: " + results.peakDb + " dBTP\nDynamic Range: " + results.dynRange + " LU\nStereo Width: " + results.stereoWidth + "%\n\nAnalyzed by MixCheck AI - mixcheckai.com";
                      window.location.href = "mailto:?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
                    }} style={{ background:"#0d1017", border:"1px solid #1a1f2e", color:"#e8eaf0", borderRadius:8, padding:"8px 16px", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                      Email Report
                    </button>
                  </div>
                )}
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
                  {results.detectedKey && (
                    <div style={{ background:"#0d1017", border:"1px solid #a78bfa33", borderRadius:12, padding:"14px" }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>KEY DETECTED</div>
                      <div style={{ fontSize:17, fontWeight:900, color:"#a78bfa", letterSpacing:-0.5, marginBottom:2 }}>{results.detectedKey}</div>
                      <div style={{ fontSize:10, color:"#a78bfa", fontWeight:700, fontFamily:"sans-serif", marginBottom:3 }}>Musical Key</div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>Estimated from audio</div>
                    </div>
                  )}
                  {results.bpm && (
                    <div style={{ background:"#0d1017", border:"1px solid #4a7cff33", borderRadius:12, padding:"14px" }}>
                      <div style={{ fontSize:9, letterSpacing:2, color:"#4a5568", fontFamily:"monospace", fontWeight:700, marginBottom:6 }}>TEMPO</div>
                      <div style={{ fontSize:17, fontWeight:900, color:"#4a7cff", letterSpacing:-0.5, marginBottom:2 }}>{results.bpm} BPM</div>
                      <div style={{ fontSize:10, color:"#4a7cff", fontWeight:700, fontFamily:"sans-serif", marginBottom:3 }}>Beats Per Minute</div>
                      <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif" }}>Estimated from audio</div>
                    </div>
                  )}
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
                {/* STEM SEPARATION */}
                {isPro ? (
                  <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                    <div style={{ fontSize:10, letterSpacing:3, color:"#a78bfa", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>STEM SEPARATION</div>
                    {!stemStatus && (function() {
                      var trial = getTrialInfo();
                      var bal = stemsBalance;
                      var isLifetime = bal && bal.isLifetime;
                      var monthlyLeft = bal ? Math.max(0, bal.monthly_limit - bal.monthly_used) : null;
                      var totalLeft = isLifetime ? Infinity : (bal ? (monthlyLeft + (bal.credits || 0)) : null);
                      var outOfStems = !trial.isTrial && !isLifetime && bal && totalLeft <= 0;
                      return (
                        <div>
                          <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:10 }}>
                            Split this recording into drums, bass, vocals, and other instruments.
                            {trial.isTrial && <span style={{ color:"#a78bfa" }}> Trial: first 2 min.</span>}
                          </div>
                          {/* Balance bar */}
                          {trial.isTrial && (
                            <div style={{ fontSize:11, color: trial.stemsLeft > 0 ? "#a78bfa" : "#ff5757", fontFamily:"monospace", fontWeight:700, marginBottom:10, letterSpacing:1 }}>
                              {trial.stemsLeft > 0 ? trial.stemsLeft + " of " + TRIAL_STEM_LIMIT + " trial separations left" : "Trial limit reached — unlimited monthly access after trial"}
                            </div>
                          )}
                          {!trial.isTrial && !isLifetime && bal && (
                            <div style={{ marginBottom:12 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                                <span style={{ fontSize:11, color:"#6b7280", fontFamily:"monospace" }}>{bal.monthly_used}/{bal.monthly_limit} this month</span>
                                {bal.credits > 0 && <span style={{ fontSize:11, color:"#a78bfa", fontFamily:"monospace" }}>+{bal.credits} bonus credits</span>}
                              </div>
                              <div style={{ height:4, background:"#1a1f2e", borderRadius:2, overflow:"hidden" }}>
                                <div style={{ height:"100%", width: Math.min(100, (bal.monthly_used/bal.monthly_limit)*100)+"%", background: monthlyLeft > 3 ? "#a78bfa" : monthlyLeft > 0 ? "#ffb347" : "#ff5757", borderRadius:2, transition:"width 0.3s" }} />
                              </div>
                            </div>
                          )}
                          {outOfStems ? (
                            <div>
                              <div style={{ fontSize:13, color:"#ff5757", fontFamily:"sans-serif", marginBottom:10 }}>Monthly limit reached. Buy more stems to continue.</div>
                              <button onClick={function() { window.open(STRIPE_CREDITS_LINK,"_blank"); }} style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:8, padding:"10px 22px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>
                                Buy 10 more stems — $2.99
                              </button>
                            </div>
                          ) : !trial.isTrial && file && file.size > 3*1024*1024 ? (
                            <div style={{ fontSize:12, color:"#ffb347", fontFamily:"sans-serif" }}>
                              File is too large. Export a 1-3 minute clip as MP3 (128kbps) then re-upload.
                            </div>
                          ) : (
                            <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                              <button onClick={handleStemSeparation} disabled={trial.isTrial && trial.stemsLeft <= 0}
                                style={{ background: trial.isTrial && trial.stemsLeft <= 0 ? "#2a2040" : "linear-gradient(135deg,#7c3aed,#a78bfa)", color: trial.isTrial && trial.stemsLeft <= 0 ? "#4a5568" : "#fff", border:"none", borderRadius:8, padding:"10px 22px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor: trial.isTrial && trial.stemsLeft <= 0 ? "not-allowed" : "pointer" }}>
                                Separate Stems
                              </button>
                              {!trial.isTrial && !isLifetime && monthlyLeft !== null && monthlyLeft <= 3 && totalLeft > 0 && (
                                <button onClick={function() { window.open(STRIPE_CREDITS_LINK,"_blank"); }} style={{ background:"transparent", border:"1px solid rgba(167,139,250,0.3)", borderRadius:8, padding:"9px 16px", color:"#a78bfa", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                                  + Buy more stems
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                    {stemStatus === "loading" && (
                      <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                        <div style={{ width:22, height:22, border:"2px solid #2a2040", borderTop:"2px solid #a78bfa", borderRadius:"50%", animation:"spin 0.8s linear infinite", flexShrink:0 }} />
                        <div>
                          <div style={{ fontSize:13, color:"#e8eaf0", fontFamily:"sans-serif", fontWeight:600 }}>Separating stems...</div>
                          <div style={{ fontSize:11, color:"#4a5568", fontFamily:"sans-serif", marginTop:3 }}>This takes 1-4 minutes. Stay on this page.</div>
                        </div>
                      </div>
                    )}
                    {stemStatus === "toolarge" && (
                      <div style={{ fontSize:13, color:"#ffb347", fontFamily:"sans-serif" }}>
                        File is too large. Export a 1-3 minute clip as MP3 (128kbps) then re-upload for stems.
                        <button onClick={function(){setStemStatus(null);}} style={{ marginLeft:12, background:"transparent", border:"1px solid #ffb347", borderRadius:6, padding:"4px 12px", color:"#ffb347", fontSize:11, cursor:"pointer", fontFamily:"sans-serif" }}>OK</button>
                      </div>
                    )}
                    {stemStatus === "done" && stemOutputs && (
                      <div>
                        <div style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:700, marginBottom:14 }}>
                          Stems ready — mute any track to practice your part:
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(148px,1fr))", gap:10, marginBottom:14 }}>
                          {["drums","bass","vocals","other"].filter(function(k){ return stemOutputs[k]; }).map(function(k) {
                            var LABELS = { drums:"Drums", bass:"Bass", vocals:"Vocals", other:"Other / Keys" };
                            var ICONS  = { drums:"🥁", bass:"🎸", vocals:"🎤", other:"🎹" };
                            var COLORS = { drums:"#ff5757", bass:"#4a7cff", vocals:"#00e5a0", other:"#ffb347" };
                            var isMuted = !!stemMuted[k];
                            var col = COLORS[k];
                            return (
                              <div key={k} style={{ background: isMuted?"#0a0c14":"rgba(10,12,20,0.9)", border:"1px solid "+(isMuted?"#1a1f2e":col+"44"), borderRadius:12, padding:"14px 12px", opacity: isMuted?0.45:1, transition:"all 0.15s" }}>
                                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                    <span style={{ fontSize:18 }}>{ICONS[k]}</span>
                                    <span style={{ fontSize:12, fontWeight:700, color: isMuted?"#4a5568":col, fontFamily:"sans-serif" }}>{LABELS[k]}</span>
                                  </div>
                                  <a href={stemOutputs[k]} download={k+".mp3"} target="_blank" rel="noopener noreferrer"
                                    onClick={function(e){e.stopPropagation();}}
                                    title={"Download "+LABELS[k]}
                                    style={{ fontSize:14, color:"#2a3040", textDecoration:"none", lineHeight:1 }}>
                                    ↓
                                  </a>
                                </div>
                                <button onClick={function(){handleStemMute(k);}}
                                  style={{ width:"100%", border:"1px solid "+(isMuted?"#2a3040":col+"55"), borderRadius:7, padding:"8px 6px", fontSize:11, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", background: isMuted?"transparent":col+"18", color: isMuted?"#4a5568":col, transition:"all 0.15s", letterSpacing:0.5 }}>
                                  {isMuted ? "MUTED — tap to unmute" : "MUTE"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        {/* Click / Metronome card */}
                        <div style={{ background: clickMuted?"#0a0c14":"rgba(10,12,20,0.9)", border:"1px solid "+(!clickMuted?"#4a7cff44":"#1a1f2e"), borderRadius:12, padding:"14px 12px", opacity: clickMuted?0.45:1, transition:"all 0.15s" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                              <span style={{ fontSize:18 }}>🎯</span>
                              <span style={{ fontSize:12, fontWeight:700, color: clickMuted?"#4a5568":"#4a7cff", fontFamily:"sans-serif" }}>Click</span>
                            </div>
                            <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                              <button onClick={function(){handleClickBpmChange(-1);}}
                                style={{ background:"#1a1f2e", border:"none", borderRadius:4, width:22, height:22, color:"#6b7280", fontSize:14, cursor:"pointer", lineHeight:"22px", textAlign:"center", padding:0 }}>-</button>
                              <span style={{ fontSize:11, color:"#e8eaf0", fontFamily:"monospace", fontWeight:700, minWidth:30, textAlign:"center" }}>{clickBpm}</span>
                              <button onClick={function(){handleClickBpmChange(1);}}
                                style={{ background:"#1a1f2e", border:"none", borderRadius:4, width:22, height:22, color:"#6b7280", fontSize:14, cursor:"pointer", lineHeight:"22px", textAlign:"center", padding:0 }}>+</button>
                            </div>
                          </div>
                          <div style={{ fontSize:9, color:"#2a3040", fontFamily:"sans-serif", marginBottom:8, textAlign:"center" }}>BPM — beat 1 accented</div>
                          <button onClick={handleClickMute}
                            style={{ width:"100%", border:"1px solid "+(clickMuted?"#2a3040":"#4a7cff55"), borderRadius:7, padding:"8px 6px", fontSize:11, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", background: clickMuted?"transparent":"#4a7cff18", color: clickMuted?"#4a5568":"#4a7cff", transition:"all 0.15s", letterSpacing:0.5 }}>
                            {clickMuted ? "MUTED — tap to enable" : "CLICK ON"}
                          </button>
                        </div>

                        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                          <button onClick={handleStemPlayPause}
                            style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:8, padding:"10px 22px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", minWidth:108 }}>
                            {stemPlaying ? "⏸  Pause" : "▶  Play All"}
                          </button>
                          {stemPlaying && (
                            <button onClick={handleStemStop}
                              style={{ background:"transparent", border:"1px solid #2a2040", borderRadius:8, padding:"10px 16px", fontSize:13, fontFamily:"sans-serif", color:"#6b7280", cursor:"pointer" }}>
                              ■  Stop
                            </button>
                          )}
                          <button onClick={function(){handleStemStop();setStemStatus(null);setStemOutputs(null);setStemMuted({drums:false,bass:false,vocals:false,other:false});}}
                            style={{ background:"transparent", border:"1px solid #1a1f2e", borderRadius:6, padding:"5px 12px", color:"#4a5568", fontSize:11, cursor:"pointer", fontFamily:"sans-serif", marginLeft:"auto" }}>
                            Separate Another
                          </button>
                        </div>
                        <div style={{ fontSize:11, color:"#2a3040", fontFamily:"sans-serif", marginTop:10 }}>
                          Tip: mute your own instrument and play along with the rest of the band.
                        </div>
                      </div>
                    )}
                    {stemStatus === "error" && (
                      <div style={{ fontSize:13, color:"#ff5757", fontFamily:"sans-serif" }}>
                        {stemError || "Could not separate stems. Try again."}
                        <button onClick={function(){setStemStatus(null);setStemError("");}} style={{ marginLeft:12, background:"transparent", border:"1px solid #ff5757", borderRadius:6, padding:"4px 12px", color:"#ff5757", fontSize:11, cursor:"pointer", fontFamily:"sans-serif" }}>Try Again</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"18px", marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:"#e8eaf0", fontFamily:"sans-serif", marginBottom:4 }}>🔒 Stem Separation</div>
                        <div style={{ fontSize:12, color:"#6b7280", fontFamily:"sans-serif" }}>Pro: split any recording into drums, bass, vocals, and instruments.</div>
                      </div>
                      <button onClick={onUnlockClick} style={{ background:"linear-gradient(135deg,#7c3aed,#a78bfa)", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:12, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>Unlock Pro</button>
                    </div>
                  </div>
                )}
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
    { icon:"📊", text:"Mix Score 0-100 - track improvement every Sunday" },
    { icon:"📄", text:"Full PDF analysis report - download and print" },
    { icon:"🔁", text:"Unlimited uploads - analyze every rehearsal" },
    { icon:"🎛", text:"Full cheat sheets - all 11 instruments, all sections" },
    { icon:"📈", text:"Session history - see your progress over time" },
    { icon:"🤖", text:"AI Chat assistant - ask anything about your mix" },
    { icon:"📧", text:"Email your report to yourself or your team" },
    { icon:"🎙", text:"Studio mode + Church mode included" },
    { icon:"🆕", text:"All future features - you get them first" },
  ];
  var TEAM = [
    { icon:"👥", text:"Up to 5 users under one subscription" },
    { icon:"📊", text:"Shared Mix Score tracking across the team" },
    { icon:"🎛", text:"Full cheat sheets for all 11 instruments" },
    { icon:"🤖", text:"AI Chat for all team members" },
    { icon:"📄", text:"Unlimited PDF reports" },
    { icon:"🏛", text:"Perfect for full church AV teams" },
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
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 32px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>Go Analyze a Mix</button>
              <a href={STRIPE_PORTAL_LINK} target="_blank" rel="noopener noreferrer"
                style={{ background:"transparent", color:"#6b7280", border:"1px solid #1a1f2e", borderRadius:10, padding:"13px 24px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer", textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
                Manage / Cancel Subscription
              </a>
            </div>
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
                Start 7-Day Free Trial
              </button>
              <button onClick={function() { window.open(STRIPE_PAYMENT_LINK_NOTRIAL,"_blank"); }} style={{ width:"100%", marginTop:8, background:"transparent", border:"1px solid rgba(0,229,160,0.2)", borderRadius:12, padding:"11px", color:"#00e5a0", fontSize:13, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                Skip trial — pay ${price} today
              </button>
              <button onClick={onUnlockClick} style={{ width:"100%", marginTop:8, background:"transparent", border:"1px solid #1a1f2e", borderRadius:12, padding:"11px", color:"#4a5568", fontSize:12, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>
                Already paid? Enter access code
              </button>
            </div>
            {/* Team Plan */}
            <div style={{ background:"linear-gradient(160deg,rgba(74,124,255,0.07),rgba(74,124,255,0.02))", border:"1.5px solid rgba(74,124,255,0.3)", borderRadius:20, padding:"30px 26px", position:"relative" }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#4a7cff", fontFamily:"sans-serif", marginBottom:8 }}>Team</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, marginBottom:4 }}>
                <span style={{ fontSize:42, fontWeight:900, color:"#fff", letterSpacing:-2 }}>$29.99</span>
                <span style={{ fontSize:13, color:"#4a5568", fontFamily:"sans-serif" }}>CAD / mo</span>
              </div>
              <div style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginBottom:4 }}>Up to 5 users</div>
              <div style={{ height:1, background:"rgba(74,124,255,0.15)", margin:"18px 0" }} />
              {TEAM.map(function(f,i) {
                return <div key={i} style={{ display:"flex", gap:10, marginBottom:11, alignItems:"flex-start" }}><span style={{ fontSize:13 }}>{f.icon}</span><span style={{ fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif", lineHeight:1.5 }}>{f.text}</span></div>;
              })}
              <button onClick={function() { window.open(STRIPE_TEAM_LINK,"_blank"); }}
                style={{ width:"100%", marginTop:24, background:"linear-gradient(135deg,#4a7cff,#7c3aed)", border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>
                Subscribe - $29.99 CAD/mo
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

function SuccessPage({ navigate, isPro, unlockPro }) {
  var params = new URLSearchParams(window.location.search);
  var sessionId = (params.get("session_id") || "").replace(/\s/g, "");
  var pageType = params.get("type") || "pro"; // "pro" or "credits"
  var codeState = useState(""); var code = codeState[0]; var setCode = codeState[1];
  var statusState = useState(sessionId ? "loading" : "manual"); var codeStatus = statusState[0]; var setCsStatus = statusState[1];
  var copiedState = useState(false); var copied = copiedState[0]; var setCopied = copiedState[1];
  var activatedState = useState(false); var activated = activatedState[0]; var setActivated = activatedState[1];
  var creditsAddedState = useState(0); var creditsAdded = creditsAddedState[0]; var setCreditsAdded = creditsAddedState[1];

  useEffect(function() {
    if (!sessionId) return;
    var attempts = 0;
    var maxAttempts = 20;
    var interval = null;

    var tryFetch = async function() {
      attempts++;
      try {
        if (pageType === "credits") {
          // Credits purchase flow
          var cr = await fetch("/api/add-stems?session_id=" + encodeURIComponent(sessionId) + "&deviceId=" + encodeURIComponent(getDeviceId()));
          var cd = await cr.json();
          if (cr.ok && cd.ok) {
            clearInterval(interval);
            setCreditsAdded(cd.credits_added || 10);
            setCsStatus("done");
            return;
          }
        } else {
          // Pro activation flow
          var resp = await fetch("/api/generate-code?session_id=" + encodeURIComponent(sessionId));
          var data = await resp.json();
          if (resp.ok && data.code) {
            clearInterval(interval);
            setCode(data.code);
            try {
              var actResp = await fetch("/api/activate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: data.code, deviceId: getDeviceId(), isTrial: data.isTrial !== false }),
              });
              var actData = await actResp.json();
              if (actResp.ok && actData.ok) {
                try {
                  localStorage.setItem("mca_pro_v2", JSON.stringify({ activated:true, lifetime:false, deviceId:getDeviceId(), ts: data.isTrial !== false ? Date.now() : 0 }));
                } catch(e) {}
                setActivated(true);
              }
            } catch(e) {}
            setCsStatus("done");
            return;
          }
        }
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setCsStatus("timeout");
        }
      } catch(e) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setCsStatus("timeout");
        }
      }
    };

    tryFetch();
    interval = setInterval(tryFetch, 3000);
    return function() { clearInterval(interval); };
  }, [sessionId]);

  var handleCopy = function() {
    try { navigator.clipboard.writeText(code); } catch(e) {}
    setCopied(true);
    setTimeout(function() { setCopied(false); }, 2000);
  };

  return (
    <div style={{ background:"#07090f", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center", maxWidth:520 }}>
        <div style={{ fontSize:48, marginBottom:24 }}>{codeStatus === "done" ? "🎉" : codeStatus === "timeout" ? "📧" : "🎉"}</div>
        <h1 style={{ fontSize:"clamp(26px,4vw,40px)", fontWeight:900, margin:"0 0 14px", letterSpacing:-1.5, color:"#fff" }}>Payment Successful!</h1>
        <p style={{ fontSize:15, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.7, marginBottom:28 }}>Thank you for subscribing to MixCheck AI Pro.</p>

        {/* Loading state */}
        {codeStatus === "loading" && (
          <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"32px 24px", marginBottom:28 }}>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", marginBottom:16 }}>Generating your access code...</div>
            <div style={{ width:36, height:36, border:"3px solid #1a1f2e", borderTop:"3px solid #00e5a0", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto" }} />
          </div>
        )}

        {/* Credits added */}
        {codeStatus === "done" && pageType === "credits" && (
          <div style={{ background:"rgba(167,139,250,0.08)", border:"2px solid rgba(167,139,250,0.4)", borderRadius:14, padding:"28px 24px", marginBottom:28, textAlign:"center" }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:900, color:"#a78bfa", fontFamily:"sans-serif", marginBottom:8 }}>{creditsAdded} Stem Credits Added!</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif" }}>Your credits never expire. Use them anytime in the Analyze page.</div>
          </div>
        )}

        {/* Pro code ready */}
        {codeStatus === "done" && pageType !== "credits" && (
          <div style={{ marginBottom:28 }}>
            {activated && (
              <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.3)", borderRadius:14, padding:"14px 20px", marginBottom:16 }}>
                <div style={{ fontSize:13, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif" }}>Pro Activated on This Device!</div>
              </div>
            )}
            <div style={{ background:"#0d1017", border:"2px solid #00e5a0", borderRadius:14, padding:"28px 24px" }}>
              <div style={{ fontSize:10, letterSpacing:3, color:"#6b7280", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>YOUR ACCESS CODE</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#00e5a0", letterSpacing:4, fontFamily:"monospace", marginBottom:20 }}>{code}</div>
              <button onClick={handleCopy} style={{ background: copied ? "#00c080" : "#00e5a0", color:"#07090f", border:"none", borderRadius:8, padding:"10px 28px", fontSize:13, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer", transition:"background 0.2s" }}>
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <div style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif", marginTop:14, lineHeight:1.5 }}>
                Code also sent to your email. Save it — you'll need it to activate on other devices.
              </div>
            </div>
          </div>
        )}

        {/* Timeout — email fallback */}
        {codeStatus === "timeout" && (
          <div style={{ background:"#0d1017", border:"1px solid #ffb347", borderRadius:14, padding:"24px", marginBottom:28 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#ffb347", fontFamily:"sans-serif", marginBottom:8 }}>Check Your Email</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:16 }}>Your code is on its way. Check your inbox and spam folder. Usually arrives within 1 minute.</div>
            <div style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>Still nothing? Email <a href="mailto:hello@mixcheckai.com" style={{ color:"#00e5a0", textDecoration:"none" }}>hello@mixcheckai.com</a></div>
          </div>
        )}

        {/* Manual — no session_id in URL */}
        {codeStatus === "manual" && !isPro && (
          <div style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"24px", marginBottom:28 }}>
            <div style={{ fontSize:10, letterSpacing:3, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:12 }}>NEXT STEP</div>
            <div style={{ fontSize:14, color:"#e8eaf0", fontFamily:"sans-serif", fontWeight:600, marginBottom:8 }}>Enter your Pro access code</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif", lineHeight:1.6, marginBottom:20 }}>Your access code was sent to your email. Check inbox or spam folder.</div>
            <div style={{ fontSize:12, color:"#4a5568", fontFamily:"sans-serif" }}>No email? Contact hello@mixcheckai.com</div>
          </div>
        )}

        {codeStatus === "manual" && isPro && (
          <div style={{ background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.3)", borderRadius:14, padding:"20px", marginBottom:28 }}>
            <div style={{ fontSize:14, fontWeight:700, color:"#00e5a0", fontFamily:"sans-serif", marginBottom:4 }}>Pro is Active!</div>
            <div style={{ fontSize:13, color:"#6b7280", fontFamily:"sans-serif" }}>You have full access to all Pro features.</div>
          </div>
        )}

        <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Start Analyzing</button>
          <button onClick={function() { navigate("home"); }} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Go Home</button>
          <a href={STRIPE_PORTAL_LINK} target="_blank" rel="noopener noreferrer"
            style={{ background:"transparent", color:"#4a5568", border:"1px solid #1a1f2e", borderRadius:10, padding:"13px 24px", fontSize:13, fontFamily:"sans-serif", fontWeight:600, textDecoration:"none", display:"inline-flex", alignItems:"center" }}>
            Manage Subscription
          </a>
        </div>
      </div>
    </div>
  );
}

function AboutPage({ navigate, onUnlockClick, isPro }) {
  var STATS = [
    { num:"25+", label:"Mixers Supported" },
    { num:"11", label:"Instrument Cheat Sheets" },
    { num:"-16", label:"LUFS Target for Streams" },
    { num:"2hrs", label:"Max Recording Length" },
  ];
  var VALUES = [
    { icon:"🎛", title:"Built by a volunteer, for volunteers", body:"MixCheck AI was not built in a corporate office. It was built after a Sunday service by a church sound tech who was tired of guessing why the livestream sounded different from the room. Every feature exists because a real volunteer needed it." },
    { icon:"🙏", title:"The church deserves great audio", body:"Online worship is ministry. The family watching from home because they are sick, the diaspora tuning in from across the world, the person who found your church on YouTube at 2am - they all deserve to hear clearly. Great sound is not a luxury. It is hospitality." },
    { icon:"🌍", title:"No audio degree required", body:"Most church sound engineers are volunteers with full-time jobs, families, and maybe two hours of training. MixCheck AI speaks plain English. No jargon. No assumptions. If you can tap a button, you can improve your mix." },
    { icon:"💡", title:"Real measurements, real advice", body:"We analyze your actual recording. Not a simulation. Not generic tips that apply to everyone and help no one. Your file. Your mix. Your measurements. Specific recommendations for your situation." },
  ];
  return (
    <div style={{ background:"#07090f", minHeight:"100vh", color:"#e8eaf0", fontFamily:"Georgia,serif" }}>

      {/* Hero */}
      <section style={{ paddingTop:140, paddingBottom:80, paddingLeft:20, paddingRight:20, textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"20%", left:"50%", transform:"translateX(-50%)", width:700, height:500, background:"radial-gradient(ellipse,rgba(0,229,160,0.06) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(0,229,160,0.08)", border:"1px solid rgba(0,229,160,0.2)", borderRadius:999, padding:"6px 18px", marginBottom:28 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:"#00e5a0" }} />
          <span style={{ fontSize:12, color:"#00e5a0", fontFamily:"sans-serif", fontWeight:600, letterSpacing:1 }}>Our Story</span>
        </div>
        <h1 style={{ fontSize:"clamp(30px,6vw,62px)", fontWeight:900, lineHeight:1.05, margin:"0 0 24px", color:"#fff", maxWidth:720, marginLeft:"auto", marginRight:"auto", letterSpacing:-2 }}>
          Built by a church volunteer.<br /><span style={{ color:"#00e5a0", fontStyle:"italic" }}>For every church volunteer.</span>
        </h1>
        <p style={{ fontSize:"clamp(14px,2vw,18px)", color:"#6b7280", maxWidth:560, margin:"0 auto 48px", lineHeight:1.8, fontFamily:"sans-serif" }}>
          This tool exists because one Sunday, the room sounded amazing and the livestream sounded terrible. We could not figure out why. So we built the answer.
        </p>
        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:14, maxWidth:680, margin:"0 auto" }}>
          {STATS.map(function(s, i) {
            return (
              <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"20px 16px" }}>
                <div style={{ fontSize:32, fontWeight:900, color:"#00e5a0", letterSpacing:-1, fontFamily:"sans-serif" }}>{s.num}</div>
                <div style={{ fontSize:11, color:"#6b7280", fontFamily:"sans-serif", marginTop:4 }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* The Origin Story */}
      <section style={{ padding:"80px 20px", background:"#060810" }}>
        <div style={{ maxWidth:720, margin:"0 auto" }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:20 }}>THE ORIGIN STORY</div>
          <div style={{ background:"#0d1017", border:"1px solid rgba(0,229,160,0.15)", borderRadius:20, padding:"36px 32px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, background:"radial-gradient(circle,rgba(0,229,160,0.06),transparent 70%)", pointerEvents:"none" }} />

            <div style={{ fontSize:48, marginBottom:20 }}>🎛</div>
            <p style={{ fontSize:16, color:"#c8d0e0", lineHeight:1.9, marginBottom:20, fontFamily:"sans-serif" }}>
              It was a regular Sunday. The worship band was on fire. The room was full of energy. People were singing loudly. The sound was hitting right - the kind of mix that makes you close your eyes and just be present.
            </p>
            <p style={{ fontSize:16, color:"#c8d0e0", lineHeight:1.9, marginBottom:20, fontFamily:"sans-serif" }}>
              Then someone from home messaged: <span style={{ color:"#fff", fontStyle:"italic" }}>"We can barely hear anything on the stream."</span>
            </p>
            <p style={{ fontSize:16, color:"#c8d0e0", lineHeight:1.9, marginBottom:20, fontFamily:"sans-serif" }}>
              That is the moment MixCheck AI was born. Not in a startup incubator. Not in a boardroom. At a mixing console, after service, wondering why the livestream and the room sound so different - and realizing there was no simple tool to measure it, explain it, and fix it.
            </p>
            <p style={{ fontSize:16, color:"#c8d0e0", lineHeight:1.9, marginBottom:28, fontFamily:"sans-serif" }}>
              We are sound tech volunteers. We work Monday to Friday, serve on Sundays, and learn as we go. We built MixCheck AI because we needed it ourselves - and because we knew thousands of volunteers just like us needed it too.
            </p>
            <div style={{ borderLeft:"3px solid #00e5a0", paddingLeft:20 }}>
              <p style={{ fontSize:18, color:"#fff", lineHeight:1.7, fontStyle:"italic", fontFamily:"Georgia,serif" }}>
                "Every church deserves to sound great online. Not just the big ones with professional engineers and expensive gear. Every church. Every volunteer. Every Sunday."
              </p>
              <p style={{ fontSize:13, color:"#4a5568", marginTop:12, fontFamily:"sans-serif" }}>- The MixCheck AI Team</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding:"80px 20px" }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:52 }}>
            <div style={{ fontSize:10, letterSpacing:4, color:"#4a7cff", fontFamily:"monospace", fontWeight:700, marginBottom:14 }}>WHAT WE BELIEVE</div>
            <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, margin:0, letterSpacing:-1.5, color:"#fff" }}>Why we built this.</h2>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16 }}>
            {VALUES.map(function(v, i) {
              return (
                <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:16, padding:"28px 24px" }}>
                  <div style={{ fontSize:32, marginBottom:16 }}>{v.icon}</div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:12, lineHeight:1.3, fontFamily:"sans-serif" }}>{v.title}</h3>
                  <p style={{ fontSize:13, color:"#6b7280", lineHeight:1.8, margin:0, fontFamily:"sans-serif" }}>{v.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Encouragement section */}
      <section style={{ padding:"80px 20px", background:"#060810" }}>
        <div style={{ maxWidth:720, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#ffb347", fontFamily:"monospace", fontWeight:700, marginBottom:20 }}>TO EVERY SOUND VOLUNTEER</div>
          <h2 style={{ fontSize:"clamp(24px,4vw,40px)", fontWeight:900, letterSpacing:-1.5, margin:"0 0 32px", color:"#fff", lineHeight:1.1 }}>
            You are doing something that matters.
          </h2>

          <div style={{ display:"flex", flexDirection:"column", gap:20, textAlign:"left", marginBottom:48 }}>
            {[
              { icon:"🌟", text:"You show up early when everyone else is still asleep. You set up cables, check gains, ring out monitors, and solve problems nobody else even notices. You do it for free. You do it faithfully. That is not small - that is extraordinary." },
              { icon:"💪", text:"You did not go to audio school. You learned by doing, by watching YouTube at midnight, by trial and error on Sunday mornings. That makes you resourceful. That makes you adaptable. That makes you exactly the kind of engineer who can handle anything." },
              { icon:"🎵", text:"The worship that happens in that room is beautiful. But the family watching from a care home, the person streaming from another country, the young adult who found your church online - they experience that worship through YOU. Through your mix. Through your care. You are extending the ministry beyond four walls." },
              { icon:"🙌", text:"And here is the truth: good sound is not about perfection. It is about faithfulness. Keep learning. Keep improving. Keep showing up. A score of 52 that becomes 78 over three months is not a technical improvement - it is a testimony." },
            ].map(function(item, i) {
              return (
                <div key={i} style={{ display:"flex", gap:16, alignItems:"flex-start", background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:14, padding:"20px 22px" }}>
                  <div style={{ fontSize:24, flexShrink:0 }}>{item.icon}</div>
                  <p style={{ fontSize:14, color:"#c8d0e0", lineHeight:1.8, margin:0, fontFamily:"sans-serif" }}>{item.text}</p>
                </div>
              );
            })}
          </div>

          <div style={{ background:"linear-gradient(135deg,rgba(0,229,160,0.08),rgba(0,229,160,0.02))", border:"1.5px solid rgba(0,229,160,0.25)", borderRadius:20, padding:"36px 28px" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🎚</div>
            <h3 style={{ fontSize:"clamp(20px,3vw,28px)", fontWeight:900, color:"#fff", marginBottom:14, letterSpacing:-1, fontFamily:"sans-serif" }}>
              You are not alone behind that console.
            </h3>
            <p style={{ fontSize:15, color:"#8892a4", lineHeight:1.8, marginBottom:24, fontFamily:"sans-serif", maxWidth:500, marginLeft:"auto", marginRight:"auto" }}>
              MixCheck AI is your tool, your guide, and your backup. Whenever you are not sure - upload the recording, get your score, read the recommendations. We have got you.
            </p>
            <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={function() { navigate("analyze"); }} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:800, cursor:"pointer" }}>Analyze My Mix Free</button>
              <button onClick={function() { navigate("checklist"); }} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1a1f2e", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Sunday Checklist</button>
            </div>
          </div>
        </div>
      </section>

      {/* Community */}
      <section style={{ padding:"80px 20px" }}>
        <div style={{ maxWidth:720, margin:"0 auto", textAlign:"center" }}>
          <div style={{ fontSize:10, letterSpacing:4, color:"#00e5a0", fontFamily:"monospace", fontWeight:700, marginBottom:20 }}>BUILT WITH LOVE</div>
          <h2 style={{ fontSize:"clamp(22px,4vw,36px)", fontWeight:900, color:"#fff", marginBottom:16, letterSpacing:-1, fontFamily:"sans-serif" }}>
            From one volunteer to another.
          </h2>
          <p style={{ fontSize:15, color:"#6b7280", lineHeight:1.8, marginBottom:32, fontFamily:"sans-serif" }}>
            MixCheck AI is built and maintained by a Filipino-Canadian church sound volunteer working 3 hours a day after work. Every feature you use was designed in real church environments, tested on real recordings, and refined based on real feedback from volunteers like you.
          </p>
          <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap:"wrap", marginBottom:40 }}>
            {["🇨🇦 Canadian built","🇵🇭 Filipino heart","⛪ Church focused","🎛 Volunteer tested"].map(function(t, i) {
              return (
                <div key={i} style={{ background:"#0d1017", border:"1px solid #1a1f2e", borderRadius:99, padding:"8px 18px", fontSize:13, color:"#c8d0e0", fontFamily:"sans-serif" }}>{t}</div>
              );
            })}
          </div>
          <p style={{ fontSize:14, color:"#4a5568", fontFamily:"sans-serif", lineHeight:1.7 }}>
            Questions, feedback, or just want to say hi?<br />
            <a href="mailto:hello@mixcheckai.com" style={{ color:"#00e5a0", textDecoration:"none", fontWeight:700 }}>hello@mixcheckai.com</a>
          </p>
        </div>
      </section>

    </div>
  );
}

export default function App() {
  var routerResult = useRouter();
  var page = routerResult.page; var navigate = routerResult.navigate;
  var proResult = usePro();
  var isPro = proResult.isPro; var unlockPro = proResult.unlockPro;
  var unlockState = useState(false); var showUnlock = unlockState[0]; var setShowUnlock = unlockState[1];
  var modeState = useState("church"); var appMode = modeState[0]; var setAppMode = modeState[1];

  var renderPage = function() {
    var props = { navigate:navigate, isPro:isPro, onUnlockClick:function() { setShowUnlock(true); }, appMode:appMode, unlockPro:unlockPro };
    if (page === "home")      return React.createElement(HomePage, props);
    if (page === "analyze")   return React.createElement(AnalyzePage, props);
    if (page === "pricing")   return React.createElement(PricingPage, props);
    if (page === "success")   return React.createElement(SuccessPage, props);
    if (page === "history")   return React.createElement(HistoryPage, props);
    if (page === "checklist") return React.createElement(SundayChecklist, props);
    if (page === "chat")      return React.createElement(AIChatPage, Object.assign({}, props));
    if (page === "about")     return React.createElement(AboutPage, props);
    return React.createElement(HomePage, props);
  };

  return (
    <div>
      <Nav navigate={navigate} page={page} isPro={isPro} onUnlockClick={function() { setShowUnlock(true); }} appMode={appMode} setAppMode={setAppMode} />
      {renderPage()}
      {page !== "success" && <Footer navigate={navigate} />}
      {showUnlock && <ProUnlockModal onClose={function() { setShowUnlock(false); }} onUnlock={unlockPro} />}
    </div>
  );
}
