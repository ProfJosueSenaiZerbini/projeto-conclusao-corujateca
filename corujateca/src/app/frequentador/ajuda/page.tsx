"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { getSession } from "@/lib/auth";

const perguntasFrequentes = [
  {
    pergunta: "Por que um livro que procuro não aparece no acervo?",
    resposta:
      "O livro provavelmente não foi cadastrado ou sofreu uma desativação por diferentes motivos. Para verificar se o livro realmente não consegue ser encontrado no Acervo, utilize o filtro presente na página e pesquise por ele. Caso realmente não o encontre, o livro possivelmente não existe ou está em manutenção. Para saber como lidar com isso, questione o seu bibliotecário.",
  },
  {
    pergunta: "Como sei quando preciso devolver um livro?",
    resposta:
      "Na aba “Empréstimos”, você pode consultar empréstimos em andamento e verificar a data de devolução de cada livro. A página também informa o título, autor, status e a data de início do empréstimo. Use os filtros para localizar empréstimos por datas específicas caso esse seja o seu desejo.",
  },
  {
    pergunta: "O que acontece caso eu não devolva um livro dentro do prazo?",
    resposta:
      "A devolução após o prazo gera uma multa que aumenta a partir do primeiro dia de atraso, correspondendo ao dobro de dias em que o livro permaneceu atrasado no sistema. Por exemplo, ao atrasar a devolução de um livro por uma semana (7 dias), quando devolvê-lo, sua multa resultará em uma penalidade de 14 dias, durante o qual não será possível realizar novos empréstimos. Se você acredita que recebeu uma multa injustamente, ou que ela foi aplicada indevidamente, contate o bibliotecário.",
  },
  {
    pergunta:
      "Posso consultar as informações de um livro mesmo quando ele não possui exemplares disponíveis?",
    resposta:
      "Sim! Basta escolher um livro na aba acervo e clicar. Após isso, as informações básicas, como título, autor, editora, gênero, sinopse e número de páginas estarão disponíveis, inclusive se há exemplares a disposição.",
  },
  {
    pergunta: "Por que estou impedido de realizar um empréstimo?",
    resposta:
      "Para um problema como esse, verifique qual situação você e sua conta se encaixam: Você provavelmente está com uma multa ativa, na qual te penaliza proibindo novos empréstimos por um certo período de tempo; ou você possui dois empréstimos em seu nome enquanto tenta realizar outro. No segundo caso, o próprio sistema barra o novo empréstimos por motivos de segurança. Para maiores consultas, verifique a aba Multas e filtre por 'Pendentes', ou verifique na aba Empréstimos quantos livros são exibidos no filtro 'Em andamento'. Caso nenhuma das situações listadas acima sane o seu problema, contate o bibliotecário.",
  },
  {
    pergunta: "Como posso encontrar informações básicas da minha conta?",
    resposta:
      "Você pode encontrar as informações da sua conta clicando na foto de perfil localizada no canto superior direito. Após isso, uma pequena janela com botões como 'Configurações Perfil' e 'Log out' aparecerão. Clique em 'Configurações Perfil' e cheque as suas informações! Caso deseje modificar seu nome ou telefone, peça para um bibliotecário efetuar as mudanças requeridas.",
  },
  {
    pergunta: "Posso devolver um livro antes da data de devolução prevista?",
    resposta:
      "Sim! Você pode devolver o livro antes da data prevista. Assim, ele fica disponível para outros leitores mais rapidamente e você evita possíveis multas por atraso.",
  },
  {
    pergunta: 'O que são os livros destacados na seção "Gênero da semana"?',
    resposta:
      "A seção “Gênero da semana” destaca os livros mais emprestados de um gênero sorteado aleatoriamente. O gênero é definido a cada domingo, e tem como objetivo apresentar aos usuários novas opções de leitura e incentivar a descoberta de diferentes tipos de literatura na biblioteca.",
  },
  {
    pergunta: "Por quantos dias eu posso pegar um livro emprestado?",
    resposta:
      "Um empréstimo tem três opções de prazo: 7 dias, 15 dias e 30 dias.",
  },
  {
    pergunta: "Como posso aumentar o meu tempo de empréstimo?",
    resposta:
      "Entre em contato com o bibliotecário e peça a ele um novo empréstimo.",
  },
];

export default function AjudaFreq() {
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
