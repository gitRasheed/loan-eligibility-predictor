import React from 'react';
import Tooltip from './Tooltip';

interface CurrencyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  tooltipText: string;
  error?: boolean;
}

/**
 * CurrencyInput component for handling currency input with formatting and tooltip.
 * @param {CurrencyInputProps} props - The props for the CurrencyInput component.
 * @returns {JSX.Element} The rendered CurrencyInput component.
 */
const CurrencyInput: React.FC<CurrencyInputProps> = ({ label, value, onChange, tooltipText, error }) => {
  /**
   * Formats the input value as currency.
   * @param {string} value - The input value to format.
   * @returns {string} The formatted currency value.
   */
  const formatCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <div>
      <Tooltip text={tooltipText}>
        <label className="block text-sm font-medium text-gray-300">{label}</label>
      </Tooltip>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">£</span>
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(formatCurrency(e.target.value))}
          className={`focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm rounded-md bg-gray-700 text-white placeholder-gray-400 py-3 transition-all duration-200 ease-in-out
            ${error 
              ? 'border-red-500 ring-2 ring-red-500' 
              : 'border-gray-600 hover:border-purple-400'
            }`}
          placeholder="0"
        />
      </div>
    </div>
  );
};

export default CurrencyInput;