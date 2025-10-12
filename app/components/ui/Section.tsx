type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Section({ children, className = '' }: Props) {
  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
}

