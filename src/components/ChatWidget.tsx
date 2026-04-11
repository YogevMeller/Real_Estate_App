"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Home } from "lucide-react";
import { chatResponses } from "@/lib/mockData";

interface Message {
  role: "agent" | "user";
  text: string;
  time: string;
}

const SUGGESTED = [
  "יש חניה?",
  "אפשר לפתוח את המטבח?",
  "מה רמת הרעש?",
  "מתי אפשר לבוא?",
  "מה דמי הוועד?",
];

function now() {
  return new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
}

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  for (const item of chatResponses) {
    if (item.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return item.response;
    }
  }
  return "שאלה מעניינת. בהתבסס על הנתונים שיש לי, ממליץ לתאם ביקור עם ירון שיוכל לענות על כך ישירות. הוא מגיב תוך פחות מ-2 שעות בממוצע. רוצה שאבדוק את הזמינות שלו?";
}

export default function ChatWidget({ propertyName }: { propertyName: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "agent",
      text: `שלום! אני הסוכן של ${propertyName}. יש לי גישה מלאה לתוכנית הקומה, פרטי המוכר, נתוני מבנה ומידע על השכונה. במה אוכל לעזור?`,
      time: now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: text.trim(), time: now() }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "agent", text: getResponse(text), time: now() }]);
    }, 900 + Math.random() * 700);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden flex flex-col" style={{ height: "480px" }}>
      {/* Header */}
      <div className="bg-gradient-to-l from-amber to-yellow-400 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Home className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-white font-semibold text-sm">סוכן {propertyName}</div>
          <div className="text-white/80 text-xs">סוכן נכסים AI · מחובר עכשיו</div>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm shrink-0" />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"} fade-in`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "user"
                  ? "bg-navy text-white rounded-bl-sm"
                  : "bg-white text-navy border border-gray-100 shadow-sm rounded-br-sm"
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap" dir="rtl">{msg.text}</p>
              <p className={`text-[10px] mt-1 ${msg.role === "user" ? "text-white/50 text-left" : "text-gray-400 text-right"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-end fade-in">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-br-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-amber rounded-full typing-dot" />
                <div className="w-1.5 h-1.5 bg-amber rounded-full typing-dot" />
                <div className="w-1.5 h-1.5 bg-amber rounded-full typing-dot" />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && (
        <div className="px-3 py-2 border-t border-gray-100 flex gap-1.5 overflow-x-auto">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="shrink-0 text-xs bg-amber-light text-amber-700 border border-amber/20 px-2.5 py-1 rounded-full hover:bg-amber hover:text-white transition-colors font-medium whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-100 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex items-center gap-2">
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-10 h-10 bg-amber hover:bg-amber/90 disabled:opacity-40 rounded-xl flex items-center justify-center transition-all shadow-sm shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="שאל על הנכס..."
            dir="rtl"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-navy placeholder-gray-400 focus:outline-none focus:border-amber focus:ring-1 focus:ring-amber/30 transition-all text-right"
          />
        </form>
      </div>
    </div>
  );
}
