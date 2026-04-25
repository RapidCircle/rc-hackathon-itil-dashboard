import { BRANDING } from '../constants/branding';
import { useTheme } from '../context/ThemeContext';

interface Props {
  onClose: () => void;
}

function Swatch({ label, value, textClass = 'text-gray-700' }: { label: string; value: string; textClass?: string }) {
  return (
    <div className="rc-card p-3">
      <div className="h-12 w-full rounded-md border border-gray-200" style={{ backgroundColor: value }} />
      <p className="mt-2 text-xs font-semibold text-gray-500 font-asap uppercase tracking-wide">{label}</p>
      <p className={`text-sm font-medium ${textClass}`}>{value}</p>
    </div>
  );
}

export default function ThemeSwatch({ onClose }: Props) {
  const { theme, themeName, setThemeName, resetToBrandDefault, themeOptions, appearanceMode, setAppearanceMode } = useTheme();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <div className="rc-card w-full max-w-4xl shadow-2xl overflow-hidden" role="dialog" aria-modal="true" aria-label="Theme swatch preview">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)]">
          <div>
            <h2 className="text-xl font-bold text-[var(--rc-primary-900)]">Theme Preview</h2>
            <p className="text-xs text-gray-600 font-asap mt-1">{BRANDING.appName} visual tokens</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close theme preview"
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Brand Identity</h3>
            <div className="rc-card p-4 flex items-center gap-4">
              <img src={BRANDING.logoPath} alt="RapidCircle" className="h-10 w-auto" />
              <div>
                <p className="text-base font-semibold text-[var(--rc-primary-900)]">{BRANDING.appShortName}</p>
                <p className="text-xs text-gray-600 font-asap">{BRANDING.sidebarSubtitle}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Core Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Swatch label="Primary" value={theme.primary} />
              <Swatch label="Primary 50" value={theme.primary50} />
              <Swatch label="Primary 100" value={theme.primary100} />
              <Swatch label="Surface" value={theme.surface} />
              <Swatch label="Primary 600" value={theme.primary600} />
              <Swatch label="Primary 700" value={theme.primary700} />
              <Swatch label="Primary 900" value={theme.primary900} />
              <Swatch label="Accent" value={theme.accent} />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Appearance</h3>
            <div className="rc-card p-4">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAppearanceMode('light')}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    appearanceMode === 'light'
                      ? 'bg-[var(--rc-primary-50)] border-[var(--rc-primary-100)] text-[var(--rc-primary-900)] font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Light
                </button>
                <button
                  type="button"
                  onClick={() => setAppearanceMode('dark')}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                    appearanceMode === 'dark'
                      ? 'bg-[var(--rc-primary-50)] border-[var(--rc-primary-100)] text-[var(--rc-primary-900)] font-semibold'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Theme Selection</h3>
            <div className="rc-card p-4">
              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={resetToBrandDefault}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)] hover:bg-white transition-colors"
                >
                  Reset to RapidCircle Default
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setThemeName(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm border transition-colors ${
                      themeName === option.value
                        ? 'bg-[var(--rc-primary-50)] border-[var(--rc-primary-100)] text-[var(--rc-primary-900)] font-semibold'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Typography</h3>
            <div className="rc-card p-4 space-y-2">
              <p className="text-xl font-bold text-[var(--rc-primary-900)]">Poppins Heading Sample</p>
              <p className="text-sm text-gray-700">Niveau Grotesk body sample for dashboard content and labels.</p>
              <p className="text-sm font-asap text-gray-600">Asap supporting text sample for helper labels and metadata.</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--rc-primary-900)] mb-3">Controls</h3>
            <div className="rc-card p-4 flex items-center gap-3 flex-wrap">
              <button type="button" className="rc-primary-btn px-4 py-2 rounded-lg text-sm font-medium">Primary Button</button>
              <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium border border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]">Secondary Button</button>
              <span className="text-xs px-2 py-1 rounded-full bg-[var(--rc-primary-50)] border border-[var(--rc-primary-100)] text-[var(--rc-primary-900)]">Token Badge</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
