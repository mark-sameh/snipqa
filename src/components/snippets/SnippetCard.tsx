"use client";
import { useState, useEffect } from "react";
import { Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Snippet } from "@/data/snippets";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface Props { snippet: Snippet; }

export default function SnippetCard({ snippet }: Props) {
  const [copied, setCopied] = useState(false);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  const storageKey = `snipqa-votes-${snippet.id}`;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const { likes: l, dislikes: d } = JSON.parse(stored);
        setLikes(l ?? 0);
        setDislikes(d ?? 0);
      }
    } catch {}
  }, [storageKey]);

  const vote = (type: "like" | "dislike") => {
    const next = type === "like"
      ? { likes: likes + 1, dislikes }
      : { likes, dislikes: dislikes + 1 };
    if (type === "like") setLikes(next.likes);
    else setDislikes(next.dislikes);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fwClass = snippet.framework === "playwright"
    ? "text-pw border-pw/30 bg-pw/10"
    : "text-cy border-cy/30 bg-cy/10";

  return (
    <div className="group rounded-xl border border-border bg-surface p-5 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 animate-slide-up">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-500 ${fwClass}`}>
              {snippet.framework === "playwright" ? "Playwright" : "Cypress"}
            </span>
            <span className="rounded-full border border-border bg-bg px-2.5 py-0.5 font-mono text-xs text-text-dim capitalize">
              {snippet.category}
            </span>
          </div>
          <h3 className="font-display text-base font-600 text-text">{snippet.title}</h3>
          <p className="mt-1 text-sm text-text-dim leading-snug">{snippet.description}</p>
        </div>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 rounded-lg border border-border p-2 text-text-dim transition-all hover:border-accent hover:text-accent"
        >
          {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
        </button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border text-[13px]">
        <SyntaxHighlighter
          language={snippet.language}
          style={oneDark}
          customStyle={{ margin: 0, background: "#0d0d14", padding: "14px 16px", maxHeight: "220px" }}
          showLineNumbers
          lineNumberStyle={{ color: "#2a2a3e", fontSize: "11px" }}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {snippet.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-bg px-2 py-0.5 font-mono text-xs text-muted">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <button
            onClick={() => vote("like")}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-dim transition-all hover:border-accent hover:text-accent"
          >
            <ThumbsUp size={13} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => vote("dislike")}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs text-text-dim transition-all hover:border-red-500 hover:text-red-400"
          >
            <ThumbsDown size={13} />
            <span>{dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
