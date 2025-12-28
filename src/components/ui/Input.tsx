import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", label, error, id, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={id}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] disabled:bg-gray-50 disabled:cursor-not-allowed ${error ? "border-red-500" : "border-gray-200"
                        } ${className}`}
                    {...props}
                />
                {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";
