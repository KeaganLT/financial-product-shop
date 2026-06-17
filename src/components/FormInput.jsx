import { useState } from 'react';
import CloseIcon from '../assets/CloseIcon.jsx';
import ErrorRoundIcon from '../assets/ErrorRoundIcon.jsx';
import EyeOpenIcon from '../assets/EyeOpenIcon.jsx';
import EyeCloseIcon from '../assets/EyeCloseIcon.jsx';

export default function FormInput({
                                      id,
                                      label,
                                      type = 'text',
                                      value,
                                      onChange,
                                      error,
                                      autoComplete,
                                      required,
                                  }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const hasValue = value.length > 0;
    const inputType = isPassword && showPassword ? 'text' : type;

    const borderColor = error
        ? 'border-red-500'
        : isFocused
            ? 'border-black'
            : 'border-gray-300';
    const labelColor = error ? 'text-red-500' : 'text-gray-400';
    const textColor = error ? 'text-red-500' : 'text-black';

    return (
        <div className="flex flex-col gap-1">
            <div className={`relative px-3 pt-1.5 pb-2 rounded-xl border bg-white ${borderColor}`}>
                <label htmlFor={id} className={`block text-[11px] leading-none mb-1 ${labelColor}`}>
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id={id}
                        type={inputType}
                        value={value}
                        onChange={onChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        required={required}
                        autoComplete={autoComplete}
                        className={`w-full bg-transparent text-[15px] leading-none outline-none ${textColor} placeholder:text-gray-500`}
                    />

                    {error && <ErrorRoundIcon width={20} height={20} color="#EF4444" />}

                    {!error && isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="flex-shrink-0"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword
                                ? <EyeOpenIcon width={20} height={20} color="#9CA3AF" />
                                : <EyeCloseIcon width={18} height={16} color="#9CA3AF" />}
                        </button>
                    )}

                    {!error && !isPassword && hasValue && (
                        <button
                            type="button"
                            onClick={() => onChange({ target: { value: '' } })}
                            className="flex-shrink-0"
                            aria-label="Clear"
                        >
                            <CloseIcon width={18} height={18} color="#9CA3AF" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}