import { useCallback, useState } from 'react';

import { validateResetPasswordFields } from '@services/passwordReset/resetPasswordValidation';

interface ResetPasswordFormState {
  newPassword: string;
  confirmPassword: string;
  newPasswordError: string | null;
  confirmPasswordError: string | null;
}

export interface UseResetPasswordFormReturn {
  form: ResetPasswordFormState;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  validateForm: () => boolean;
  resetErrors: () => void;
  setSubmitError: (message: string | null) => void;
  submitError: string | null;
}

export function useResetPasswordForm(): UseResetPasswordFormReturn {
  const [form, setForm] = useState<ResetPasswordFormState>({
    newPassword: '',
    confirmPassword: '',
    newPasswordError: null,
    confirmPasswordError: null,
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setNewPassword = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      newPassword: value,
      newPasswordError: null,
      confirmPasswordError: null,
    }));
    setSubmitError(null);
  }, []);

  const setConfirmPassword = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      confirmPassword: value,
      confirmPasswordError: null,
    }));
    setSubmitError(null);
  }, []);

  const resetErrors = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      newPasswordError: null,
      confirmPasswordError: null,
    }));
    setSubmitError(null);
  }, []);

  const validateForm = useCallback((): boolean => {
    const result = validateResetPasswordFields(form.newPassword, form.confirmPassword);
    if (!result.isValid) {
      setForm((prev) => ({ ...prev, ...result.fieldErrors }));
      return false;
    }
    return true;
  }, [form.newPassword, form.confirmPassword]);

  return {
    form,
    setNewPassword,
    setConfirmPassword,
    validateForm,
    resetErrors,
    setSubmitError,
    submitError,
  };
}
