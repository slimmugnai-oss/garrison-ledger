'use client';

interface ProfileFormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  success?: boolean;
  children: React.ReactNode;
}

export default function ProfileFormField({
  label,
  required = false,
  error,
  description,
  success = false,
  children
}: ProfileFormFieldProps) {
  return (
    <div className="space-y-2">
      {/* Label */}
      <label className="block text-sm font-semibold text-body">
        <span className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {success && !error && (
            <span className="text-green-500 text-sm">✓</span>
          )}
        </span>
      </label>
      
      {/* Input */}
      {children}
      
      {/* Helper text or error */}
      {error ? (
        <p className="text-xs text-danger flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      ) : description ? (
        <p className="text-xs text-muted">{description}</p>
      ) : null}
    </div>
  );
}

// Helper function for input styling
export function getInputClass(hasError: boolean, hasValue: boolean) {
  const base = "w-full border rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 text-sm sm:text-base";
  if (hasError) return `${base} border-red-300 bg-red-50 focus:ring-red-500 focus:border-red-500`;
  if (hasValue) return `${base} border-green-300 bg-white focus:ring-blue-500 focus:border-blue-500`;
  return `${base} border-gray-300 bg-white focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400`;
}

