"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { X, Send, Sparkles, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
}

const SUGGESTED_QUESTIONS = [
  "How do I prepare a BOQ?",
  "What is rate analysis?",
  "Tell me about hydropower engineering",
  "How do district rates work?",
];

const QUICK_ACTIONS = [
  { label: "Browse District Rates", href: "/district-rate", icon: FileText },
  { label: "Contact Ganesh", href: "/contact", icon: MessageSquare },
];

const TOPICS = [
  "Civil Engineering",
  "Estimation",
  "BOQ",
  "Rate Analysis",
  "Hydropower",
  "Bridges",
  "Irrigation",
  "Structural Engineering",
  "Highway Engineering",
  "District Rates",
  "Engineering Career",
  "Construction",
];

const INTRO_MESSAGE: Message = {
  id: "intro",
  role: "assistant",
  text:
    "Namaste! I can help answer questions about civil engineering topics — estimation, BOQ, rate analysis, hydropower, bridges, and more. What would you like to know?",
};

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsTyping(true);

    // Build conversation history for the API (exclude the intro message)
    const history = allMessages
      .filter((m) => m.id !== "intro")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.text }));

    const assistantId = crypto.randomUUID();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!response.ok) {
        throw new Error(`API error ${response.status}`);
      }

      const data = await response.json();
      const replyText =
        data.text ??
        "Sorry, I couldn't generate a response. Please try again.";

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", text: replyText },
      ]);
    } catch (err) {
      console.error("AI chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "Maaf garnu, kehi problem bhayo. Kripaya feri prayas garnuhos ya /contact bata directly sampark garnuhos.",
        },
      ]);
    }
  }

  return (
    <div
      className="fixed bottom-24 right-5 sm:right-6 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[min(580px,72vh)] glass-light rounded-3xl shadow-2xl border border-white/40 dark:border-white/10 flex flex-col overflow-hidden animate-erg-scale-in"
      role="dialog"
      aria-modal="true"
      aria-label="AI Assistant chat"
    >
      {/* Header */}
      <div className="relative flex items-start gap-3 p-5 bg-gradient-to-br from-navy-700 via-navy-800 to-navy-950 flex-shrink-0 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient animate-gradient-shift opacity-50 pointer-events-none" />
        <div className="relative w-11 h-11 rounded-full bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-display font-bold text-base">G</span>
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-navy-900 animate-soft-pulse" />
        </div>
        <div className="relative flex-1 min-w-0">
          <p className="text-white font-display font-bold text-base leading-tight">
            Namaste 👋
          </p>
          <p className="text-white/90 text-sm font-medium">I&apos;m Ganesh.</p>
          <p className="text-white/40 text-[11px] mt-0.5">Ask me about civil engineering</p>
        </div>
        <button
          onClick={onClose}
          className="relative p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Topics strip */}
      <div className="flex gap-1.5 px-4 py-3 overflow-x-auto flex-shrink-0 border-b border-gray-100 dark:border-white/5 scrollbar-none">
        {TOPICS.map((topic) => (
          <span
            key={topic}
            className="text-[11px] font-medium text-navy-600 dark:text-blue-300 bg-navy-50 dark:bg-navy-900/40 px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex animate-pop-in",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user"
                  ? "bg-navy-600 text-white rounded-br-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-sm"
              )}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start animate-pop-in">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        {/* Suggested questions + quick actions — only show before user has sent anything */}
        {messages.length === 1 && !isTyping && (
          <div className="pt-2 space-y-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-1">
                Try asking
              </p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex items-center gap-2 w-full text-left px-3.5 py-2.5 text-sm text-navy-700 dark:text-navy-200 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-navy-200 dark:hover:border-navy-700 hover:bg-navy-50/50 dark:hover:bg-navy-900/20 transition-all duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                  {q}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-1">
                Quick actions
              </p>
              <div className="flex gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={onClose}
                    className="flex-1 flex flex-col items-center justify-center gap-1.5 text-center px-3 py-3 text-xs font-medium text-navy-700 dark:text-navy-200 bg-navy-50 dark:bg-navy-900/30 border border-navy-100 dark:border-navy-800 rounded-xl hover:bg-navy-100 dark:hover:bg-navy-900/50 transition-all duration-200"
                  >
                    <action.icon className="w-4 h-4 text-navy-600 dark:text-blue-400" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="focus-glow flex items-center gap-2 p-3 border-t border-gray-100 dark:border-white/5 flex-shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about BOQ, rates, hydropower..."
          className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-sm rounded-xl focus:outline-none transition-all"
          aria-label="Type your question"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="flex items-center justify-center w-10 h-10 bg-navy-600 hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
