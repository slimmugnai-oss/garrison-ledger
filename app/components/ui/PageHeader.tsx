type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, right }: Props) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-black text-text">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-lg text-muted">{subtitle}</p>
        )}
      </div>
      {right}
    </div>
  );
}

