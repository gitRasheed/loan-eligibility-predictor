'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tooltip from './Tooltip';
import CurrencyInput from './CurrencyInput';

const EligibilityForm: React.FC = () => {
  const [formData, setFormData] = useState({
    loanTerm: 6,
    creditScore: 600,
    annualIncome: '',
    loanAmount: '',
    assetsValue: ''
  });
  const [eligibilityStatus, setEligibilityStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  const [showResult, setShowResult] = useState(false);
  const [hasCheckedOnce, setHasCheckedOnce] = useState(false);
  const resultContainerRef = useRef<HTMLDivElement>(null);
  const [resultContainerHeight, setResultContainerHeight] = useState(0);

  useEffect(() => {
    if (resultContainerRef.current && showResult && !hasCheckedOnce) {
      setResultContainerHeight(resultContainerRef.current.offsetHeight);
      setHasCheckedOnce(true);
    }
  }, [showResult, hasCheckedOnce]);

  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.annualIncome) newErrors.annualIncome = true;
    if (!formData.loanAmount) newErrors.loanAmount = true;
    if (!formData.assetsValue) newErrors.assetsValue = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setEligibilityStatus(null);
    setShowResult(false);

    try {
      const response = await fetch('/api/checkEligibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loanTerm: formData.loanTerm,
          creditScore: formData.creditScore,
          annualIncome: parseFloat(formData.annualIncome.replace(/,/g, '')),
          loanAmount: parseFloat(formData.loanAmount.replace(/,/g, '')),
          assetsValue: parseFloat(formData.assetsValue.replace(/,/g, '')),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to check eligibility');
      }

      const result = await response.json();
      setEligibilityStatus(result.eligible);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibilityStatus(null);
    } finally {
      setIsLoading(false);
      setShowResult(true);
    }
  }, [formData, validateForm]);

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: false }));
  }, []);

  const loanTermOptions = useMemo(() => [6, 12, 18, 24, 36, 48, 60], []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Tooltip text="Select the duration of your loan">
            <label className="block text-sm font-medium text-gray-300">Loan Term</label>
          </Tooltip>
          <select
            value={formData.loanTerm}
            onChange={(e) => handleInputChange('loanTerm', Number(e.target.value))}
            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-600 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md bg-gray-700 text-white"
          >
            {loanTermOptions.map((term) => (
              <option key={term} value={term}>{term} months</option>
            ))}
          </select>
        </div>

        <div>
          <Tooltip text="Your credit score affects loan eligibility">
            <label className="block text-sm font-medium text-gray-300">Credit Score: {formData.creditScore}</label>
          </Tooltip>
          <input
            type="range"
            min={300}
            max={900}
            value={formData.creditScore}
            onChange={(e) => handleInputChange('creditScore', Number(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer mt-2"
          />
        </div>
        
        <CurrencyInput
          label="Annual Income"
          value={formData.annualIncome}
          onChange={(value) => handleInputChange('annualIncome', value)}
          tooltipText="Enter your annual income before taxes"
          error={errors.annualIncome}
        />

        <CurrencyInput
          label="Loan Amount"
          value={formData.loanAmount}
          onChange={(value) => handleInputChange('loanAmount', value)}
          tooltipText="Enter the amount you wish to borrow"
          error={errors.loanAmount}
        />

        <CurrencyInput
          label="Total Assets Value"
          value={formData.assetsValue}
          onChange={(value) => handleInputChange('assetsValue', value)}
          tooltipText="Enter the total value of your assets"
          error={errors.assetsValue}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors duration-200"
        >
          {isLoading ? 'Checking...' : 'Check Eligibility'}
        </button>
        
        <div style={{ height: hasCheckedOnce ? `${resultContainerHeight}px` : 'auto' }}>
          <AnimatePresence>
            {showResult && (
              <motion.div
                ref={resultContainerRef}
                initial={hasCheckedOnce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={hasCheckedOnce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className={`mt-4 p-4 rounded-lg shadow-md ${
                  eligibilityStatus
                    ? 'bg-green-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                <p className="text-lg font-semibold text-center">
                  {eligibilityStatus ? 'Eligible for this loan!' : 'Not eligible for this loan.'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </form>
    </motion.div>
  );
};

export default EligibilityForm;