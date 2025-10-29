/**
 * @file Form handling hook to reduce duplication
 */
import { useState, ChangeEvent, FormEvent, useCallback } from 'react';

export interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const fieldValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    setValues((prev) => ({ ...prev, [name]: fieldValue }));
    
    // Clear error when user starts typing
    if (errors[name as keyof T]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }, [errors]);

  const handleBlur = useCallback((
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    
    // Validate on blur if validator provided
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name as keyof T]) {
        setErrors((prev) => ({ ...prev, [name]: validationErrors[name as keyof T] }));
      }
    }
  }, [validate, values]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      
      // Validate all fields
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length > 0) {
          // Mark all fields as touched to show errors
          const allTouched = Object.keys(values).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
          );
          setTouched(allTouched);
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback(<K extends keyof T>(
    field: K,
    error: string
  ) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
  };
}
