"use server";

import { headers } from "next/headers";
import { clientIpFrom } from "@/lib/auth/tokens";
import { cmsApiUrl, internalHeaders } from "./config";
import { CmsApiError } from "./errors";

export interface ContactState {
  status: "idle" | "sent" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/** Forwards the public contact form to the API with the visitor's IP for rate limiting. */
export async function submitContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const payload = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
    website: String(formData.get("website") ?? ""),
  };
  const hdrs = await headers();

  try {
    const res = await fetch(`${cmsApiUrl()}/public/contact`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": hdrs.get("user-agent") ?? "",
        ...internalHeaders(clientIpFrom(hdrs)),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.status === 429) {
      return { status: "error", message: "Too many messages from your network. Try again in a few minutes." };
    }
    if (!res.ok) {
      const error = await CmsApiError.fromResponse(res);
      return {
        status: "error",
        message: res.status === 400 ? "Check the highlighted fields." : "Your message could not be sent. Try again later.",
        fieldErrors: error.fieldErrors,
      };
    }
    return { status: "sent" };
  } catch {
    return { status: "error", message: "Your message could not be sent. Try again later." };
  }
}
