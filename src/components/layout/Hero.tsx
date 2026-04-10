export default function Hero() {
  return (
    <section className="relative overflow-hidden px-6 py-24 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00e5ff 1px, transparent 1px), linear-gradient(90deg, #00e5ff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-accent opacity-5 blur-3xl" />

      <div className="relative mx-auto max-w-3xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-text-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          Playwright &middot; Cypress &middot; AI-powered
        </div>

        <h1 className="mb-6 font-display text-5xl font-bold leading-snug tracking-normal text-text md:text-6xl">
          Stop Googling.<br />
          <span className="text-accent">Describe it. Get it.</span>
        </h1>

        <p className="mb-10 text-lg text-text-dim leading-relaxed">
          A curated snippet library for QA automation engineers. Search real-world
          Playwright and Cypress patterns — or let AI generate exactly what you need.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="#library" className="rounded-md bg-accent px-6 py-3 font-medium text-bg hover:bg-accent-dim transition-colors">
            Browse Library
          </a>
          <a href="#generate" className="rounded-md border border-border px-6 py-3 font-medium text-text-dim hover:border-accent hover:text-accent transition-colors">
            AI Generate
          </a>
        </div>
      </div>
    </section>
  );
}
