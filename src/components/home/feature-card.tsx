import Link from "next/link";

type Props = {
  title: string;
  description: string;
  href: string;
};

export function FeatureCard({ title, description, href }: Props) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-[var(--bg-card)]/80 p-5 transition hover:-translate-y-0.5 hover:border-gold/70"
    >
      <h3 className="font-serif text-xl text-gold">{title}</h3>
      <p className="mt-2 text-sm text-cream/80">{description}</p>
      <span className="mt-3 inline-block text-xs text-teal">Open</span>
    </Link>
  );
}
