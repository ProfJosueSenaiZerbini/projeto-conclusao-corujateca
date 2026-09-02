import { revalidatePath } from "next/cache";

import { db } from "@/app/db";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

async function cancelarMulta(formData: FormData) {
  "use server";

  const idMulta = Number(formData.get("id_multa"));

  if (!idMulta) {
    return;
  }

  const multa = await db.multa.findUnique({
    where: { id_multa: idMulta },
    include: { frequentador: true },
  });

  if (!multa) {
    return;
  }

  await db.multa.update({
    where: { id_multa: idMulta },
    data: { inativo_multa: true },
  });

  await db.frequentador.update({
    where: { id_freq: multa.fk_frequentador_id_frequentador },
    data: { suspensao_freq: false },
  });

  revalidatePath("/bibliotecario/multas");
}

function formatarData(data: Date | string | null) {
  if (!data) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(data));
}

export default async function MultasPage() {
  const multas = await db.multa.findMany({
    where: { inativo_multa: false },
    include: {
      frequentador: true,
    },
    orderBy: {
      dta_inicio_multa: "desc",
    },
  });

  type MultaView = {
    id: number;
    usuario: string;
    diasPunicao: number;
    status: string;
    tipo: string;
    data: string;
  };

  const multasFormatadas: MultaView[] = multas.map((multa) => ({
    id: multa.id_multa,
    usuario: multa.frequentador.nome_freq,
    diasPunicao: Math.max(
      1,
      Math.ceil(
        (new Date(multa.dta_termino_multa).getTime() -
          new Date(multa.dta_inicio_multa).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    ),
    status: multa.inativo_multa ? "Cancelada" : "Pendente",
    tipo: multa.tipomulta,
    data: formatarData(multa.dta_inicio_multa),
  }));

  const atrasosAtivos = multas.filter((multa) => multa.tipomulta.toUpperCase() === "ATRASO").length;
  const depredacoesAtivas = multas.filter((multa) => multa.tipomulta.toUpperCase() === "DEPREDAÇÃO").length;
  const extraviosAtivos = multas.filter((multa) => multa.tipomulta.toUpperCase() === "EXTRAVIO").length;

  return (
    <div className="flex min-h-screen flex-col bg-(--color-background)">
      <Header />

      <div className="flex min-w-0 flex-1">
        <Nav />

        <main
          className="
            min-w-0
            flex-1
            p-3
            sm:p-5
            md:p-6
            lg:p-8
            xl:p-10
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-7xl
              space-y-6
              sm:space-y-8
            "
          >
            <section
              className="
                grid
                grid-cols-1
                gap-3
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md sm:min-h-[140px] sm:p-4 lg:min-h-[160px]">
                <h2 className="max-w-xs font-semibold leading-snug sm:text-base lg:text-lg">
                  Multas de Atraso
                  <br />
                  Ativas:
                </h2>
                <span className="mt-1 text-3xl font-bold md:text-4xl xl:text-5xl">
                  {atrasosAtivos}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md sm:min-h-[140px] sm:p-4 lg:min-h-[160px]">
                <h2 className="max-w-xs font-semibold leading-snug sm:text-base lg:text-lg">
                  Multas de Depredação
                  <br />
                  Ativas:
                </h2>
                <span className="mt-1 text-3xl font-bold md:text-4xl xl:text-5xl">
                  {depredacoesAtivas}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl bg-brand-500 p-3 text-center text-text-inverse shadow-md sm:min-h-[140px] sm:p-4 lg:min-h-[160px]">
                <h2 className="max-w-xs font-semibold leading-snug sm:text-base lg:text-lg">
                  Multas de Extravio
                  <br />
                  Ativas:
                </h2>
                <span className="mt-1 text-3xl font-bold md:text-4xl xl:text-5xl">
                  {extraviosAtivos}
                </span>
              </div>
            </section>

            <div className="flex justify-center">
              <button
                type="button"
                className="w-full max-w-md rounded-2xl bg-[var(--color-button-primary)] px-6 py-3 text-base font-bold text-text-inverse shadow-md transition hover:brightness-110 hover:shadow-lg active:scale-[0.98] sm:py-4 sm:text-lg"
              >
                Cadastrar Nova Multa
              </button>
            </div>

            <section className="rounded-3xl bg-brand-200 p-4 shadow-sm sm:p-5 md:p-6 lg:p-8">
              <h1 className="mb-5 text-xl font-bold text-(--color-text-primary) sm:text-2xl lg:text-3xl">
                Pesquisar por Multas
              </h1>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Nome do Usuário"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-brand-600 placeholder:text-brand-600/50 outline-none focus:ring-2 focus:ring-brand-500 sm:py-4"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <input
                  type="date"
                  placeholder="Por data"
                  className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-3 text-brand-600 placeholder:text-brand-600/50 outline-none focus:ring-2 focus:ring-brand-500 sm:py-4"
                />

                <select
                  defaultValue=""
                  className="w-full appearance-none rounded-2xl border border-gray-300 bg-white px-5 py-3 text-brand-600 outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer sm:py-4"
                >
                  <option value="" disabled hidden>
                    Por Status
                  </option>
                  <option value="Pendente">Pendente</option>
                  <option value="Paga">Paga</option>
                </select>
              </div>

              <div className="mt-6 flex flex-col gap-4">
                {multasFormatadas.map((multa: MultaView) => (
                  <form key={multa.id} action={cancelarMulta} className="grid grid-cols-1 gap-5 rounded-2xl bg-brand-400 px-4 py-4 text-sm font-bold text-text-inverse sm:px-5 sm:py-5 sm:text-base lg:px-8 lg:py-6 md:grid-cols-2 md:gap-8 lg:gap-12">
                    <input type="hidden" name="id_multa" value={multa.id} />

                    <div className="space-y-2">
                      <p className="text-lg">{multa.usuario}</p>
                      <p>Dias de punição: {multa.diasPunicao} dias</p>
                      <p>Status da Multa: {multa.status}</p>
                    </div>

                    <div className="space-y-2">
                      <p>Tipo da Multa: {multa.tipo}</p>
                      <p>Data da Multa: {multa.data}</p>
                    </div>

                    <button
                      type="submit"
                      className="col-span-1 w-full rounded-xl bg-[var(--color-button-secondary)] px-4 py-3 text-sm font-bold text-text-inverse transition hover:brightness-110 active:scale-[0.99] md:col-span-2 sm:py-4 sm:text-base"
                    >
                      Cancelar
                    </button>
                  </form>
                ))}

                {multasFormatadas.length === 0 && (
                  <div className="py-8 text-center text-base text-text-inverse">
                    Nenhuma multa encontrada.
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}