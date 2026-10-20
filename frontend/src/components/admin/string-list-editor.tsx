"use client";

import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Editable ordered list of short strings (responsibilities, achievements). */
export function StringListEditor({
  value,
  onChange,
  placeholder,
  addLabel = "Add item",
  maxItems = 30,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  maxItems?: number;
}) {
  const update = (i: number, text: string) => onChange(value.map((v, j) => (j === i ? text : v)));
  const remove = (i: number) => onChange(value.filter((_, j) => j !== i));
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value];
    [next[i], next[i + dir]] = [next[i + dir], next[i]];
    onChange(next);
  };

  return (
    <div className="grid gap-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-1">
          <Input value={item} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} maxLength={500} aria-label={`Item ${i + 1}`} />
          <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
            <ArrowUp />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down">
            <ArrowDown />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove">
            <X />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => onChange([...value, ""])} disabled={value.length >= maxItems}>
        <Plus /> {addLabel}
      </Button>
    </div>
  );
}

/** Drops blank rows before saving. */
export const cleanList = (items: string[]) => items.map((s) => s.trim()).filter(Boolean);
