import { matchColor, matchBg } from '@/lib/match';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function MatchScore({ score, size = 'md', showLabel = false }: MatchScoreProps) {
  const sizes = {
    sm: { ring: 'h-12 w-12', text: 'text-xs', stroke: 4, r: 18 },
    md: { ring: 'h-16 w-16', text: 'text-sm', stroke: 5, r: 24 },
    lg: { ring: 'h-24 w-24', text: 'text-lg', stroke: 6, r: 36 },
  };
  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative ${s.ring}`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r={s.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-slatey-200"
          />
          <circle
            cx="24"
            cy="24"
            r={s.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`${matchColor(score)} transition-all duration-700 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <span className={`font-display font-bold ${matchColor(score)} ${s.text}`}>
            {score}%
          </span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-slatey-500">Match Score</span>
      )}
    </div>
  );
}

interface MatchBarProps {
  label: string;
  value: number;
}

export function MatchBar({ label, value }: MatchBarProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slatey-600">{label}</span>
        <span className={`text-xs font-bold ${matchColor(value)}`}>{value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slatey-200">
        <div
          className={`h-full rounded-full ${matchBg(value)} transition-all duration-700 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
