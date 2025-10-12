'use client';

type Props = {
  title: string;
  html: string;
};

export default function GuideCard({ title, html }: Props) {
  return (
    <div className="bg-white rounded-xl p-8 md:p-10 border border-gray-200 shadow-lg">
      <h4 className="text-3xl font-bold text-gray-900 mb-8 leading-tight">{title}</h4>
      <div 
        className="prose prose-lg prose-slate max-w-none
          prose-headings:font-bold prose-headings:text-gray-900
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
          prose-h4:text-lg prose-h4:mt-4 prose-h4:mb-2
          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
          prose-a:text-blue-600 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline hover:prose-a:text-blue-700
          prose-ul:my-4 prose-ul:space-y-3
          prose-ol:my-4 prose-ol:space-y-3
          prose-li:text-gray-700 prose-li:leading-relaxed
          prose-strong:text-gray-900 prose-strong:font-bold
          prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:not-italic prose-blockquote:text-gray-800
          prose-table:border-collapse prose-table:w-full
          prose-th:bg-slate-100 prose-th:p-3 prose-th:text-left prose-th:font-bold
          prose-td:p-3 prose-td:border-t prose-td:border-slate-200"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

