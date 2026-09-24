"use client";

import Link from "next/link";
import LivroCard from "./LivroCard";

type Livro = {
    id_livro: number;
    titulo_livro: string;
    autor_livro: string;
    genero_livro: string;
    imgcapa_livro: string | null;
};

type LivroGridProps = {
    titulo: string;
    livros: Livro[];
    baseUrl?: string; // Adicionado para suportar o redirecionamento
};

export default function LivroGrid({
    titulo,
    livros,
    baseUrl = "/bibliotecario/acervo", // Valor padrão alinhado com o carousel
}: LivroGridProps) {
    return (
        <section className="mb-8">
            <h2
                className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-[var(--color-text-primary)]
                    mb-4
                "
            >
                {titulo}
            </h2>

            <div
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-4
                    gap-4
                "
            >
                {livros.map((livro) => (
                    <Link
                        key={livro.id_livro}
                        href={`${baseUrl}/${livro.id_livro}`}
                        className="
                            min-w-0
                            block
                            transition-transform
                            hover:scale-[1.02]
                        "
                    >
                        <LivroCard livro={livro} />
                    </Link>
                ))}
            </div>
        </section>
    );
}