/**
 * DISCLAIMER COMPONENT
 * 
 * Standard disclaimers for finance, tax, benefits, and legal content
 * Server component - renders static disclaimer text
 */

import Icon from '../ui/Icon';

type DisclaimerKind = 'finance' | 'tax' | 'benefits' | 'legal';

interface DisclaimerProps {
  kind: DisclaimerKind;
  compact?: boolean;
}

const DISCLAIMER_TEXT: Record<DisclaimerKind, { title: string; text: string; icon: 'Shield' | 'AlertCircle' }> = {
  finance: {
    title: 'Financial Information',
    text: 'This content is educational information only—not financial advice. Consider consulting a fiduciary financial advisor for personalized guidance.',
    icon: 'Shield'
  },
  tax: {
    title: 'Tax Information',
    text: 'Tax laws change periodically and vary by individual circumstances. Consult the IRS or a qualified tax professional for advice specific to your situation.',
    icon: 'AlertCircle'
  },
  benefits: {
    title: 'Benefits Information',
    text: 'Benefits rules vary and can change. Confirm current policies with official DoD, VA, or TRICARE sources before making decisions.',
    icon: 'Shield'
  },
  legal: {
    title: 'Legal Information',
    text: 'This is general information, not legal advice. Consult an attorney for guidance on specific legal matters.',
    icon: 'AlertCircle'
  }
};

export default function Disclaimer({ kind, compact = false }: DisclaimerProps) {
  const disclaimer = DISCLAIMER_TEXT[kind];

  if (compact) {
    return (
      <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 my-4">
        <Icon name={disclaimer.icon} className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
        <p className="text-xs">{disclaimer.text}</p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon name={disclaimer.icon} className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-blue-900 mb-1">
            {disclaimer.title}
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {disclaimer.text}
          </p>
        </div>
      </div>
    </div>
  );
}

