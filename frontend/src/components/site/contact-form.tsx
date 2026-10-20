"use client";

import { useActionState } from "react";
import { submitContact, type ContactState } from "@/lib/cms/contact-action";
import { cn } from "@/lib/utils";

const inputClass =
  "block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:ring-2 focus:ring-highlight/60 focus:outline-hidden aria-invalid:border-red-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:placeholder:text-neutral-500";

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[0]}</p>;
}

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContact, { status: "idle" });

  if (state.status === "sent") {
    return (
      <p role="status" className="rounded-lg border border-gray-200 p-4 text-sm text-gray-700 dark:border-neutral-700 dark:text-neutral-300">
        Thanks — your message was sent. I’ll reply by email.
      </p>
    );
  }

  const errors = state.fieldErrors ?? {};
  return (
    <form action={action} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="mb-1 block text-xs text-gray-500 dark:text-neutral-500">
            Name
          </label>
          <input id="contact-name" name="name" required maxLength={100} autoComplete="name" aria-invalid={!!errors.name} className={inputClass} />
          <FieldError errors={errors.name} />
        </div>
        <div>
          <label htmlFor="contact-email" className="mb-1 block text-xs text-gray-500 dark:text-neutral-500">
            Email
          </label>
          <input id="contact-email" name="email" type="email" required maxLength={254} autoComplete="email" aria-invalid={!!errors.email} className={inputClass} />
          <FieldError errors={errors.email} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="mb-1 block text-xs text-gray-500 dark:text-neutral-500">
          Message
        </label>
        <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={4} aria-invalid={!!errors.message} className={cn(inputClass, "resize-y")} />
        <FieldError errors={errors.message} />
      </div>
      {/* Honeypot: hidden from people, often filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-900 focus-visible:ring-2 focus-visible:ring-highlight focus-visible:outline-hidden disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-200"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-gray-500 dark:text-neutral-500">Your details are only used to reply to you.</p>
      </div>
      {state.status === "error" && state.message && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
