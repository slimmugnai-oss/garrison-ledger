'use client';

type Props = {
  title: string;
  html: string;
};

export default function CalculatorCard({ title, html }: Props) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-2 border-green-300 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
          <span className="text-white text-2xl">🧮</span>
        </div>
        <h4 className="text-2xl font-bold text-success">{title}</h4>
      </div>
      <div 
        className="prose prose-lg max-w-none prose-headings:text-green-900 prose-p:text-success prose-a:text-success hover:prose-a:text-success"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

