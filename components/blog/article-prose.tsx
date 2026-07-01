/**
 * ArticleProse — Phase 6 Polish
 *
 * Renders Blogger HTML content with premium dark-mode typography.
 * Content comes from our own controlled Blogger blog — dangerouslySetInnerHTML is safe here.
 * Injects heading IDs so TableOfContents anchor links work correctly.
 */

interface ArticleProseProps {
  content: string;
}

/**
 * Injects id attributes into h2/h3 tags so TOC anchor links work.
 * Runs on the server — no client JS needed.
 */
function injectHeadingIds(html: string): string {
  return html.replace(/<h([23])([^>]*)>(.*?)<\/h[23]>/gi, (_, level, attrs, inner) => {
    // Skip if id already present
    if (/\bid=/.test(attrs)) return _;
    const text = inner.replace(/<[^>]+>/g, "").trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 60);
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export default function ArticleProse({ content }: ArticleProseProps) {
  if (!content) {
    return (
      <p className="text-white/40 text-sm italic py-8 text-center">
        Content unavailable. Please view the original article on Blogger.
      </p>
    );
  }

  const processedContent = injectHeadingIds(content);

  return (
    <>
      <style>{`
        .article-prose { color: rgba(255,255,255,0.72); line-height: 1.85; font-size: 1rem; }

        /* Headings */
        .article-prose h1,
        .article-prose h2,
        .article-prose h3,
        .article-prose h4 {
          color: #fff;
          font-weight: 700;
          line-height: 1.3;
          margin-top: 2.2em;
          margin-bottom: 0.75em;
          scroll-margin-top: 6rem;
        }
        .article-prose h2 { font-size: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.07); padding-bottom: 0.4em; }
        .article-prose h3 { font-size: 1.2rem; color: rgba(255,255,255,0.92); }
        .article-prose h4 { font-size: 1rem; color: rgba(255,255,255,0.8); }

        /* Paragraphs */
        .article-prose p { margin-bottom: 1.4em; }

        /* Links */
        .article-prose a {
          color: #60a5fa;
          text-decoration: none;
          border-bottom: 1px solid rgba(96,165,250,0.3);
          transition: color 0.2s, border-color 0.2s;
        }
        .article-prose a:hover { color: #93c5fd; border-color: rgba(147,197,253,0.6); }

        /* Bold / Italic */
        .article-prose strong, .article-prose b { color: #fff; font-weight: 600; }
        .article-prose em, .article-prose i { color: rgba(255,255,255,0.8); font-style: italic; }

        /* Lists */
        .article-prose ul, .article-prose ol { margin: 1.2em 0 1.2em 1.5rem; }
        .article-prose li { margin-bottom: 0.4em; }
        .article-prose ul li { list-style: disc; }
        .article-prose ol li { list-style: decimal; }
        .article-prose ul li::marker, .article-prose ol li::marker { color: #3b82f6; }

        /* Blockquote */
        .article-prose blockquote {
          border-left: 3px solid #3b82f6;
          margin: 1.8em 0;
          padding: 1em 1.5em;
          background: rgba(59,130,246,0.05);
          border-radius: 0 0.75rem 0.75rem 0;
          color: rgba(255,255,255,0.65);
          font-style: italic;
        }
        .article-prose blockquote p { margin-bottom: 0; }

        /* Code */
        .article-prose code {
          font-family: 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.875em;
          background: rgba(59,130,246,0.12);
          color: #93c5fd;
          padding: 0.15em 0.45em;
          border-radius: 0.35em;
          border: 1px solid rgba(59,130,246,0.2);
        }
        .article-prose pre {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 0.85rem;
          padding: 1.25em 1.5em;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .article-prose pre code {
          background: none;
          border: none;
          padding: 0;
          color: rgba(255,255,255,0.8);
          font-size: 0.875rem;
        }

        /* Images */
        .article-prose img {
          width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 0.85rem;
          border: 1px solid rgba(255,255,255,0.08);
          margin: 1.5em 0;
          display: block;
        }

        /* Tables */
        .article-prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5em 0;
          font-size: 0.9rem;
        }
        .article-prose th {
          background: rgba(59,130,246,0.1);
          color: #fff;
          font-weight: 600;
          padding: 0.65em 1em;
          border: 1px solid rgba(255,255,255,0.1);
          text-align: left;
        }
        .article-prose td {
          padding: 0.6em 1em;
          border: 1px solid rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.7);
        }
        .article-prose tr:nth-child(even) td { background: rgba(255,255,255,0.02); }

        /* HR */
        .article-prose hr {
          border: none;
          border-top: 1px solid rgba(255,255,255,0.08);
          margin: 2.5em 0;
        }

        /* Blogger-specific overrides — remove inline styles that break dark mode */
        .article-prose [style*="color: black"],
        .article-prose [style*="color:#000"],
        .article-prose [style*="color: #000"] { color: rgba(255,255,255,0.72) !important; }
        .article-prose [style*="background: white"],
        .article-prose [style*="background:#fff"],
        .article-prose [style*="background-color: white"],
        .article-prose [style*="background-color:#fff"] { background: transparent !important; }
        .article-prose [style*="font-family"] { font-family: inherit !important; }
      `}</style>

      <div
        className="article-prose"
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </>
  );
}
