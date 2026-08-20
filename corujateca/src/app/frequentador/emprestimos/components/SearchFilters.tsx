export default function SearchFilters() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="date"
        className="w-full rounded-lg border border-brand-300 bg-background px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-brand-400"
      />

      <select className="w-full rounded-lg border border-brand-300 bg-background px-4 py-3 text-text-primary outline-none focus:ring-2 focus:ring-brand-400">
        <option>Status</option>
        <option>Em andamento</option>
        <option>Expirado</option>
        <option>Devolvido</option>
      </select>
    </div>
  );
}