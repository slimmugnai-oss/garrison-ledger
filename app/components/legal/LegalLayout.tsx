import Header from '../Header';
import Footer from '../Footer';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function LegalLayout({ title, children }: Props) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 bg-bg min-h-screen">
        <h1 className="font-serif text-5xl font-black text-text mb-3">{title}</h1>
        <p className="text-sm text-muted mb-12">
          Effective: October 12, 2025 · Last updated when this page changes
        </p>
        <div className="space-y-10 prose prose-lg max-w-none
          prose-headings:font-serif prose-headings:text-text
          prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
          prose-p:text-muted prose-p:leading-relaxed
          prose-a:text-primary prose-a:underline hover:prose-a:text-accent
          prose-ul:text-muted prose-li:my-2
          prose-strong:text-text prose-strong:font-bold">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

