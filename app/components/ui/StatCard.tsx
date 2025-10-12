type Props = {
  icon: string;
  label: string;
  description: string;
};

export default function StatCard({ icon, label, description }: Props) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-bold text-text-headings mb-2">{label}</h3>
      <p className="text-text-body text-sm">{description}</p>
    </div>
  );
}

