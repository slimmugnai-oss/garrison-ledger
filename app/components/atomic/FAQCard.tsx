'use client';

type Props = {
  title: string;
  html: string;
};

export default function FAQCard({ title, html }: Props) {
  return (
    <div className="bg-surface rounded-xl p-8 border-2 border-purple-200 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">❓</span>
        </div>
        <h4 className="text-2xl font-bold text-purple-900">{title}</h4>
      </div>
      <div 
        className="prose prose-lg max-w-none prose-headings:text-purple-900 prose-h4:text-lg prose-h4:font-bold prose-h4:mb-2 prose-p:text-body prose-a:text-purple-600 hover:prose-a:text-purple-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

