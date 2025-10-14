'use client';

type Props = {
  title: string;
  html: string;
};

export default function ChecklistCard({ title, html }: Props) {
  return (
    <div className="bg-white rounded-xl p-8 border-l-4 border-green-500 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          <Icon name="Check" className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{title}</h4>
      </div>
      <div 
        className="prose prose-lg max-w-none prose-li:my-3 prose-ul:space-y-2 prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-green-600 hover:prose-a:text-green-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

