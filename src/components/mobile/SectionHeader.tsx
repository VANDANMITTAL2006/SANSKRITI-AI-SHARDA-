import { type ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function SectionHeader({ title, subtitle, right }: Props) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-wide text-gold">{title}</h1>
        {subtitle ? <p className="mt-1 text-base text-gray-300">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}
