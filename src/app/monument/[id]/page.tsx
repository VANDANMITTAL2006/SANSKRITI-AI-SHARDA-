import { monumentById } from "@/lib/monumentStore";

export default async function MonumentDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const monument = monumentById(id);

  return (
    <section className="space-y-4 rounded-2xl border border-white/10 bg-[var(--bg-card)]/70 p-6">
      <h1 className="font-serif text-4xl text-gold">{monument.name}</h1>
      <p className="text-sm text-cream/80">{monument.location}</p>
      <p>{monument.description}</p>

      <div>
        <h2 className="mb-2 font-semibold text-teal">Exploration Zones</h2>
        <div className="grid gap-2 md:grid-cols-2">
          {monument.zones.map((z) => (
            <div key={z.id} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
              <p className="font-medium">{z.name}</p>
              <p className="text-cream/70">{z.arrivalFact}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
