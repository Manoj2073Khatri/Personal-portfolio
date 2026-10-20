"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
      <h1 className="font-medium">This page couldn’t load</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {error.message || "The CMS API returned an error."} Check that the API is running, then try again.
      </p>
      <Button className="mt-4" size="sm" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
