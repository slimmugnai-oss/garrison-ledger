/**
 * INTEL CARD LINK (for LES Auditor flags)
 * 
 * Links LES flags to relevant Intel Cards
 */

import Icon from '../ui/Icon';

const FLAG_TO_CARD_MAP: Record<string, { slug: string; title: string }> = {
  BAH_MISMATCH: { slug: 'finance/bah-basics', title: 'Understanding BAH' },
  BAS_MISSING: { slug: 'finance/bas-basics', title: 'BAS Entitlement' },
  COLA_STOPPED: { slug: 'finance/cola-guide', title: 'COLA Eligibility' },
  COLA_UNEXPECTED: { slug: 'finance/cola-guide', title: 'COLA Eligibility' },
};

export default function IntelCardLink({ flagCode }: { flagCode: string }) {
  const card = FLAG_TO_CARD_MAP[flagCode];

  if (!card) {
    return null;
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <a
        href={`/dashboard/intel/${card.slug}`}
        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Icon name="BookOpen" className="w-4 h-4" />
        Learn: {card.title}
        <Icon name="ArrowRight" className="w-3 h-3" />
      </a>
    </div>
  );
}

