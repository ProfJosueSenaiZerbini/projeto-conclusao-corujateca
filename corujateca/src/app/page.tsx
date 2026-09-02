import Header from "@/components/Header";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {

  redirect("/login");
  return (
    {/*
      <div className="min-h-screen flex flex-col">
          <Header />

          <div className="flex flex-1">
            <Nav />

            <main className="
              flex-1
              min-w-0
              p-6
            ">
              O conteudo vai AQUI, entre uma Main com essas tags aqui em cima
            </main>

          </div>

        <Footer />
      </div> 
    */}
  );
}