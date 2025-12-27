import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    icon?: ReactNode;
    iconPosition?: 'start' | 'end';
    fullWidth?: boolean;
    children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            icon,
            iconPosition = 'start',
            fullWidth = false,
            className,
            disabled,
            children,
            ...props
        },
        ref
    ) => {
        const baseClasses = 'btn';

        const variantClasses: Record<ButtonVariant, string> = {
            primary: 'btn-primary',
            secondary: 'btn-secondary',
            ghost: 'btn-ghost',
            danger: 'btn-danger',
        };

        const sizeClasses: Record<ButtonSize, string> = {
            sm: 'btn-sm',
            md: '',
            lg: 'btn-lg',
        };

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    baseClasses,
                    variantClasses[variant],
                    sizeClasses[size],
                    loading && 'btn-loading',
                    fullWidth && 'w-full',
                    !children && icon && 'btn-icon',
                    className
                )}
                {...props}
            >
                {loading ? (
                    <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span className="sr-only">Loading...</span>
                    </span>
                ) : (
                    <>
                        {icon && iconPosition === 'start' && (
                            <span className="flex-shrink-0">{icon}</span>
                        )}
                        {children}
                        {icon && iconPosition === 'end' && (
                            <span className="flex-shrink-0">{icon}</span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export default Button;
