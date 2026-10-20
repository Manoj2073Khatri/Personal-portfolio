"use client";

import { FormActions } from "@/components/admin/form-actions";
import { Field, FormSection } from "@/components/admin/form-fields";
import { MediaPicker } from "@/components/admin/media-picker";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { fromDateInput, nullIfEmpty, toDateInput, useEntityForm } from "@/lib/admin/use-entity-form";
import type { ContentStatus, Credential, CredentialKind, MediaRef } from "@/lib/cms/types";

type Values = {
  kind: CredentialKind;
  institution: string;
  title: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  credentialUrl: string;
  credentialId: string;
  description: string;
  logo: MediaRef | null;
  sortOrder: number;
  status: ContentStatus;
};

const initial = (c?: Credential, kind: CredentialKind = "EDUCATION"): Values => ({
  kind: c?.kind ?? kind,
  institution: c?.institution ?? "",
  title: c?.title ?? "",
  field: c?.field ?? "",
  location: c?.location ?? "",
  startDate: toDateInput(c?.startDate),
  endDate: toDateInput(c?.endDate),
  credentialUrl: c?.credentialUrl ?? "",
  credentialId: c?.credentialId ?? "",
  description: c?.description ?? "",
  logo: c?.logo ?? null,
  sortOrder: c?.sortOrder ?? 0,
  status: c?.status ?? "PUBLISHED",
});

const toPayload = (v: Values) => ({
  kind: v.kind,
  institution: v.institution.trim(),
  title: v.title.trim(),
  field: nullIfEmpty(v.field),
  location: nullIfEmpty(v.location),
  startDate: fromDateInput(v.startDate),
  endDate: fromDateInput(v.endDate),
  credentialUrl: nullIfEmpty(v.credentialUrl),
  credentialId: nullIfEmpty(v.credentialId),
  description: v.description,
  logoId: v.logo?.id ?? null,
  sortOrder: Number(v.sortOrder) || 0,
  status: v.status,
});

export function CredentialForm({ credential, defaultKind }: { credential?: Credential; defaultKind?: CredentialKind }) {
  const form = useEntityForm<Values, Credential>(initial(credential, defaultKind), {
    endpoint: "credentials",
    id: credential?.id,
    toPayload,
    basePath: "/admin/education",
  });
  const { values: v, set, errorFor } = form;
  const isCert = v.kind === "CERTIFICATION";

  return (
    <form onSubmit={(e) => { e.preventDefault(); void form.save(); }} className="grid gap-6">
      <FormSection title={isCert ? "Certification" : "Education"}>
        <Field label="Type" error={errorFor("kind")}>
          {(p) => (
            <NativeSelect {...p} value={v.kind} onChange={(e) => set("kind", e.target.value as CredentialKind)} className="sm:w-56">
              <option value="EDUCATION">Education</option>
              <option value="CERTIFICATION">Certification</option>
            </NativeSelect>
          )}
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={isCert ? "Issuing organisation" : "Institution"} required error={errorFor("institution")}>
            {(p) => <Input {...p} value={v.institution} onChange={(e) => set("institution", e.target.value)} maxLength={150} required />}
          </Field>
          <Field label={isCert ? "Certificate" : "Qualification"} required error={errorFor("title")}>
            {(p) => <Input {...p} value={v.title} onChange={(e) => set("title", e.target.value)} maxLength={200} required />}
          </Field>
          <Field label="Field of study" error={errorFor("field")}>
            {(p) => <Input {...p} value={v.field} onChange={(e) => set("field", e.target.value)} maxLength={150} />}
          </Field>
          <Field label="Location" error={errorFor("location")}>
            {(p) => <Input {...p} value={v.location} onChange={(e) => set("location", e.target.value)} maxLength={150} />}
          </Field>
          <Field label="Start date" error={errorFor("startDate")}>
            {(p) => <Input {...p} type="date" value={v.startDate} onChange={(e) => set("startDate", e.target.value)} />}
          </Field>
          <Field label={isCert ? "Issue date" : "End date"} error={errorFor("endDate")}>
            {(p) => <Input {...p} type="date" value={v.endDate} onChange={(e) => set("endDate", e.target.value)} />}
          </Field>
          <Field label="Credential URL" hint="Link where the credential can be verified." error={errorFor("credentialUrl")}>
            {(p) => <Input {...p} type="url" value={v.credentialUrl} onChange={(e) => set("credentialUrl", e.target.value)} placeholder="https://" />}
          </Field>
          <Field label="Credential ID" error={errorFor("credentialId")}>
            {(p) => <Input {...p} value={v.credentialId} onChange={(e) => set("credentialId", e.target.value)} maxLength={100} />}
          </Field>
          <Field label="Display order" error={errorFor("sortOrder")}>
            {(p) => <Input {...p} type="number" value={v.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} />}
          </Field>
        </div>
        <Field label="Description" error={errorFor("description")}>
          {(p) => <Textarea {...p} value={v.description} onChange={(e) => set("description", e.target.value)} maxLength={1000} rows={2} />}
        </Field>
        <Field label="Logo" error={errorFor("logoId")}>
          {() => <MediaPicker value={v.logo} onChange={(m) => set("logo", m)} />}
        </Field>
      </FormSection>
      <FormActions
        status={v.status}
        onStatusChange={(s) => set("status", s)}
        onSave={(o) => { if (o?.status) set("status", o.status); void form.save(o); }}
        saving={form.saving}
        dirty={form.dirty}
        savedAt={form.savedAt}
        formError={form.formError}
        isNew={!credential}
      />
    </form>
  );
}
