import React from 'react';

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'blue' | 'red' | 'yellow' | 'emerald' | 'purple' | 'slate' | 'machine' | 'default' | 'secondary' | 'outline' | 'destructive';
  className?: string;
}

export function Badge({ children, variant = 'slate', className, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    red: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    yellow: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    machine: 'bg-slate-100 text-slate-700 border-slate-200 font-mono font-medium',
    default: 'bg-slate-900 text-white border-slate-800',
    secondary: 'bg-slate-100 text-slate-800 border-slate-200',
    outline: 'border-slate-200 text-slate-700 bg-white',
    destructive: 'bg-red-50 text-red-700 border-red-200',
  };

  const variantClass = variants[variant] || variants.slate;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium border tracking-wide select-none',
        variantClass,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
