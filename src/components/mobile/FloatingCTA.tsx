type Props = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export function FloatingCTA({ label, onClick, disabled }: Props) {
  return (
    <div className="sticky bottom-[88px] z-30 mt-4 px-1">
      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="glow min-h-[48px] w-full rounded-2xl bg-gold px-4 font-semibold text-black transition active:scale-[0.99] disabled:opacity-60"
      >
        {label}
      </button>
    </div>
  );
}
