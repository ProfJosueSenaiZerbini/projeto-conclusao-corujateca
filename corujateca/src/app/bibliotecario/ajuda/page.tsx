"use client";

import { useState } from 'react';
import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ArrowRight } from 'lucide-react';


const perguntasFrequentes = [
    {
        pergunta: 'Como renovar um livro que está comigo pela internet?',
        resposta: 'Acesse o catálogo online, faça login em sua conta, vá em "Meus Empréstimos" e clique em "Renovar".'
    },
    {
        pergunta: 'Qual é o valor da multa por dia de atraso?',
        resposta: 'A multa é de R$ 2,00 por dia útil para cada livro em atraso.'
    },
    {
        pergunta: 'Como faço para indicar livros fora da biblioteca?',
        resposta: 'Preencha o formulário de "Sugestão de Compra" no nosso site ou use a caixinha física na entrada.'
  },
  {
        pergunta: 'Onde encontro a rede de Wi-Fi e as salas de estudo?',
        resposta: 'Conecte na rede "Corujateca_Livre" (sem senha). As salas de estudo ficam no segundo andar.'
    },

];

export default function AjudaBibli() {
    
    const [indexAberto, setIndexAberto] = useState<number | null>(null);

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

                    <main className="
                        flex-1
                        min-w-0
                        p-6
                    ">


                        {/* 🖥️ Mudamos de min-h-screen comum para uma estrutura flexível que joga o footer para baixo */}
                        <div className="min-h-screen flex flex-col bg-[var(--color-background)] text-[var(--color-brand-800)] antialiased font-sans">


                            {/* Seção de Categorias - Adicionado flex-grow para empurrar o rodapé */}
                            <div className="flex-grow max-w-5xl w-full mx-auto px-4 py-12">
                                <section className="mb-6">
                                    <p className="text-base sm:text-lg text-[var(--color-text-primary)]">
                                    Olá,{" "}
                                    <strong className="font-bold">
                                        NOME DO USUÁRIO!
                                        {/* parte que precisa puxar o nome do usuário do back e da autenticação */}
                                    </strong>
                                    </p>
                                </section>
                                
                                <h3 className="text-xl md:text-2xl font-bold mb-6 text-[var(--color-text-primary)]">
                                    Perguntas Frequentes
                                </h3>

                               
                             
                {/* 🛠️ AQUI: O flex-col junta a lista inteira, e o index funciona sem BO dentro do .map */}
               <div className="flex flex-col gap-4">
                  {perguntasFrequentes.map((item, index)  => {
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
                              estaAberto ? 'rotate-90 text-[var(--color-brand-700)]' : ''
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
