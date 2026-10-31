"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Send,
  FileText,
  MessageSquare,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  BadgeCheck,
  Heart,
  ThumbsUp,
  Lightbulb,
  Rocket,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { chatSound } from "./chat-sound";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  reactions?: Record<string, number>;
  userReaction?: string | null;
  autoLoveReact?: boolean;
}

const REACTION_OPTIONS = [
  { id: "like", label: "Helpful", icon: ThumbsUp, color: "text-blue-500" },
  { id: "love", label: "Love", icon: Heart, color: "text-rose-500 fill-rose-500" },
  { id: "idea", label: "Insightful", icon: Lightbulb, color: "text-amber-500 fill-amber-500" },
  { id: "rocket", label: "Brilliant", icon: Rocket, color: "text-indigo-500" },
];

const DYNAMIC_PROMPTS = [
  "Ask Anything You Want...",
  "Ask about Nepal District Rates...",
  "Ask about BOQ Preparation & Estimation...",
  "Ask about Rate Analysis & DoR Norms...",
  "Ask about Nepal Building Code (NBC)...",
  "Ask about Hydropower & Bridge Engineering...",
];

const SUGGESTED_QUESTIONS = [
  "How do I prepare a BOQ for building work?",
  "Explain rate analysis according to DoR norms",
  "How do district rates work in Nepal?",
  "What is the scope of hydropower engineering?",
];

const QUICK_ACTIONS = [
  { label: "District Rates", href: "/district-rate", icon: FileText },
  { label: "Contact Er. Ganesh", href: "/contact", icon: MessageSquare },
];

const TOPICS = [
  "Civil Engineering",
  "Estimation & BOQ",
  "Rate Analysis",
  "Nepal District Rates",
  "Hydropower",
  "Bridge Engineering",
  "DoR Norms & NBC",
  "Career Guidance",
];

const INTRO_MESSAGE: Message = {
  id: "intro",
  role: "assistant",
  text:
    "Namaste! Welcome to Er G platform. I am Er. Ganesh Chapagain, Registered Civil Engineer.\n\nAsk me anything about civil engineering in Nepal — BOQ preparation, rate analysis, hydropower, district rates, or career guidance. How can I help you today?",
  reactions: { like: 4, love: 3 },
  userReaction: null,
};

// --- LaTeX Stripping ---

function cleanLatex(raw: string): string {
  return raw
    // Remove display math delimiters \[ ... \]
    .replace(/\\\[/g, "").replace(/\\\]/g, "")
    // Remove inline math delimiters \( ... \)
    .replace(/\\\(/g, "").replace(/\\\)/g, "")
    // Remove \begin{...} and \end{...}
    .replace(/\\begin\{[a-z*]+\}/gi, "").replace(/\\end\{[a-z*]+\}/gi, "")
    // \text{X} → X
    .replace(/\\text\{([^}]+)\}/g, "$1")
    // \frac{a}{b} → (a) / (b)
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1) / ($2)")
    // \times → ×
    .replace(/\\times/g, "×")
    // \cdot → ·
    .replace(/\\cdot/g, "·")
    // \% → %
    .replace(/\\%/g, "%")
    // \\ → newline (aligned environment line breaks)
    .replace(/\\\\/g, "\n")
    // &= → = and stray & alignment chars
    .replace(/&=/g, "=").replace(/&/g, "")
    // Remove remaining \command sequences (e.g. \approx, \leq, \geq, \alpha …)
    .replace(/\\[a-zA-Z]+/g, "")
    // Collapse 3+ blank lines to 2
    .replace(/\n{3,}/g, "\n\n");
}

// --- Table & Text Parsing Helpers ---

function splitTableRow(line: string): string[] {
  let trimmed = line.trim();
  if (trimmed.startsWith("|")) trimmed = trimmed.slice(1);
  if (trimmed.endsWith("|")) trimmed = trimmed.slice(0, -1);
  return trimmed.split("|").map((c) => c.trim());
}

function isTableStart(lines: string[], i: number): boolean {
  if (i + 1 >= lines.length) return false;
  const l1 = lines[i].trim();
  const l2 = lines[i + 1].trim();
  return l1.includes("|") && l2.includes("|") && l2.includes("-");
}

function parseTableBlock(lines: string[], startIdx: number) {
  const headers = splitTableRow(lines[startIdx]);
  let currentIdx = startIdx + 2; // skip separator
  const rows: string[][] = [];

  while (currentIdx < lines.length) {
    const line = lines[currentIdx].trim();
    if (!line || !line.includes("|")) break;
    rows.push(splitTableRow(line));
    currentIdx++;
  }
  return { headers, rows, nextIdx: currentIdx };
}

function renderInlineFormatted(text: string): React.ReactNode {
  const regex = /(\*\*\*(?!\s)(?:[^*]+?)(?<!\s)\*\*\*|\*\*(?!\s)(?:[^*]+?)(?<!\s)\*\*|\*(?!\s)(?:[^*]+?)(?<!\s)\*|\*+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const parts: React.ReactNode[] = [];

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const chunk = text.slice(lastIndex, match.index).replace(/\*/g, "");
      if (chunk) parts.push(chunk);
    }

    const token = match[0];
    const inner = token.replace(/\*/g, "");

    if (!inner) {
      lastIndex = regex.lastIndex;
      continue;
    }

    if (token.startsWith("***") && token.endsWith("***") && token.length > 6) {
      parts.push(
        <strong key={`bi-${match.index}`} className="font-semibold italic">
          {token.slice(3, -3)}
        </strong>
      );
    } else if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-semibold">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      parts.push(
        <em key={`i-${match.index}`} className="italic">
          {token.slice(1, -1)}
        </em>
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const trailing = text.slice(lastIndex).replace(/\*/g, "");
    if (trailing) parts.push(trailing);
  }

  return parts.length > 0 ? parts : null;
}

function renderMessageContent(text: string): React.ReactNode {
  const lines = cleanLatex(text).split("\n");
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    if (isTableStart(lines, i)) {
      const { headers, rows, nextIdx } = parseTableBlock(lines, i);
      nodes.push(
        <div
          key={`table-${i}`}
          className="my-3 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-850/80 shadow-xs"
        >
          <table className="w-full text-xs text-left border-collapse min-w-[280px]">
            <thead className="bg-navy-50/90 dark:bg-navy-950/70 text-navy-900 dark:text-blue-200 border-b border-gray-200 dark:border-gray-700 font-semibold">
              <tr>
                {headers.map((h, hIdx) => (
                  <th key={hIdx} className="px-3 py-2 whitespace-nowrap">
                    {renderInlineFormatted(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 dark:divide-gray-800">
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx % 2 === 0
                      ? "bg-white/60 dark:bg-gray-900/40"
                      : "bg-gray-50/40 dark:bg-gray-800/40"
                  }
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 leading-relaxed align-top">
                      {renderInlineFormatted(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = nextIdx;
    } else {
      const line = lines[i];
      // Headings
      if (line.startsWith("### ")) {
        nodes.push(
          <p key={`h3-${i}`} className="font-bold text-sm text-navy-900 dark:text-white mt-3 mb-1">
            {renderInlineFormatted(line.slice(4))}
          </p>
        );
      } else if (line.startsWith("## ")) {
        nodes.push(
          <p key={`h2-${i}`} className="font-bold text-sm text-navy-900 dark:text-white mt-3 mb-1">
            {renderInlineFormatted(line.slice(3))}
          </p>
        );
      } else if (line.startsWith("# ")) {
        nodes.push(
          <p key={`h1-${i}`} className="font-bold text-base text-navy-900 dark:text-white mt-3 mb-1">
            {renderInlineFormatted(line.slice(2))}
          </p>
        );
      // Bullet lists
      } else if (line.startsWith("- ") || line.startsWith("• ")) {
        nodes.push(
          <p key={`li-${i}`} className="flex gap-1.5 ml-2">
            <span className="text-blue-500 mt-0.5 flex-shrink-0">•</span>
            <span>{renderInlineFormatted(line.slice(2))}</span>
          </p>
        );
      // Numbered lists e.g. "1. " "12. "
      } else if (/^\d+\.\s/.test(line)) {
        const dotIdx = line.indexOf(". ");
        const num = line.slice(0, dotIdx + 1);
        const rest = line.slice(dotIdx + 2);
        nodes.push(
          <p key={`ol-${i}`} className="flex gap-1.5 ml-2">
            <span className="text-blue-500 font-semibold flex-shrink-0 min-w-[1.5rem]">{num}</span>
            <span>{renderInlineFormatted(rest)}</span>
          </p>
        );
      } else {
        nodes.push(
          <React.Fragment key={`line-${i}`}>
            {i > 0 && <br />}
            {renderInlineFormatted(line)}
          </React.Fragment>
        );
      }
      i++;
    }
  }

  return nodes;
}

// --- Main Chat Window Component ---

interface ChatWindowProps {
  onClose: () => void;
}

export function ChatWindow({ onClose }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([INTRO_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [promptIdx, setPromptIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPromptIdx((prev) => (prev + 1) % DYNAMIC_PROMPTS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("erg_chat_sound");
      if (stored !== null) setSoundEnabled(stored === "true");
    } catch {}
  }, []);

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("erg_chat_sound", String(next));
      } catch {}
      if (next) chatSound.playReact(true);
      return next;
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping) return;
    const interval = setInterval(() => {
      chatSound.playThinkingPulse(soundEnabled);
    }, 2000);
    return () => clearInterval(interval);
  }, [isTyping, soundEnabled]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    chatSound.playSend(soundEnabled);

    // User message with automatic Love React from Er. Ganesh AI
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
      autoLoveReact: true,
    };
    const allMessages = [...messages, userMessage];
    setMessages(allMessages);
    setInput("");
    setIsTyping(true);

    const history = allMessages
      .filter((m) => m.id !== "intro")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.text,
      }));

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
        "Namaste! Could not generate a response right now. Please try asking again.";

      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: replyText,
          reactions: {},
          userReaction: null,
        },
      ]);
      chatSound.playReceive(soundEnabled);
    } catch (err) {
      console.error("AI chat error:", err);
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          text: "Maaf garnu hola, kehi samasya aayo. Kripaya feri prayas garnuhos ya /contact page bata sidhai sampark garnuhos.",
          reactions: {},
          userReaction: null,
        },
      ]);
      chatSound.playReceive(soundEnabled);
    }
  }

  const handleReaction = (msgId: string, reactionId: string) => {
    chatSound.playReact(soundEnabled);
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;

        const currentReactions = { ...(m.reactions || {}) };
        const previous = m.userReaction;

        if (previous === reactionId) {
          currentReactions[reactionId] = Math.max(0, (currentReactions[reactionId] || 1) - 1);
          if (currentReactions[reactionId] === 0) delete currentReactions[reactionId];
          return { ...m, reactions: currentReactions, userReaction: null };
        } else {
          if (previous && currentReactions[previous]) {
            currentReactions[previous] = Math.max(0, currentReactions[previous] - 1);
            if (currentReactions[previous] === 0) delete currentReactions[previous];
          }
          currentReactions[reactionId] = (currentReactions[reactionId] || 0) + 1;
          return { ...m, reactions: currentReactions, userReaction: reactionId };
        }
      })
    );
  };

  const handleCopy = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      chatSound.playReact(soundEnabled);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleReset = () => {
    chatSound.playReact(soundEnabled);
    setMessages([INTRO_MESSAGE]);
    setInput("");
  };

  return (
    <div
      className="fixed bottom-24 right-5 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[540px] md:w-[600px] lg:w-[640px] h-[min(740px,86vh)] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(26,58,107,0.45)] border border-white/60 dark:border-white/10 flex flex-col overflow-hidden animate-erg-scale-in ring-1 ring-black/10"
      role="dialog"
      aria-modal="true"
      aria-label="Er. Ganesh AI Assistant"
    >
      {/* Messenger-style Header */}
      <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-navy-950 via-navy-900 to-indigo-950 text-white flex-shrink-0 border-b border-white/10 overflow-hidden">
        <div className="relative flex items-center gap-3 min-w-0">
          {/* Founder Portrait Avatar with status */}
          <div className="relative w-11 h-11 rounded-full ring-2 ring-blue-400/80 overflow-hidden flex-shrink-0 bg-navy-800 shadow-md">
            <Image
              src="/images/founder/ganesh-1.jpg"
              alt="Er. Ganesh Chapagain"
              fill
              sizes="44px"
              className="object-cover"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-navy-950 shadow-sm" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-white text-sm truncate">
                Er. Ganesh Chapagain
              </h3>
              <BadgeCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-white/70">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate">Active now • Civil AI Mentor</span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="relative flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title={soundEnabled ? "Mute sounds" : "Unmute sweet sounds"}
            aria-label="Toggle sound"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-blue-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-white/40" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear chat"
            aria-label="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Close"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Topics Carousel Strip */}
      <div className="flex gap-1.5 px-3.5 py-2 overflow-x-auto flex-shrink-0 bg-navy-50/70 dark:bg-navy-950/40 border-b border-gray-150 dark:border-white/5 scrollbar-none">
        {TOPICS.map((topic) => (
          <span
            key={topic}
            className="text-[10.5px] font-medium text-navy-700 dark:text-blue-300 bg-white dark:bg-gray-800/80 px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs border border-navy-100/60 dark:border-navy-800"
          >
            {topic}
          </span>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col animate-pop-in",
              msg.role === "user" ? "items-end" : "items-start"
            )}
          >
            <div
              className={cn(
                "relative flex items-start gap-2 max-w-[92%]",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar for assistant */}
              {msg.role === "assistant" && (
                <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-blue-500/60 bg-navy-800 mt-1 shadow-sm">
                  <Image
                    src="/images/founder/ganesh-1.jpg"
                    alt="Er. Ganesh"
                    fill
                    sizes="28px"
                    className="object-cover"
                  />
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={cn(
                  "p-3.5 rounded-2xl leading-relaxed text-[13.5px]",
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-navy-700 text-white rounded-br-xs shadow-md shadow-indigo-500/10"
                    : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-xs border border-gray-150 dark:border-gray-700/60 shadow-sm"
                )}
              >
                {renderMessageContent(msg.text)}
              </div>

              {/* AI Auto Love React on user messages */}
              {msg.role === "user" && msg.autoLoveReact && (
                <div
                  className="absolute -bottom-2 -left-1 sm:-left-2 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 animate-in zoom-in-75 duration-200"
                  title="Er. Ganesh AI reacted with Love"
                >
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">1</span>
                </div>
              )}
            </div>

            {/* Assistant message action bar (reactions & copy) */}
            {msg.role === "assistant" && (
              <div className="flex items-center gap-1.5 ml-9 mt-1.5 flex-wrap">
                {/* Modern Reactions */}
                <div className="flex items-center gap-1 bg-gray-100/70 dark:bg-gray-800/50 px-1.5 py-0.5 rounded-full border border-gray-200/60 dark:border-gray-700/50">
                  {REACTION_OPTIONS.map(({ id, label, icon: Icon, color }) => {
                    const count = msg.reactions?.[id] || 0;
                    const isSelected = msg.userReaction === id;
                    return (
                      <button
                        key={id}
                        onClick={() => handleReaction(msg.id, id)}
                        className={cn(
                          "flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-transform duration-150 hover:scale-115 active:scale-95",
                          isSelected
                            ? "bg-navy-600 text-white shadow-xs font-semibold"
                            : "hover:bg-white dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                        )}
                        title={`React with ${label}`}
                      >
                        <Icon className={cn("w-3 h-3", isSelected ? "text-white fill-white" : color)} />
                        {count > 0 && (
                          <span
                            className={cn(
                              "text-[10px]",
                              isSelected ? "text-white" : "text-gray-500 dark:text-gray-400"
                            )}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Copy button */}
                <button
                  onClick={() => handleCopy(msg.id, msg.text)}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  title="Copy message"
                  aria-label="Copy message"
                >
                  {copiedId === msg.id ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium px-1">
                      <Check className="w-3 h-3" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Sleek Messenger-style Typing Indicator */}
        {isTyping && (
          <div className="flex items-start gap-2 animate-pop-in">
            <div className="relative w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-blue-500/60 bg-navy-800 mt-1 shadow-sm">
              <Image
                src="/images/founder/ganesh-1.jpg"
                alt="Er. Ganesh"
                fill
                sizes="28px"
                className="object-cover"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-xs px-4 py-3 border border-gray-150 dark:border-gray-700/60 shadow-sm flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
              </div>
              <span className="text-xs text-gray-400 font-medium ml-1">
                Er. Ganesh is typing...
              </span>
            </div>
          </div>
        )}

        {/* Suggested Questions & Quick Navigation (shown on intro) */}
        {messages.length === 1 && !isTyping && (
          <div className="pt-2 space-y-3 animate-in fade-in duration-300">
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                Suggested Questions
              </p>
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex items-center justify-between w-full text-left px-3.5 py-2.5 text-xs text-navy-800 dark:text-navy-100 bg-white dark:bg-gray-800/90 border border-gray-150 dark:border-gray-700/60 rounded-xl hover:border-blue-400 hover:bg-navy-50/50 dark:hover:bg-navy-900/30 transition-all duration-200 shadow-xs group"
                >
                  <span className="truncate">{q}</span>
                  <span className="text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-xs">
                    →
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
                Quick Portals
              </p>
              <div className="flex gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-1.5 text-center px-3 py-2 text-xs font-medium text-navy-700 dark:text-blue-300 bg-navy-50/80 dark:bg-navy-900/40 border border-navy-100 dark:border-navy-800 rounded-xl hover:bg-navy-100 transition-all"
                  >
                    <action.icon className="w-3.5 h-3.5 text-navy-600 dark:text-blue-400" />
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messenger-style Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage(input);
        }}
        className="p-3 bg-white/90 dark:bg-gray-900/90 border-t border-gray-150 dark:border-white/5 flex flex-col gap-2 flex-shrink-0"
      >
        <div className="flex items-center justify-between px-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-800/60">
            <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>{DYNAMIC_PROMPTS[promptIdx]}</span>
          </span>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            Ask Anything You Want
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isTyping ? "Er. Ganesh is formulating a thoughtful reply..." : DYNAMIC_PROMPTS[promptIdx]}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            aria-label="Type your message"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-navy-700 hover:from-blue-700 hover:to-navy-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 shadow-sm"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 dark:text-gray-500">
          Powered by Er. Ganesh Chapagain • Nepal Civil Hub
        </p>
      </form>
    </div>
  );
}
