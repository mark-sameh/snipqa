"use client";
import { useState } from "react";
import { Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

type Framework = "playwright" | "cypress";

export default function AIGenerator() {
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<Framework>("playwright");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, framework }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setResult(data.snippet);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const examples = [
    "intercept a POST request and mock the response",
    "login via API and skip the UI login form",
    "wait for a network call before asserting",
    "upload a file from fixtures folder",
    "select an option from a dropdown by label",
  ];

  return (
    <section id="generate" className="mx-auto max-w-4xl px-6 py-16">
      <div className="rounded-2xl border border-border bg-surface p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Sparkles size={18} className="text-accent" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text">AI Snippet Generator</h2>
            <p className="text-sm text-text-dim">Describe what you need — get a working snippet</p>
          </div>
        </div>

        {/* Framework toggle */}
        <div className="mb-4 flex gap-2">
          {(["playwright", "cypress"] as Framework[]).map((fw) => (
            <button
              key={fw}
              onClick={() => setFramework(fw)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all capitalize ${
                framework === fw
                  ? fw === "playwright"
                    ? "border-pw/40 bg-pw/10 text-pw"
                    : "border-cy/40 bg-cy/10 text-cy"
                  : "border-border text-text-dim hover:border-border hover:text-text"
              }`}
            >
              {fw}
            </button>
          ))}
        </div>

        {/* Prompt input */}
        <div className="mb-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generate(); }}
            placeholder="e.g. intercept a GET request and return mocked JSON data..."
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 text-text placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
          />
        </div>

        {/* Example prompts */}
        <div className="mb-5 flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => setPrompt(ex)}
              className="rounded-full border border-border px-3 py-1 text-xs text-text-dim hover:border-accent/50 hover:text-text transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-medium text-bg transition-all hover:bg-accent-dim disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Generating...</>
          ) : (
            <><Sparkles size={16} /> Generate Snippet</>
          )}
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 animate-slide-up">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-text-dim">Generated snippet</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs text-text-dim hover:border-accent hover:text-accent transition-all"
              >
                {copied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-border">
              <SyntaxHighlighter
                language="typescript"
                style={oneDark}
                customStyle={{ margin: 0, background: "#0d0d14", padding: "16px", maxHeight: "400px" }}
                showLineNumbers
                lineNumberStyle={{ color: "#2a2a3e", fontSize: "11px" }}
              >
                {result}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
