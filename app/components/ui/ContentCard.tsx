import { injectBinderCTAs } from '@/lib/binder-ctas';

type Props = {
  title: string;
  html: string;
  type: string;
  topics?: string[];
  slug?: string;
};

export default function ContentCard({ title, html, type, topics = [], slug = '' }: Props) {
  // Visual accent by type for magazine-style diversity
  const borderAccent = {
    'checklist': 'border-l-4 border-green-500',
    'tool': 'border-l-4 border-blue-500',
    'calculator': 'border-l-4 border-emerald-500',
    'faq_section': 'border-l-4 border-purple-500',
    'pro_tip_list': 'border-l-4 border-amber-500',
    'guide': '', // Clean, no border
  }[type] || '';

  return (
    <article className={`bg-card rounded-2xl p-10 md:p-12 shadow-lg ${borderAccent} mb-10`}>
      {/* Topic Pills */}
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {topics.map((topic) => (
            <span
              key={topic}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-surface-hover text-text-muted border border-border"
            >
              {topic}
            </span>
          ))}
        </div>
      )}

      {/* Title - Lora Serif */}
      <h3 className="text-3xl md:text-4xl font-serif font-black text-text-headings mb-8 leading-tight">
        {title}
      </h3>

      {/* Rich HTML Content - Custom prose-ledger class */}
      <div
        className="prose-ledger"
        dangerouslySetInnerHTML={{ __html: injectBinderCTAs(html, title, slug) }}
      />
    </article>
  );
}

