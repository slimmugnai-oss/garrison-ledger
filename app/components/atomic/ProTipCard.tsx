'use client';

type Props = {
  title: string;
  html: string;
};

export default function ProTipCard({ title, html }: Props) {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border-l-4 border-amber-500 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
          <Icon name="Lightbulb" className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-2xl font-bold text-amber-900">{title}</h4>
      </div>
      <div 
        className="prose prose-lg max-w-none prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-white prose-blockquote:p-4 prose-blockquote:my-4 prose-headings:text-amber-900 prose-p:text-amber-900 prose-a:text-amber-700 hover:prose-a:text-amber-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

