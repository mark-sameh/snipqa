import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-bold tracking-tight text-text">
          Snip<span className="text-accent">QA</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-text-dim">
          <Link href="#library" className="hover:text-text transition-colors">Library</Link>
          <Link href="#generate" className="hover:text-text transition-colors">AI Generate</Link>
          <a
            href="https://forms.gle/placeholder"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-border px-4 py-1.5 text-sm font-medium text-text-dim hover:border-accent hover:text-accent transition-colors"
          >
            Suggest a Snippet
          </a>
          <Link
            href="#generate"
            className="rounded-md bg-accent px-4 py-1.5 text-sm font-medium text-bg hover:bg-accent-dim transition-colors"
          >
            Generate Snippet
          </Link>
        </nav>
      </div>
    </header>
  );
}
