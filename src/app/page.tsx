import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";
import SnippetGrid from "@/components/snippets/SnippetGrid";
import AIGenerator from "@/components/snippets/AIGenerator";
import Footer from "@/components/layout/Footer";
import VisitTracker from "@/components/layout/VisitTracker";

export default function Home() {
  return (
    <main className="min-h-screen">
      <VisitTracker />
      <Header />
      <Hero />
      <AIGenerator />
      <SnippetGrid />
      <Footer />
    </main>
  );
}
