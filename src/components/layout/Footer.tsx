export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-text-dim sm:flex-row">
        <span>SnipQA &copy; 2026 &mdash; Built for QA engineers</span>

        <a
          href="https://forms.gle/placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          Suggest a Snippet
        </a>

        <a
          href="https://github.com/mark-sameh/snipqa/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          Found a bug? Open an issue &rarr;
        </a>
      </div>
    </footer>
  );
}
