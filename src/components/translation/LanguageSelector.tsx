import { SUPPORTED_LANGUAGES } from '@/lib/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Target Language</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select target language..." />
        </SelectTrigger>
        <SelectContent>
          {SUPPORTED_LANGUAGES.map(lang => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name} ({lang.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
