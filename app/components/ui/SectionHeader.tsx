type Props = {
  children: React.ReactNode;
  icon?: string;
};

export default function SectionHeader({ children, icon }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4">
        {icon && <span className="text-5xl">{icon}</span>}
        <h2 className="text-4xl md:text-5xl font-serif font-black text-text-headings tracking-tight">
          {children}
        </h2>
      </div>
    </div>
  );
}

