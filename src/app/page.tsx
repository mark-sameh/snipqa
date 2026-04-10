import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import SnippetGrid from "@/components/snippets/SnippetGrid";
import AIGenerator from "@/components/snippets/AIGenerator";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AIGenerator />
      <SnippetGrid />
    </main>
  );
}
