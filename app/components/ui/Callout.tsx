type Props = {
  children: React.ReactNode;
  icon?: string;
  title?: string;
};

export default function Callout({ children, icon = "💡", title }: Props) {
  return (
    <div className="bg-indigo-50 border-l-4 border-primary-accent rounded-r-xl p-6 my-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-primary-accent rounded-lg flex items-center justify-center">
          <span className="text-2xl">{icon}</span>
        </div>
        <div>
          {title && <h5 className="font-bold text-text-headings text-lg mb-2">{title}</h5>}
          <div className="text-text-body leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  );
}

