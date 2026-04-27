<button onClick={() => navigate("analyze")} style={{ background:"#00e5a0", color:"#07090f", border:"none", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:700, cursor:"pointer" }}>Start Analyzing</button>
          <button onClick={() => navigate("home")} style={{ background:"transparent", color:"#6b7280", border:"1px solid #1e2535", borderRadius:10, padding:"13px 28px", fontSize:14, fontFamily:"sans-serif", fontWeight:600, cursor:"pointer" }}>Go Home</button>
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const { page, navigate } = useRouter();
  const { isPro, unlockPro } = usePro();
  const [showUnlock, setShowUnlock] = useState(false);

  useEffect(() => {
    if (page === "success" && !isPro) setShowUnlock(true);
  }, [page, isPro]);

  const renderPage = () => {
    switch(page) {
      case "home":    return <HomePage navigate={navigate} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />;
      case "analyze": return <AnalyzePage navigate={navigate} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />;
      case "pricing": return <PricingPage navigate={navigate} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />;
      case "success": return <SuccessPage navigate={navigate} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />;
      default:        return <HomePage navigate={navigate} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />;
    }
  };

  return (
    <div>
      <Nav navigate={navigate} page={page} isPro={isPro} onUnlockClick={() => setShowUnlock(true)} />
      {renderPage()}
      {page !== "success" && <Footer navigate={navigate} />}
      {showUnlock && <ProUnlockModal onClose={() => setShowUnlock(false)} onUnlock={unlockPro} />}
    </div>
  );
}
