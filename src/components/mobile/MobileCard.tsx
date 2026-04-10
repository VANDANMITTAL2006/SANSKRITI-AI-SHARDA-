import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export function MobileCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/20 backdrop-blur-xl transition-all duration-300 ease-out hover:scale-[1.01] hover:border-[#C9A84C]/20 hover:shadow-[#C9A84C]/10 active:scale-95",
        className,
      )}
    >
      {children}
    </div>
  );
}
