"use client";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import Fuse from "fuse.js";
import { snippets, categories, type Framework, type Category } from "@/data/snippets";
import SnippetCard from "./SnippetCard";

export default function SnippetGrid() {
  const [query, setQuery] = useState("");
  const [framework, setFramework] = useState<Framework | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");

  const fuse = useMemo(
    () => new Fuse(snippets, { keys: ["title", "description", "tags", "code"], threshold: 0.35 }),
    []
  );

  const filtered = useMemo(() => {
    let base = query ? fuse.search(query).map((r) => r.item) : snippets;
    if (framework !== "all") base = base.filter((s) => s.framework === framework);
    if (category !== "all") base = base.filter((s) => s.category === category);
    return base;
  }, [query, framework, category, fuse]);

  const btn = (active: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm transition-all ${
      active
        ? "border-accent bg-accent/10 text-accent"
        : "border-border text-text-dim hover:border-accent/50 hover:text-text"
    }`;

  return (
    <section id="library" className="mx-auto max-w-7xl px-6 pb-24">
      <div className="mb-10">
        <h2 className="mb-2 font-display text-3xl font-700 text-text">Snippet Library</h2>
        <p className="text-text-dim">{snippets.length} curated snippets &middot; updated regularly</p>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search — e.g. intercept, login, upload..."
          className="w-full rounded-xl border border-border bg-surface py-3.5 pl-11 pr-4 text-text placeholder:text-muted focus:border-accent focus:outline-none transition-colors"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "playwright", "cypress"] as const).map((fw) => (
          <button key={fw} onClick={() => setFramework(fw)} className={btn(framework === fw)}>
            {fw === "all" ? "All Frameworks" : fw.charAt(0).toUpperCase() + fw.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button key={cat.value} onClick={() => setCategory(cat.value)} className={btn(category === cat.value)}>
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-text-dim">
          No snippets match. Try the AI generator above ↑
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} />
          ))}
        </div>
      )}
    </section>
  );
}
