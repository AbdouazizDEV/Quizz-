import { useCallback, useEffect, useState } from 'react';

import type { PersonalInfoFormValues } from '@app-types/personalInfo.types';
import { mapFormToUpdatePayload } from '@services/personalInfo/personalInfoMapper';
import { getPersonalInfoProvider } from '@services/personalInfo/personalInfoProviderInstance';
import { useAuthStore } from '@stores/authStore';

export function usePersonalInfo() {
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState<PersonalInfoFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!token?.trim()) {
      setForm(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const values = await getPersonalInfoProvider().load();
      setForm(values);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateField = useCallback(
    <K extends keyof PersonalInfoFormValues>(key: K, value: PersonalInfoFormValues[K]) => {
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
      setSaved(false);
    },
    [],
  );

  const save = useCallback(async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      const next = await getPersonalInfoProvider().save(mapFormToUpdatePayload(form));
      setForm(next);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setSaving(false);
    }
  }, [form]);

  return { form, loading, saving, error, saved, updateField, save, reload: load };
}
