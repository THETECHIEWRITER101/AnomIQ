import * as React from 'react';

export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'dark' | 'outline' | 'secondary' | 'ghost' | 'glow' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'default' | 'xs' | 'icon' | 'icon-sm';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants: Record<string, string> = {
      default: 'bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-sm active:scale-[0.98]',
      dark: 'bg-[#0f172a] text-white hover:bg-[#1e293b] shadow-sm active:scale-[0.98]',
      glow: 'bg-[#0f172a] text-white hover:bg-blue-600 shadow-sm active:scale-[0.98]',
      outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 shadow-sm',
      secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200/80',
      ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
      destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
      link: 'text-blue-600 underline-offset-4 hover:underline',
    };

    const sizes: Record<string, string> = {
      xs: 'h-7 px-2.5 text-xs rounded-md',
      sm: 'h-8 px-3 text-xs rounded-lg',
      md: 'h-9 px-3.5 text-xs font-medium rounded-lg',
      lg: 'h-10 px-5 text-sm font-medium rounded-lg',
      default: 'h-9 px-3.5 text-xs font-medium rounded-lg',
      icon: 'h-8 w-8 rounded-lg p-0',
      'icon-sm': 'h-7 w-7 rounded-md p-0',
    };

    const variantClass = variants[variant] || variants.default;
    const sizeClass = sizes[size] || sizes.md;

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantClass, sizeClass, className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export default Button;
