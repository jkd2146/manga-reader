import { useSettings, Theme, ReadingMode, ReadingDirection, PageFit } from '../context/SettingsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

function Section({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest pt-5 pb-2" style={{ color: 'var(--muted)' }}>
      {label}
    </p>
  );
}

function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm" style={{ color: 'var(--text)' }}>{label}</span>
      <div className="flex gap-1">{children}</div>
    </div>
  );
}

function Chip<T extends string>({ value, label, current, onClick }: {
  value: T; label?: string; current: T; onClick: (v: T) => void;
}) {
  const active = value === current;
  return (
    <button
      onClick={() => onClick(value)}
      className="px-3 py-1 rounded-full text-xs font-medium transition-all"
      style={{
        backgroundColor: active ? 'var(--accent)' : 'var(--card)',
        color: active ? '#fff' : 'var(--muted)',
        boxShadow: active ? '0 0 12px rgba(201,168,108,0.35)' : 'none',
      }}
    >
      {label ?? value}
    </button>
  );
}

export default function SettingsPanel({ open, onClose }: Props) {
  const { settings, update } = useSettings();
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-y-0 right-0 z-50 w-72 flex flex-col"
        style={{ backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="font-semibold" style={{ color: 'var(--text)' }}>Settings</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors text-lg"
            style={{ color: 'var(--muted)', backgroundColor: 'var(--card)' }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-6">
          <Section label="Appearance" />
          <OptionRow label="Theme">
            {(['dark', 'light', 'amoled'] as Theme[]).map((t) => (
              <Chip key={t} value={t} current={settings.theme} onClick={(v) => update('theme', v)} />
            ))}
          </OptionRow>

          <Section label="Reader" />
          <OptionRow label="Scroll">
            {([
              ['long-strip', 'Strip'],
              ['single-page', 'Single'],
              ['double-page', 'Double'],
            ] as [ReadingMode, string][]).map(([v, label]) => (
              <Chip key={v} value={v} label={label} current={settings.readingMode} onClick={(val) => update('readingMode', val)} />
            ))}
          </OptionRow>
          <OptionRow label="Direction">
            {(['ltr', 'rtl'] as ReadingDirection[]).map((d) => (
              <Chip key={d} value={d} current={settings.readingDirection} onClick={(v) => update('readingDirection', v)} />
            ))}
          </OptionRow>
          <OptionRow label="Fit">
            {(['width', 'height', 'original'] as PageFit[]).map((f) => (
              <Chip key={f} value={f} current={settings.pageFit} onClick={(v) => update('pageFit', v)} />
            ))}
          </OptionRow>
        </div>
      </div>
    </>
  );
}
