import { type InputHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? `input-${props.name ?? Math.random().toString(36).slice(2)}`;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full h-11 px-4 rounded-xl border bg-white text-navy-900 text-sm',
            'placeholder:text-navy-300 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 'border-navy-200',
            className ?? '',
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-sm text-error-600">{error}</p>}
        {hint && !error && <p className="text-sm text-navy-400">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, className, ...props }, ref) => {
    const selectId = id ?? `select-${props.name ?? Math.random().toString(36).slice(2)}`;
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-navy-700">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={[
            'w-full h-11 px-4 pr-10 rounded-xl border bg-white text-navy-900 text-sm',
            'transition-all duration-200 appearance-none',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%23486581%27 stroke-width=%272%27%3E%3Cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3E%3C/svg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat',
            error ? 'border-error-500' : 'border-navy-200',
            className ?? '',
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-error-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
