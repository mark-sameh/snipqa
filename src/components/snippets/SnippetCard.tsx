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
  // voted is per-device only — stored in localStorage, never sent to Supabase
  const [voted, setVoted] = useState<"like" | "dislike" | null>(null);

  const choiceKey = `snipqa-vote-${snippet.id}`;

  useEffect(() => {
    // Restore the user's personal vote choice from localStorage
    try {
      const choice = localStorage.getItem(choiceKey);
      if (choice === "like" || choice === "dislike") setVoted(choice);
    } catch {}

    // Fetch global counts from Supabase via the API route
    fetch(`/api/votes/${snippet.id}`)
      .then((r) => r.json())
      .then(({ likes: l, dislikes: d }) => {
        if (typeof l === "number") setLikes(l);
        if (typeof d === "number") setDislikes(d);
      })
      .catch(() => {}); // silently ignore — counts default to 0
  }, [snippet.id, choiceKey]);

  const vote = async (type: "like" | "dislike") => {
    // Clicking the opposite button while voted → do nothing
    if (voted !== null && voted !== type) return;

    if (voted === type) {
      // Toggle off: remove the vote
      const action = "remove";
      const next = {
        likes:    type === "like"    ? Math.max(0, likes    - 1) : likes,
        dislikes: type === "dislike" ? Math.max(0, dislikes - 1) : dislikes,
      };
      setLikes(next.likes);
      setDislikes(next.dislikes);
      setVoted(null);
      localStorage.removeItem(choiceKey);

      await fetch(`/api/votes/${snippet.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action }),
      });
    } else {
      // Cast a new vote
      const action = "add";
      const next = {
        likes:    type === "like"    ? likes    + 1 : likes,
        dislikes: type === "dislike" ? dislikes + 1 : dislikes,
      };
      setLikes(next.likes);
      setDislikes(next.dislikes);
      setVoted(type);
      localStorage.setItem(choiceKey, type);

      await fetch(`/api/votes/${snippet.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, action }),
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fwClass = snippet.framework === "playwright"
    ? "text-pw border-pw/30 bg-pw/10"
    : "text-cy border-cy/30 bg-cy/10";

  const likeClass = voted === "like"
    ? "border-green-500/50 bg-green-500/10 text-green-400"
    : voted !== null
    ? "border-border/40 text-text-dim/30 cursor-not-allowed"
    : "border-border text-text-dim hover:border-accent hover:text-accent";

  const dislikeClass = voted === "dislike"
    ? "border-red-500/50 bg-red-500/10 text-red-400"
    : voted !== null
    ? "border-border/40 text-text-dim/30 cursor-not-allowed"
    : "border-border text-text-dim hover:border-red-500 hover:text-red-400";

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
            disabled={voted === "dislike"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-all ${likeClass}`}
          >
            <ThumbsUp size={13} />
            <span>{likes}</span>
          </button>
          <button
            onClick={() => vote("dislike")}
            disabled={voted === "like"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-all ${dislikeClass}`}
          >
            <ThumbsDown size={13} />
            <span>{dislikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
