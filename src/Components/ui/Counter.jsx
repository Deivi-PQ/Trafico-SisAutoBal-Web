import React from 'react';

const Counter = ({
    value = 0,
    onChange,
    min = 0,
    max = 999,
    step = 1,
    label = "Contador",
    placeholder = "0",
    disabled = false,
    className = "",
    showLabel = true,
    size = "md", // sm, md, lg
    variant = "default", // default, primary, secondary
    ...props
}) => {
    // Funciones para el contador
    const increment = () => {
        const newValue = (value || 0) + step;
        if (newValue <= max) {
            onChange?.(newValue);
        }
    };

    const decrement = () => {
        const currentValue = value || 0;
        const newValue = currentValue - step;
        if (newValue >= min) {
            onChange?.(newValue);
        }
    };

    const handleInputChange = (e) => {
        const inputValue = parseInt(e.target.value) || 0;
        if (inputValue >= min && inputValue <= max) {
            onChange?.(inputValue);
        }
    };

    // Estilos dinámicos basados en props
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'text-sm',
                    button: 'px-2 py-1',
                    input: 'px-2 py-1 text-sm',
                    icon: 'w-3 h-3'
                };
            case 'lg':
                return {
                    container: 'text-lg',
                    button: 'px-4 py-3',
                    input: 'px-4 py-3 text-xl',
                    icon: 'w-5 h-5'
                };
            default: // md
                return {
                    container: 'text-base',
                    button: 'px-3 py-2',
                    input: 'px-3 py-2 text-lg',
                    icon: 'w-4 h-4'
                };
        }
    };

    const getVariantClasses = () => {
        switch (variant) {
            case 'primary':
                return {
                    button: 'bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-800 border-blue-200',
                    input: 'focus:ring-blue-500 focus:border-blue-500',
                    container: 'border-blue-200'
                };
            case 'secondary':
                return {
                    button: 'bg-green-50 hover:bg-green-100 text-green-600 hover:text-green-800 border-green-200',
                    input: 'focus:ring-green-500 focus:border-green-500',
                    container: 'border-green-200'
                };
            default:
                return {
                    button: 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-gray-200',
                    input: 'focus:ring-gray-500 focus:border-gray-500',
                    container: 'border-gray-200'
                };
        }
    };

    const sizeClasses = getSizeClasses();
    const variantClasses = getVariantClasses();

    const isAtMin = (value || 0) <= min;
    const isAtMax = (value || 0) >= max;

    return (
        <div className={`space-y-2 ${className}`} {...props}>
            {showLabel && (
                <label className={`block text-sm font-medium text-gray-700 ${sizeClasses.container}`}>
                    {label}
                </label>
            )}

            <div className={`flex items-center bg-white border rounded-lg overflow-hidden ${variantClasses.container} ${disabled ? 'opacity-50' : ''}`}>
                {/* Botón decrementar */}
                <button
                    type="button"
                    onClick={decrement}
                    disabled={disabled || isAtMin}
                    className={`${sizeClasses.button} ${variantClasses.button} transition-colors border-r ${disabled || isAtMin
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:shadow-sm'
                        }`}
                    aria-label="Decrementar"
                >
                    <svg
                        className={`${sizeClasses.icon}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                        />
                    </svg>
                </button>

                {/* Input central */}
                <input
                    type="number"
                    min={min}
                    max={max}
                    step={step}
                    value={value || 0}
                    onChange={handleInputChange}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={`flex-1 ${sizeClasses.input} font-semibold bg-white border-0 text-center focus:outline-none focus:ring-2 focus:ring-offset-0 ${variantClasses.input} ${disabled ? 'cursor-not-allowed' : ''
                        }`}
                    aria-label={label}
                />

                {/* Botón incrementar */}
                <button
                    type="button"
                    onClick={increment}
                    disabled={disabled || isAtMax}
                    className={`${sizeClasses.button} ${variantClasses.button} transition-colors border-l ${disabled || isAtMax
                        ? 'cursor-not-allowed opacity-50'
                        : 'hover:shadow-sm'
                        }`}
                    aria-label="Incrementar"
                >
                    <svg
                        className={`${sizeClasses.icon}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
            </div>

            {/* Información adicional */}
            {(min > 0 || max < 999) && (
                <div className="text-xs text-gray-500">
                    Rango: {min} - {max}
                </div>
            )}
        </div>
    );
};

export default Counter;