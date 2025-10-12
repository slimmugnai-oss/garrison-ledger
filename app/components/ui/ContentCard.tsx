type Props = {
  title: string;
  html: string;
  type: string;
  topics?: string[];
};

export default function ContentCard({ title, html, type, topics = [] }: Props) {
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
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-text-muted border border-border"
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

      {/* Rich HTML Content - Tailwind Typography */}
      <div
        className="prose prose-lg max-w-none
          prose-headings:font-serif prose-headings:font-bold prose-headings:text-text-headings
          prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
          prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3
          prose-h5:text-lg prose-h5:mt-4 prose-h5:mb-2
          prose-p:text-text-body prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-primary-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-primary-hover
          prose-ul:my-6 prose-ul:space-y-3
          prose-ol:my-6 prose-ol:space-y-3
          prose-li:text-text-body prose-li:leading-relaxed
          prose-strong:text-text-headings prose-strong:font-bold
          prose-em:italic
          prose-blockquote:border-l-4 prose-blockquote:border-primary-accent prose-blockquote:bg-indigo-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:not-italic
          prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          prose-table:w-full prose-table:border-collapse prose-table:my-8
          prose-th:bg-gray-100 prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-text-headings prose-th:border prose-th:border-border
          prose-td:p-4 prose-td:border prose-td:border-border prose-td:text-text-body
          prose-img:rounded-lg prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

