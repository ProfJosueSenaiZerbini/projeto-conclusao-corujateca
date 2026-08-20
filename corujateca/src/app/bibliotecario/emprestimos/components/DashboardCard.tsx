type Props = {
  title: string;
  value: number;
};

export default function DashboardCard({ title, value }: Props) {
  return (
    <div className="bg-brand-500 text-text-inverse rounded-xl h-44 flex flex-col justify-center items-center text-center shadow-md p-6">
      <h3 className="text-xl md:text-2xl font-semibold leading-snug max-w-xs">
        {title}
      </h3>

      <span className="mt-2 text-5xl font-bold">
        {value}
      </span>
    </div>
  );
}