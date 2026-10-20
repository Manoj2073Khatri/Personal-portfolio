import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";

export interface ToolbarFilter {
  name: string;
  label: string;
  value?: string;
  options: { value: string; label: string }[];
}

/** GET form, so filters live in the URL and survive reloads and sharing. */
export function ListToolbar({
  q,
  filters = [],
  hidden = {},
}: {
  q?: string;
  filters?: ToolbarFilter[];
  /** Params to keep when the form is submitted (e.g. the active tab). */
  hidden?: Record<string, string>;
}) {
  return (
    <form role="search" className="mb-4 flex flex-col gap-2 sm:flex-row">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input name="q" defaultValue={q} placeholder="Search…" aria-label="Search" className="pl-9" maxLength={100} />
      </div>
      {filters.map((f) => (
        <NativeSelect key={f.name} name={f.name} defaultValue={f.value ?? ""} aria-label={f.label} className="sm:w-44">
          <option value="">All {f.label.toLowerCase()}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </NativeSelect>
      ))}
      <Button type="submit" variant="secondary">
        Apply
      </Button>
    </form>
  );
}

export const STATUS_FILTER_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "ARCHIVED", label: "Archived" },
];
