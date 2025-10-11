'use client';

import * as Dialog from '@radix-ui/react-dialog';

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  htmlContent: string;
};

export default function ContentModal({ open, onOpenChange, title, htmlContent }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-fadeIn" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Content className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 focus:outline-none">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <Dialog.Title className="text-lg font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              <Dialog.Close className="text-slate-500 hover:text-slate-700">✕</Dialog.Close>
            </div>
            <div className="p-5 max-h-[70vh] overflow-auto">
              <article
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
            <div className="px-5 py-4 border-t flex justify-end">
              <Dialog.Close className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}


