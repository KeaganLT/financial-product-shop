// src/components/FormInput.jsx
import { useState } from 'react';
import CloseIcon from '../assets/CloseIcon.jsx';
import ErrorIcon from '../assets/ErrorIcon.jsx';
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
                                      onBlur,
                                      autoFocus,
                                      inputRef,
                                  }) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const hasValue = value.length > 0;
    const inputType = isPassword && showPassword ? 'text' : type;
    const showSmallLabel = isFocused || hasValue;

    const borderClass = error
        ? hasValue ? 'border-[3px] border-[#FF3B30]' : 'border border-[#FF3B30]'
        : isFocused
            ? 'border-[3px] border-[#F2F2F7]'
            : hasValue
                ? 'border border-[#E5E5EA]'
                : 'border border-[#C7C7CC]';

    const stateColor = error ? '#FF3B30' : 'var(--brand-200)';
    const labelColor = showSmallLabel ? stateColor : (error ? '#FF3B30' : 'var(--neutral-400)');

    return (
        <div className="relative h-14 rounded px-4 flex items-center" style={{ backgroundColor: 'var(--surface-field)' }}>
            <div className={`absolute inset-0 rounded pointer-events-none ${borderClass}`} />

            <div className="relative flex-1 min-w-0">
                {showSmallLabel && (
                    <label
                        htmlFor={id}
                        className="absolute -top-[26px] -left-1 px-1 text-[12px] leading-4"
                        style={{ backgroundColor: 'var(--surface-field)', color: labelColor }}
                    >
                        {label}
                    </label>
                )}

                {!showSmallLabel && (
                    <label
                        htmlFor={id}
                        className="absolute inset-0 flex items-center text-[16px] leading-6"
                        style={{ color: labelColor, letterSpacing: '0.5px' }}
                    >
                        {label}
                    </label>
                )}

                <input
                    ref={inputRef}
                    id={id}
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => {
                        setIsFocused(false);
                        onBlur?.();
                    }}
                    required={required}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    className="w-full bg-transparent text-[16px] leading-6 outline-none"
                    style={{ color: 'var(--text-primary)', letterSpacing: '0.5px', caretColor: stateColor }}
                />
            </div>

            {error && (
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <ErrorIcon width={24} height={24} color="#FF3B30" />
                </div>
            )}

            {!error && isPassword && (
                <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    {showPassword
                        ? <EyeOpenIcon width={24} height={24} color="var(--text-primary)" />
                        : <EyeCloseIcon width={22} height={19} color="var(--text-primary)" />}
                </button>
            )}

            {!error && !isPassword && hasValue && (
                <button
                    type="button"
                    onClick={() => onChange({ target: { value: '' } })}
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                    aria-label="Clear"
                >
                    <span className="w-6 h-6 rounded-full border flex items-center justify-center" style={{ borderColor: 'var(--text-primary)' }}>
                        <CloseIcon width={14} height={14} color="var(--text-primary)" />
                    </span>
                </button>
            )}
        </div>
    );
}