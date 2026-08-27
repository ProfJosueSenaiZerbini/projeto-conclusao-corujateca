# Sistema de Gerenciamento de Biblioteca Física - CorujaTeca

## Nome dos integrantes

- Alexandra Marques Santos Pereira 
- Enzo Henrique Barbino de Sousa 
- Maria Luiza Dias Brito da Silva 
- Rogério Malto Giardini Dos Anjos 
- Stephanny Borrozzino 

## Descrição resumida do trabalho

O projeto “Sistema de Gerenciamento Bibliotecário Escolar” têm como objetivo aprimorar a gestão e o controle de livros, frequentadores e empréstimos em bibliotecas físicas, principalmente de escolas públicas. Após relatos de frustrações no ambiente escolar público, nosso grupo analisou como bibliotecários possuem dificuldades frequentes relacionadas à organização do ambiente de trabalho, ocasionando estresse e mal desempenho em horário comercial. Dessa forma, este projeto tem por objetivo criar um sistema com maiores níveis de organização e fácil entendimento, visando um ambiente bibliotecário em escolas públicas mais práticos, acessíveis e harmoniosas. 

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado no seu ambiente de desenvolvimento:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) — versão 18.x ou superior recomendada
* Gerenciador de pacotes: **npm**, **yarn** ou **pnpm**

---

## Descrição de como instalar o sistema

Siga os passos abaixo para clonar o repositório, instalar as dependências e executar o projeto localmente.

### 1. Clonar o Repositório

Abra o terminal e rode o comando abaixo para baixar o código-fonte:

```bash
git clone https://github.com/seu-usuario/corujateca.git
```

### 2. Acessar o Diretório do Projeto

```bash
cd corujateca
```

### 3. Instalar as Dependências

Execute o comando relativo ao gerenciador de pacotes da sua escolha:

```bash
# Se utilizar NPM:
npm install

# Se utilizar YARN:
yarn install

# Se utilizar PNPM:
pnpm install
```

### 4. Configurar as Variáveis de Ambiente

Caso o projeto utilize variáveis de ambiente, crie o arquivo `.env.local` na raiz do projeto clonando o modelo de exemplo:

```bash
cp .env.example .env.local
```

> **Nota:** Abra o arquivo `.env.local` criado e insira as credenciais e chaves necessárias para a sua máquina local.

### 5. Executar a Aplicação

Para iniciar o servidor de desenvolvimento:

```bash
# Se utilizar NPM:
npm run dev

# Se utilizar YARN:
yarn dev

# Se utilizar PNPM:
pnpm dev
```

Após iniciar, abra o navegador e acesse:

http://localhost:3000
