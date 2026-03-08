import { Slider } from "@/components/ui/slider";

export interface ToneSettings {
  formality: number;   // 0 = casual, 100 = formal
  length: number;      // 0 = concise, 100 = detailed
  creativity: number;  // 0 = safe, 100 = wild
}

interface ToneSlidersProps {
  settings: ToneSettings;
  onChange: (settings: ToneSettings) => void;
}

const sliders = [
  { key: "formality" as const, label: "Formality", left: "Casual", right: "Formal" },
  { key: "length" as const, label: "Length", left: "Concise", right: "Detailed" },
  { key: "creativity" as const, label: "Creativity", left: "Safe", right: "Wild" },
];

export function ToneSliders({ settings, onChange }: ToneSlidersProps) {
  return (
    <div className="space-y-3">
      {sliders.map((s) => (
        <div key={s.key} className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{s.left}</span>
            <span className="font-medium text-foreground text-[11px]">{s.label}</span>
            <span>{s.right}</span>
          </div>
          <Slider
            value={[settings[s.key]]}
            onValueChange={([v]) => onChange({ ...settings, [s.key]: v })}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
}

export const defaultToneSettings: ToneSettings = {
  formality: 30,
  length: 50,
  creativity: 50,
};
