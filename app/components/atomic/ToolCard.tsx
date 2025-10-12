'use client';

type Props = {
  title: string;
  html: string;
};

export default function ToolCard({ title, html }: Props) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-300 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">🛠️</span>
        </div>
        <h4 className="text-2xl font-bold text-blue-900">{title}</h4>
      </div>
      <div 
        className="prose prose-blue max-w-none prose-p:text-blue-900 prose-headings:text-blue-900 prose-a:text-blue-700 hover:prose-a:text-blue-800"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

