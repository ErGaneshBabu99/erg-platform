/**
 * ShareButtons Component
 *
 * Social share buttons for a blog article.
 * Accepts the article URL and title as props.
 */

"use client";

import { Twitter, Facebook, Linkedin, Link2, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonsProps {
  url: string;
  title: string;
}

export default function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      label: "Twitter",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      color: "hover:text-sky-400 hover:border-sky-400/30",
    },
    {
      label: "Facebook",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-blue-400 hover:border-blue-400/30",
    },
    {
      label: "LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-blue-500 hover:border-blue-500/30",
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {shareLinks.map(({ label, icon: Icon, href, color }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className={`p-2 rounded-lg border border-white/10 text-white/50 transition-all duration-300 ${color}`}
        >
          <Icon className="w-4 h-4" />
        </a>
      ))}

      {/* Copy link button */}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        className="p-2 rounded-lg border border-white/10 text-white/50 hover:text-green-400 hover:border-green-400/30 transition-all duration-300"
      >
        {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
