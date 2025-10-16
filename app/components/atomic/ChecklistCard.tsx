'use client';

import Icon from '@/app/components/ui/Icon';

type Props = {
  title: string;
  html: string;
};

export default function ChecklistCard({ title, html }: Props) {
  return (
    <div className="bg-surface rounded-xl p-8 border-l-4 border-success shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-success rounded-lg flex items-center justify-center">
          <Icon name="Check" className="h-6 w-6 text-white" />
        </div>
        <h4 className="text-2xl font-bold text-primary">{title}</h4>
      </div>
      <div 
        className="prose prose-lg max-w-none prose-li:my-3 prose-ul:space-y-2 prose-headings:text-primary prose-p:text-body prose-a:text-success hover:prose-a:text-success"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

