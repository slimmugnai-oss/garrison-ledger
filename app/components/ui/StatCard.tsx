import Icon from './Icon';
import { IconName } from './icon-registry';

type Props = {
  iconName: IconName;
  label: string;
  description: string;
};

export default function StatCard({ iconName, label, description }: Props) {
  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
      <Icon name={iconName} className="h-10 w-10 text-gray-700 mb-3" />
      <h3 className="text-xl font-bold text-text-headings mb-2">{label}</h3>
      <p className="text-text-body text-sm">{description}</p>
    </div>
  );
}

