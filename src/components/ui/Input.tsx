import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
    label?: string;
    hint?: string;
    error?: string;
    success?: boolean;
    icon?: ReactNode;
    iconPosition?: 'start' | 'end';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            hint,
            error,
            success,
            icon,
            iconPosition = 'start',
            className,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={inputId} className="input-label">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {icon && iconPosition === 'start' && (
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-text-muted pointer-events-none">
                            {icon}
                        </span>
                    )}

                    <input
                        ref={ref}
                        id={inputId}
                        className={clsx(
                            'input',
                            error && 'input-error',
                            success && 'input-success',
                            icon && iconPosition === 'start' && 'ps-10',
                            icon && iconPosition === 'end' && 'pe-10',
                            className
                        )}
                        {...props}
                    />

                    {icon && iconPosition === 'end' && (
                        <span className="absolute inset-y-0 end-0 flex items-center pe-3 text-text-muted pointer-events-none">
                            {icon}
                        </span>
                    )}
                </div>

                {hint && !error && (
                    <span className="input-hint">{hint}</span>
                )}

                {error && (
                    <span className="input-error-text">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    hint?: string;
    error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, hint, error, className, id, ...props }, ref) => {
        const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={textareaId} className="input-label">
                        {label}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    className={clsx(
                        'input',
                        error && 'input-error',
                        className
                    )}
                    {...props}
                />

                {hint && !error && (
                    <span className="input-hint">{hint}</span>
                )}

                {error && (
                    <span className="input-error-text">{error}</span>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    hint?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, hint, error, options, placeholder, className, id, ...props }, ref) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

        return (
            <div className="input-group">
                {label && (
                    <label htmlFor={selectId} className="input-label">
                        {label}
                    </label>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    className={clsx(
                        'input',
                        error && 'input-error',
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {hint && !error && (
                    <span className="input-hint">{hint}</span>
                )}

                {error && (
                    <span className="input-error-text">{error}</span>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Input;
