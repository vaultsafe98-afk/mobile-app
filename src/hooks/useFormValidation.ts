import { useState, useCallback } from 'react';
import { FormValidator, ValidationResult } from '../utils/validation';

interface UseFormValidationOptions {
  validator: FormValidator;
  initialValues: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
}

interface UseFormValidationReturn {
  values: Record<string, any>;
  errors: Record<string, string>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: (field: string, value: any) => void;
  setError: (field: string, error: string) => void;
  clearError: (field: string) => void;
  validateField: (field: string) => boolean;
  validateForm: () => boolean;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}

export const useFormValidation = ({
  validator,
  initialValues,
  onSubmit,
}: UseFormValidationOptions): UseFormValidationReturn => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback((field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateField = useCallback((field: string): boolean => {
    const error = validator.validateField(field, values[field]);
    if (error) {
      setError(field, error);
      return false;
    } else {
      clearError(field);
      return true;
    }
  }, [validator, values, setError, clearError]);

  const validateForm = useCallback((): boolean => {
    const result: ValidationResult = validator.validateForm(values);
    setErrors(result.errors);
    return result.isValid;
  }, [validator, values]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, values]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setIsSubmitting(false);
  }, [initialValues]);

  const isValid = Object.keys(errors).length === 0 && 
    Object.values(values).every(value => value !== '' && value != null);

  return {
    values,
    errors,
    isValid,
    isSubmitting,
    setValue,
    setError,
    clearError,
    validateField,
    validateForm,
    handleSubmit,
    resetForm,
  };
};
