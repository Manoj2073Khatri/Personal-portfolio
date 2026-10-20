"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { CmsApiError } from "@/lib/cms/errors";
import { adminApi, errorMessage } from "./api-client";

interface Options<V, E> {
  /** Collection endpoint relative to /api/admin, e.g. "projects". */
  endpoint: string;
  /** Existing record id; omitted when creating. */
  id?: string;
  /** Singleton resource (e.g. settings): always PATCH `endpoint` itself. */
  singleton?: boolean;
  /** Converts form values to the API payload. */
  toPayload: (values: V) => unknown;
  /** Admin route of the collection; after creating, navigates to `${basePath}/<id>`. */
  basePath?: string;
  onSaved?: (entity: E) => void;
}

/**
 * Form state + save for admin editors. Backend validation errors arrive as
 * `{ errors: { field: [messages] } }` and are mapped onto fields.
 */
export function useEntityForm<V extends Record<string, unknown>, E extends object>(
  initial: V,
  { endpoint, id, singleton, toPayload, basePath, onSaved }: Options<V, E>,
) {
  const router = useRouter();
  const [values, setValues] = useState<V>(initial);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [dirty, setDirty] = useState(false);

  const set = useCallback(<K extends keyof V>(key: K, value: V[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    setDirty(true);
    setFieldErrors((errs) => {
      if (!errs[key as string]) return errs;
      const next = { ...errs };
      delete next[key as string];
      return next;
    });
  }, []);

  const save = useCallback(
    async (overrides: Partial<V> = {}) => {
      const next = { ...values, ...overrides };
      setSaving(true);
      setFormError(null);
      setFieldErrors({});
      try {
        const payload = toPayload(next);
        const entity = singleton
          ? await adminApi.patch<E>(endpoint, payload)
          : id
            ? await adminApi.patch<E>(`${endpoint}/${id}`, payload)
            : await adminApi.post<E>(endpoint, payload);
        setValues(next);
        setDirty(false);
        setSavedAt(new Date());
        onSaved?.(entity);
        const createdId = (entity as { id?: string }).id;
        if (!id && basePath && createdId) router.replace(`${basePath}/${createdId}`);
        router.refresh();
        return entity;
      } catch (error) {
        if (error instanceof CmsApiError && Object.keys(error.fieldErrors).length) {
          setFieldErrors(error.fieldErrors);
          setFormError("Fix the highlighted fields and save again.");
        } else {
          setFormError(errorMessage(error));
        }
        return null;
      } finally {
        setSaving(false);
      }
    },
    [values, toPayload, id, singleton, endpoint, basePath, onSaved, router],
  );

  /** First error for a field, including nested paths such as `socialLinks.0.url`. */
  const errorFor = (key: string) =>
    fieldErrors[key]?.[0] ??
    Object.entries(fieldErrors).find(([k]) => k.startsWith(`${key}.`))?.[1]?.[0];

  return { values, set, save, saving, savedAt, dirty, formError, fieldErrors, errorFor };
}

/** `<input type="date">` value from an ISO string. */
export function toDateInput(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : "";
}

/** ISO string (midnight UTC) from a date input, or null when cleared. */
export function fromDateInput(value: string): string | null {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null;
}

/** Empty strings become null so optional nullable columns are cleared, not set to "". */
export function nullIfEmpty(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}
