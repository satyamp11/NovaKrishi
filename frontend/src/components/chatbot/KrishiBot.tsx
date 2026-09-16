import { useState, useRef, useEffect } from "react";
import type React from "react";

// ── Types ────────────────────────────────────────────────────────────────

import type { Language } from "../../types";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: number;
}

interface KrishiBotProps {
  language?: Language;
  farmerDistrict?: string;
  farmerState?: string;
  onNavigate?: (tab: string) => void;
}

// Determine API base URL dynamically based on environment (proxy for dev, full URL for prod)
const API_BASE = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'https://novakrishi.onrender.com').replace(/\/$/, '') + '/api'
  : '/api'; // Uses Vite proxy in development

const QUICK_REPLIES: Record<Language, { label: string; value: string }[]> = {
  en: [
    { label: "🌾 Mandi Prices", value: "What are today's mandi prices?" },
    { label: "🦠 Disease Help", value: "My crop has a disease, help me" },
    { label: "🌤️ Weather Risk", value: "What is the weather risk today?" },
    { label: "🚨 Alerts", value: "Are there any disease alerts near me?" },
  ],
  hi: [
    { label: "🌾 मंडी भाव", value: "आज का मंडी भाव क्या है?" },
    { label: "🦠 रोग सहायता", value: "मेरी फसल में बीमारी है, मदद करें" },
    { label: "🌤️ मौसम जोखिम", value: "आज मौसम का जोखिम क्या है?" },
    { label: "🚨 अलर्ट", value: "मेरे पास कोई बीमारी अलर्ट है क्या?" },
  ],
  mr: [
    { label: "🌾 बाजार भाव", value: "आजचे बाजार भाव काय आहेत?" },
    { label: "🦠 रोग मदत", value: "माझ्या पिकाला रोग लागला आहे, मदत करा" },
    { label: "🌤️ हवामान धोका", value: "आजचा हवामान धोका काय आहे?" },
    { label: "🚨 अलर्ट", value: "माझ्या जवळ काही रोग अलर्ट आहेत का?" },
  ],
};

const GREETING: Record<Language, string> = {
  en: "🙏 Namaste! I'm KrishiBot, your farm advisor. Ask me about mandi prices, crop diseases, weather risk, or alerts near you.",
  hi: "🙏 नमस्ते! मैं कृषि बॉट हूँ, आपका खेती सलाहकार। मुझसे मंडी भाव, फसल रोग, मौसम जोखिम, या आस-पास के अलर्ट के बारे में पूछें।",
  mr: "🙏 नमस्कार! मी कृषी बॉट आहे, तुमचा शेती सल्लागार. मला बाजार भाव, पीक रोग, हवामान धोका किंवा तुमच्या जवळील अलर्ट बद्दल विचारा.",
};

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Component ────────────────────────────────────────────────────────────

export function KrishiBot({
  language = "en",
  farmerDistrict,
  farmerState,
  onNavigate,
}: KrishiBotProps) {
  const [lang, setLang] = useState<Language>(language);
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greet",
      sender: "bot",
      text: GREETING[language],
      timestamp: Date.now(),
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, typing]);

  // Sync greeting language when lang toggles
  useEffect(() => {
    setMessages([
      { id: "greet", sender: "bot", text: GREETING[lang], timestamp: Date.now() },
    ]);
  }, [lang]);

  function toggleLanguage() {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  }

  // ── Multilingual Tab Link Matching ──────────────────────────────────────
  // Each entry: list of keyword variants (English + Hindi) → target tab
  const TAB_LINK_GROUPS: Array<{ keywords: string[]; targetTab: string }> = [
    {
      keywords: [
        "Alerts tab", "Open the Alerts tab", "Alerts Tab",
        "अलर्ट टैब", "अलर्ट्स टैब", "अलर्ट टैब खोलें", "Alerts टैब",
        "alert tab", "alerts section",
      ],
      targetTab: "alerts",
    },
    {
      keywords: [
        "Marketplace", "marketplace", "Market place",
        "मार्केटप्लेस", "बाज़ार", "हमारे Marketplace",
      ],
      targetTab: "marketplace",
    },
    {
      keywords: [
        "Mandi Prices", "mandi prices", "Market Prices", "market prices",
        "Price Insights", "Mandi Prices tab",
        "मंडी भाव", "मंडी price", "मंडी की कीमत",
      ],
      targetTab: "price-insights",
    },
    {
      keywords: [
        "AI Insights", "AI Demand", "AI demand insights",
        "एआई इनसाइट्स", "AI मांग",
      ],
      targetTab: "ai-demand",
    },
    {
      keywords: [
        "Scan tab", "Scan", "crop scan", "disease scan",
        "स्कैन टैब", "फसल स्कैन",
      ],
      targetTab: "scan",
    },
  ];

  function renderMessageWithLinks(text: string) {
    // Build a flat list of {keyword, targetTab} sorted longest first (greedy match)
    type KwEntry = { kw: string; targetTab: string };
    const flat: KwEntry[] = [];
    for (const group of TAB_LINK_GROUPS) {
      for (const kw of group.keywords) {
        flat.push({ kw, targetTab: group.targetTab });
      }
    }
    flat.sort((a, b) => b.kw.length - a.kw.length);

    // Escape each keyword for regex
    const escaped = flat.map(({ kw }) => kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`(${escaped.join("|")})`, "gi");

    const parts = text.split(regex);
    return parts.map((part, i) => {
      // Case-insensitive lookup across all keyword variants
      const entry = flat.find((e) => e.kw.toLowerCase() === part.toLowerCase());
      if (entry) {
        return (
          <button
            key={i}
            onClick={() => {
              if (onNavigate) {
                onNavigate(entry.targetTab);
              } else {
                console.warn(`[KrishiBot] onNavigate not available. Cannot navigate to: ${entry.targetTab}`);
              }
            }}
            className="underline decoration-emerald-500/40 text-emerald-700 font-bold hover:text-emerald-900 hover:bg-emerald-50 rounded transition-colors bg-transparent border-none px-0.5 cursor-pointer relative top-[1px]"
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }


  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          language: lang,
          state: farmerState,
          district: farmerDistrict,
        }),
      });

      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();

      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text:
          data.reply ??
          (lang === "hi"
            ? "माफ़ करें, कुछ गलत हो गया।"
            : "Sorry, something went wrong."),
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errMsg: ChatMessage = {
        id: `e-${Date.now()}`,
        sender: "bot",
        text:
          lang === "hi"
            ? "अभी सर्वर से जुड़ नहीं पा रहा हूँ। कृपया थोड़ी देर बाद कोशिश करें।"
            : "I couldn't reach the server right now. Please try again shortly.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setTyping(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  async function handleLocationClick() {
    if (!navigator.geolocation) {
      alert(lang === "hi" ? "स्थान समर्थित नहीं है (Location not supported)" : "Geolocation is not supported");
      return;
    }

    setTyping(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`);
          const data = await res.json();
          let district = data.address?.state_district || data.address?.city || data.address?.town || data.address?.county || "Delhi";
          district = district.replace(' District', '');
          
          setTyping(false);
          const msg = lang === "hi" ? `क्या ${district} में कोई अलर्ट है?` : `Are there any alerts in ${district}?`;
          sendMessage(msg);
        } catch (e) {
          setTyping(false);
          alert(lang === "hi" ? "स्थान प्राप्त करने में विफल" : "Failed to fetch location");
        }
      },
      (err) => {
        setTyping(false);
        alert(lang === "hi" ? "स्थान अनुमति अस्वीकृत (Location denied)" : "Location permission denied");
      }
    );
  }

  // ── Floating button (closed state) ────────────────────────────────────
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open KrishiBot chat"
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: "#1b4332" }}
      >
        <span className="text-2xl">💬</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col overflow-hidden rounded-2xl shadow-2xl transition-all duration-300"
      style={{
        width: 380,
        height: minimized ? 56 : 520,
        fontFamily: "'Inter', sans-serif",
        backgroundColor: "#ffffff",
        border: "1px solid #d1fae5",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        style={{ backgroundColor: "#1b4332" }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">🌾</span>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">
              KrishiBot · कृषि बॉट
            </p>
            {!minimized && (
              <p className="text-[11px] leading-tight" style={{ color: "#95d5b2" }}>
                {lang === "hi" ? "● ऑनलाइन" : "● Online"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleLanguage}
            className="rounded-md px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-white/10"
            style={{ backgroundColor: "#2d6a4f" }}
            title="Toggle language / भाषा बदलें"
          >
            {lang === "en" ? "हि" : "EN"}
          </button>
          <button
            onClick={() => setMinimized((m) => !m)}
            aria-label="Minimize chat"
            className="rounded-md px-2 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10"
          >
            {minimized ? "▲" : "▼"}
          </button>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="rounded-md px-2 py-1 text-xs text-white/80 hover:text-white hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* ── Messages ─────────────────────────────────────────────── */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
            style={{ backgroundColor: "#f8faf9" }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender === "bot" && (
                  <div className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                    style={{ backgroundColor: "#1b4332" }}>
                    🌾
                  </div>
                )}
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                    m.sender === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                  }`}
                  style={
                    m.sender === "user"
                      ? { backgroundColor: "#1b4332", color: "#ffffff" }
                      : { backgroundColor: "#dcfce7", color: "#14532d" }
                  }
                >
                  <div className="whitespace-pre-wrap">{m.sender === "bot" ? renderMessageWithLinks(m.text) : m.text}</div>
                  <p
                    className={`mt-1 text-[10px] ${
                      m.sender === "user"
                        ? "text-white/60 text-right"
                        : "text-emerald-700/50"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                  </p>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div
                  className="mr-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm"
                  style={{ backgroundColor: "#1b4332" }}
                >
                  🌾
                </div>
                <div
                  className="flex items-center gap-1 rounded-2xl rounded-bl-sm px-4 py-3"
                  style={{ backgroundColor: "#dcfce7" }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 animate-bounce rounded-full"
                      style={{
                        backgroundColor: "#2d6a4f",
                        animationDelay: `${i * 0.18}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Quick replies ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-1.5 border-t border-gray-100 px-3 py-2 shrink-0">
            {QUICK_REPLIES[lang].map((q) => (
              <button
                key={q.label}
                onClick={() => sendMessage(q.value)}
                className="rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-emerald-50 active:bg-emerald-100"
                style={{ borderColor: "#2d6a4f", color: "#2d6a4f" }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* ── Input ───────────────────────────────────────────────── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-100 p-2 shrink-0"
          >
            <button
              type="button"
              onClick={handleLocationClick}
              disabled={typing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg hover:bg-gray-100 transition-colors"
              title={lang === "hi" ? "मेरा स्थान उपयोग करें" : "Use my location"}
            >
              📍
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                lang === "hi" ? "अपना सवाल लिखें..." : "Type your question..."
              }
              className="flex-1 rounded-full border border-gray-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
            />
            <button
              type="submit"
              disabled={!input.trim() || typing}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: "#1b4332" }}
              aria-label="Send message"
            >
              ➤
            </button>
          </form>
        </>
      )}
    </div>
  );
}
