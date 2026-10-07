"use client";

type SearchFiltersProps = {
  status: string;
  data: string;
  onStatusChange: (status: string) => void;
  onDataChange: (data: string) => void;
};

export default function SearchFilters({
  status,
  data,
  onStatusChange,
  onDataChange,
}: SearchFiltersProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <input
        type="date"
        value={data}
        onChange={(e) => onDataChange(e.target.value)}
        className="w-full cursor-pointer rounded-2xl border border-gray-300 bg-white px-5 py-3 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
      />

      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`w-full cursor-pointer appearance-none rounded-2xl border border-gray-300 bg-white px-5 py-3 outline-none focus:ring-2 focus:ring-brand-500 bg-[right_1.25rem_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=UTF-8,<svg%20xmlns="http://www.w3.org/2000/svg"%20width="16"%20height="16"%20viewBox="0%200%2024%2024"%20fill="none"%20stroke="%239e8a78"%20stroke-width="2"%20stroke-linecap="round"%20stroke-linejoin="round"><path%20d="m6%209%206%206%206-6"/></svg>')] ${
          status === "" ? "text-brand-600/50" : "text-brand-600"
        }`}
      >
        <option value="" className="text-brand-600">
          Todos os status
        </option>

        <option value="em_andamento" className="text-brand-600">
          Em andamento
        </option>

        <option value="expirado" className="text-brand-600">
          Expirado
        </option>

        <option value="devolvido" className="text-brand-600">
          Devolvido
        </option>
      </select>
    </div>
  );
}
