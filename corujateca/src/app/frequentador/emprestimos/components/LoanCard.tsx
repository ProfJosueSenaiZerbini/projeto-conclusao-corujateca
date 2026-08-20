type Loan = {
  title: string;
  author: string;
  status: string;
  expiration: string;
  loanDate: string;
};

export default function LoanCard({ loan }: { loan: Loan }) {
  return (
    <div className="rounded-2xl bg-brand-400 px-6 py-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

        {/* Esquerda */}
        <div>
          <h3 className="text-2xl font-bold text-text-inverse">
            {loan.title}
          </h3>

          <p className="text-sm text-text-inverse mb-4">
            {loan.author}
          </p>

          <span className="inline-flex rounded-full bg-brand-700 px-4 py-1 text-sm font-semibold text-text-inverse">
            {loan.status}
          </span>
        </div>

        {/* Direita */}
        <div className="space-y-2 text-sm text-text-inverse">
          <div className="flex items-center gap-2">
            <p>
              <strong>Data de Expiração</strong> {loan.expiration}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <p>
              <strong>Data do Empréstimo:</strong> {loan.loanDate}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}