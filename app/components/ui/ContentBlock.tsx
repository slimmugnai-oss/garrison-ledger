type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function ContentBlock({ children, className = '' }: Props) {
  return (
    <article className={`bg-card rounded-2xl p-10 md:p-12 mb-8 ${className}`}>
      <div 
        className="prose prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-text-headings prose-headings:font-serif
          prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-4
          prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-3
          prose-p:text-text-body prose-p:leading-relaxed prose-p:mb-5
          prose-a:text-primary-accent prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-indigo-700
          prose-ul:my-6 prose-ul:space-y-3
          prose-ol:my-6 prose-ol:space-y-3
          prose-li:text-text-body prose-li:leading-relaxed
          prose-strong:text-text-headings prose-strong:font-bold
          prose-blockquote:border-l-4 prose-blockquote:border-primary-accent prose-blockquote:bg-indigo-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6
          prose-table:w-full prose-table:border-collapse
          prose-th:bg-surface-hover prose-th:p-4 prose-th:text-left prose-th:font-bold prose-th:text-text-headings
          prose-td:p-4 prose-td:border-t prose-td:border-subtle prose-td:text-text-body"
      >
        {children}
      </div>
    </article>
  );
}

