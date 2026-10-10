"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";

const perguntasFrequentes = [
  {
    pergunta:
      "O que fazer quando o ISBN não encontra o livro ao tentar cadastrá-lo?",
    resposta:
      "O livro provavelmente não está disponível na ISBN inserida ou ocorreu um erro de digitação no momento da inserção dos números desse código. Tente inserir o ISBN novamente com cuidado, ou digite manualmente as informações do livro para catalogá-lo no Acervo.",
  },
  {
    pergunta:
      "Como posso adicionar um novo exemplar de um livro que já foi cadastrado?",
    resposta:
      "Para adicionar novos exemplares a um livro que já foi cadastrado no Acervo, siga os passos: Abra a aba Acervo, pesquise pelo livro que desejar adicionar um exemplar e acesse a obra clicando em sua capa. Com a página das informações específicas da obra aberta, procure pelo botão 'Cadastrar Nova Cópia'. A partir dai, uma nova tela será aberta com as informações necessárias para registrar um novo exemplar. Então, com isso em mente, preencha os dados de acordo com a sua necessidade e clique em 'Cadastrar Cópias' para efetuar a catalogação.",
  },
  {
    pergunta:
      "Qual é a diferença entre 'cadastrar um livro' e 'cadastrar um exemplar'?",
    resposta:
      "'Cadastrar um livro' significa adicionar uma nova obra ao sistema, enquanto 'cadastrar um exemplar' significa adicionar uma nova cópia física de uma obra que já está catalogada na biblioteca. Assim, se a biblioteca possui vários exemplares de um mesmo livro, cada um pode ser emprestado individualmente.",
  },
  {
    pergunta: "Como altero as informações de um livro já cadastrado?",
    resposta:
      "Para alterar as informações de um livro que já foi cadastrado, siga os passos: Abra a aba Acervo, pesquise pelo livro que desejar editar e acesse a obra clicando em sua capa. Na página de informações específicas do livro, procure pelo botão 'Atualizar Livro'. Uma janela irá se abrir contendo informações como título, nome do autor, gênero, editora, ano de publicação da edição, localização nas prateleiras da biblioteca, a imagem da capa e a sinopse da obra. Quando terminar as edições nos campos desejados, clique em 'Salvar Alterações'.",
  },
  {
    pergunta: "O que acontece com os exemplares quando um livro é desativado?",
    resposta:
      "Ao interagir com a disponibilidade de um livro, os exemplares dessa obra apresentarão um comportamento similar. Portanto, se você desativar um livro com exemplares catalogados, esses exemplares também serão desativados. Igualmente, se um livro com status de desativado for reativado, as suas cópias serão reativadas em conjunto.",
  },
  {
    pergunta:
      "O que devo fazer quando a capa ou outras informações preenchidas estão incorretas?",
    resposta:
      "Quando a catalogação de um livro a partir da ISBN apresenta informações incorretas, você pode atualizar os dados problemáticos ao clicar no botão “Atualizar Livro” presente na página das informações específicas de uma obra (que é aberta ao clicar em sua capa na aba Acervo). Seguidos os passos, localize o campo incorreto e o corrija antes de apertar em 'Salvar Alterações'.",
  },
  {
    pergunta: "Como reativo um livro que foi desativado?",
    resposta:
      "Para reativar/desativar uma obra, siga os passos: Abra a aba Acervo, encontre o botão 'Reativar livro' e espere as informações da nova tela carregarem. Nessa tela, encontre o livro desativado, selecione essa obra e aperte em 'Reativar livro'. Igualmente, para desativar um livro, volte para a aba Acervo, encontre a obra que deseja desativar e clique em sua capa, abrindo a tela de informações específicas do mesmo. Com a tela aberta, encontre o botão 'Excluir livro' e confirme a ação.",
  },
  {
    pergunta: "Como bibliotecário, posso cancelar uma multa?",
    resposta:
      "Sim. Abra a aba Multas, procure a multa que deseja fazer tal ação e clique no botão 'Cancelar'. Tenha em mente que isso deve ser feito apenas em situações de extrema necessidade ou uso incorreto da aplicação das multas, fornecendo uma explicação clara e sensata do motivo do cancelamento.",
  },
  {
    pergunta:
      "Por que um livro pode estar cadastrado sem nenhum exemplar disponível?",
    resposta:
      "O cadastro de um livro representa a obra, independentemente de haver exemplares disponíveis para empréstimo. A biblioteca pode cadastrar uma obra antes que suas cópias estejam disponíveis para circulação, como no caso de livros recém-chegados ao acervo. Assim, o livro pode permanecer cadastrado mesmo quando não há nenhum exemplar disponível.",
  },
  {
    pergunta: "O que faço quando um livro emprestado foi extraviado?",
    resposta:
      "Em caso de perda de livros, você precisa aplicar uma multa de extravio no sistema, na qual possui uma penalidade mínima de 30 dias em que o frequentador não poderá realizar novos empréstimos. Para aplicar essa multa, siga os passos: Abra a aba Multas, localize e aperte o botão 'Cadastrar Nova Multa', insira as informações necessárias para a catalogação da multa no sistema e aperte no botão 'Cadastrar multa'. Com o registro da situação na aplicação, o histórico é salvo. Dessa forma, o bibliotecário deve comunicar a gerência ou a coordenação do estabelecimento para avaliar as medidas cabíveis no cenário, assim como uma possível compensação pela perda do patrimônio.",
  },
];

export default function AjudaBibli() {
  const [nomeUsuario, setNomeUsuario] = useState("Visitante");
  const [indexAberto, setIndexAberto] = useState<number | null>(null);

  useEffect(() => {
    const session = getSession();
    if (session?.nome) {
      setNomeUsuario(session.nome);
    }
  }, []);

  const alternarPergunta = (id: number) => {
    if (indexAberto === id) {
      setIndexAberto(null);
    } else {
      setIndexAberto(id);
    }
  };
  /*Parte da Maria */
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex flex-1">
          <Nav />

          <main
            className="
                        flex-1
                        min-w-0
                        p-6
                    "
          >
            {/* 🖥️ Mudamos de min-h-screen comum para uma estrutura flexível que joga o footer para baixo */}
            <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-brand-800)] antialiased font-sans">
              {/* Seção de Categorias - Adicionado flex-grow para empurrar o rodapé */}
              <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12">
                <section className="mb-6">
                  <p className="text-base sm:text-lg text-[var(--color-text-primary)]">
                    Olá, <strong className="font-bold">{nomeUsuario}</strong>
                  </p>
                </section>

                <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
                  Perguntas Frequentes
                </h3>

                {/* 🛠️ AQUI: O flex-col junta a lista inteira, e o index funciona sem BO dentro do .map */}
                <div className="flex flex-col gap-4">
                  {perguntasFrequentes.map((item, index) => {
                    const estaAberto = indexAberto === index;

                    return (
                      <div
                        key={index}
                        className="bg-[var(--color-brand-300)] border border-[var(--color-brand-400)] rounded-xl overflow-hidden shadow-sm transition-all duration-300 w-full"
                      >
                        {/* Botão com a Pergunta */}
                        <button
                          onClick={() => alternarPergunta(index)}
                          className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-brand-400)] text-left transition-all group"
                        >
                          <span className="text-[var(--color-brand-600)] group-hover:text-[var(--color-brand-800)] font-medium text-sm md:text-base pr-4">
                            {item.pergunta}
                          </span>
                          <ArrowRight
                            className={`h-4 w-4 text-[var(--color-brand-500)] group-hover:text-[var(--color-brand-700)] transition-transform duration-300 flex-shrink-0 ${
                              estaAberto
                                ? "rotate-90 text-[var(--color-brand-700)]"
                                : ""
                            }`}
                          />
                        </button>

                        {/* Resposta curta que aparece ao clicar */}
                        {estaAberto && (
                          <div className="px-4 pt-3 pb-4 pt-1 text-sm md:text-base text-[var(--color-brand-800)] border-t border-[var(--color-brand-400)] bg-[var(--color-background)]">
                            <p className="leading-relaxed font-normal">
                              {item.resposta}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}
