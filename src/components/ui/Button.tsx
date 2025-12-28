import { ButtonHTMLAttributes, forwardRef } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

        const variants = {
            primary: "bg-[#0F766E] text-white hover:bg-[#0D5D56]",
            secondary: "bg-gray-100 text-gray-900 border border-gray-200 hover:bg-gray-200",
            danger: "bg-red-500 text-white hover:bg-red-600",
            ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
        };

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2.5 text-sm",
            lg: "px-6 py-3 text-base",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                disabled={disabled || loading}
                {...props}
            >
                {loading && (
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
