import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Input({
  label,
  error,
  required = false,
  className = '',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={props.id}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full px-4 py-3 bg-secondary-light border rounded-office transition-all duration-smooth focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : isFocused
              ? 'border-primary bg-white'
              : 'border-gray-200'
          } ${props.className || ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${props.id}-error` : undefined}
        />
        {error && (
          <AlertCircle
            className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
            size={18}
          />
        )}
      </div>
      {error && (
        <p
          id={`${props.id}-error`}
          className="mt-1.5 text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle size={14} />
          {error}
        </p>
      )}
    </div>
  );
}

