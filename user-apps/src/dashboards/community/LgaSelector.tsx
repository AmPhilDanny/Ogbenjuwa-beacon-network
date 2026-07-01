import { useLanguage } from '@/lib/i18n';
import { IDOMA_LGAS } from '@/lib/types';

interface Props {
  selected: string;
  onChange: (lga: string) => void;
}

export default function LgaSelector({ selected, onChange }: Props) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('')}
        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          selected === '' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
        }`}
      >
        {t('directory.filter_lga')}
      </button>
      {IDOMA_LGAS.map(lga => (
        <button
          key={lga}
          onClick={() => onChange(lga)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selected === lga ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'
          }`}
        >
          {lga}
        </button>
      ))}
    </div>
  );
}
