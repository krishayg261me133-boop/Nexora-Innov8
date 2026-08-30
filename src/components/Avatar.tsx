import { initials, avatarGradient } from '@/lib/match';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizes = {
  xs: 'h-7 w-7 text-xs',
  sm: 'h-9 w-9 text-xs',
  md: 'h-11 w-11 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
  '2xl': 'h-28 w-28 text-3xl',
};

export function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizes[size];
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white shadow-sm ${className}`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} grid place-items-center rounded-full bg-gradient-to-br ${avatarGradient(
        name || '?'
      )} font-semibold text-white ring-2 ring-white shadow-sm ${className}`}
    >
      {initials(name || '?')}
    </div>
  );
}
