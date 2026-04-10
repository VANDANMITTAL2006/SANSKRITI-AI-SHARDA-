import { useUser } from "../../lib/userContext";

export function MetricsRow() {
  const { profile, badges } = useUser();
  const unlocked = badges.filter((b) => b.unlocked).length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
        <p className="text-xs text-cream/70">Total XP</p>
        <p className="text-2xl font-bold text-gold">{profile?.total_xp ?? 0}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
        <p className="text-xs text-cream/70">Monuments Visited</p>
        <p className="text-2xl font-bold text-teal">{profile?.monuments_visited?.length ?? 0}</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-[var(--bg-card)]/70 p-4">
        <p className="text-xs text-cream/70">Badges</p>
        <p className="text-2xl font-bold text-rust">{unlocked}</p>
      </div>
    </div>
  );
}
