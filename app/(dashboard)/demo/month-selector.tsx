"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function MonthSelector({ month }: { month: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-3 rounded-full border border-border bg-background/80 px-4 py-2 text-sm text-muted-foreground">
      <span className="font-medium text-foreground">Mes de trabajo</span>
      <input
        type="month"
        name="month"
        value={month}
        className="rounded-full border border-border bg-transparent px-3 py-1 text-sm focus-visible:outline-none"
        onChange={(event) => {
          const value = event.currentTarget.value;
          const params = new URLSearchParams(searchParams?.toString());
          params.set("month", value);
          startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
          });
        }}
        disabled={isPending}
      />
    </label>
  );
}
