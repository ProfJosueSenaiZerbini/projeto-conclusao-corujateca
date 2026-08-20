type Props = {
  title: string;
  value: number;
};

export default function DashboardCard({ title, value }: Props) {
  return (
    <div className="bg-brand-500 text-text-inverse rounded-xl h-40 flex flex-col justify-center items-center text-center shadow-md px-6">
      <h3 className="text-xl font-medium leading-snug">
        {title}
      </h3>

      <span className="mt-3 text-5xl font-bold">
        {value}
      </span>
    </div>
  );
}