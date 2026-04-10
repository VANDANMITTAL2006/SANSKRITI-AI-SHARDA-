"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

type Item = {
  value: string;
  label: string;
};

type Props = {
  items: Item[];
  value: string;
  onValueChange: (value: string) => void;
};

export function TabSwitcher({ items, value, onValueChange }: Props) {
  return (
    <Tabs.Root value={value} onValueChange={onValueChange}>
      <Tabs.List
        className="grid min-h-[44px] gap-2 rounded-xl bg-white/5 p-1"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((item) => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            className={cn(
              "min-h-[40px] rounded-lg text-sm",
              value === item.value ? "bg-teal text-black" : "text-cream/80",
            )}
          >
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
    </Tabs.Root>
  );
}
