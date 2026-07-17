# 📊 InadControl - Sistema de Gestão de Inadimplência e Cobranças

Este projeto é um sistema *Full-Stack* desenvolvido para facilitar o controle financeiro de pequenas e médias empresas, focando na gestão de clientes, controle de faturas (vencidas, pendentes e pagas) e simulação de renegociação de dívidas.

## 🎯 Objetivo do Projeto
O **InadControl** visa resolver o problema da desorganização no fluxo de caixa, permitindo que utilizadores com perfis "Admin" e "Financeiro" registem clientes, gerem cobranças e acompanhem métricas financeiras através de um Dashboard dinâmico, tudo protegido por autenticação segura.

---

## 🚀 Funcionalidades (Regras de Negócio)

1. **Autenticação e Autorização Segura (JWT):**
   * Login protegido com senhas criptografadas (BCrypt).
   * Controle de acesso baseado em Perfis (`Admin` e `Financeiro`). Apenas o Admin pode aceder à aba de "Configurações" para criar ou gerir novos utilizadores, ou alterar o Nome da Empresa.

2. **Dashboard Dinâmico e Analítico:**
   * Cálculo em tempo real de: Total a Receber, Total em Atraso e Total Recebido.
   * Gráficos interativos (PieChart e BarChart) gerados com `recharts`.
   * Tabela de alerta rápido para faturas vencidas nos últimos 7 dias.

3. **Gestão de Clientes e Validações:**
   * CRUD completo (Create, Read, Update, Delete) de Clientes.
   * Aplicação automática de máscaras em campos sensíveis (CPF/CNPJ e Telefone).
   * **Trava de Segurança:** A API impede a exclusão de um cliente caso ele possua cobranças com status "Pendente" ou "Atrasada".

4. **Controle de Cobranças (Inteligência de Status):**
   * CRUD de Faturas (Notas, Recibos, Boletos).
   * Máscara monetária em tempo real (R$).
   * **Automação de Status:** O sistema muda automaticamente o status de uma nova cobrança para "Atrasada" se a data de vencimento inserida for inferior à data atual.

5. **Simulador Financeiro (Calculadora):**
   * Ferramenta isolada para simular cenários de renegociação, aplicando percentagens de Juros e Multas sobre um valor original.

---

## 💻 Tecnologias e Arquitetura

O projeto foi construído utilizando a arquitetura de **API RESTful** comunicando com uma **Single Page Application (SPA)**.

### Frontend (Interface do Utilizador)
* **React (Vite):** Biblioteca principal para renderização de componentes.
* **Tailwind CSS:** Framework utilitário para estilização rápida e responsiva.
* **Lucide React:** Biblioteca de ícones SVG.
* **Recharts:** Biblioteca para construção de gráficos declarativos.
* **Estrutura:** O código foi rigorosamente componentizado em páginas isoladas (`src/pages/`) para facilitar a manutenção e escalabilidade.

### Backend (API e Base de Dados)
* **C# .NET Core (ASP.NET):** Framework para construção da API REST.
* **Entity Framework Core (EF Core):** ORM para mapeamento objeto-relacional.
* **PostgreSQL (via Docker):** Base de dados relacional operando isoladamente em contêiner.
* **JWT Bearer:** Para geração e validação de tokens de segurança.
* **BCrypt.Net:** Para *hashing* seguro de senhas na base de dados.
* **CORS:** Configurado de forma estrita para permitir a comunicação segura com o Frontend.

---

## ⚙️ Como executar o projeto localmente

### 📌 Pré-requisitos
Antes de começar, certifique-se de ter as seguintes ferramentas instaladas na sua máquina:
* **[Node.js](https://nodejs.org/):** Versão **v24.14.0** ou superior.
* **[.NET SDK](https://dotnet.microsoft.com/):** Versão **9.0.314** ou superior.
* **[Docker Desktop](https://www.docker.com/products/docker-desktop/):** Para rodar o contêiner do banco de dados PostgreSQL.

### 1. Iniciar a API (Backend)
1. Abra o terminal na pasta do backend (`InadControl.Api`).
2. Restaure os pacotes executando: `dotnet restore`
3. Atualize a base de dados com: `dotnet ef database update`
4. Rode a API com o comando: `dotnet run`

### 2. Iniciar o Frontend (React)
1. Abra um novo terminal na pasta do frontend (`InadControl.Web` ou `src`).
2. Instale as dependências com: `npm install`
3. Inicie o servidor de desenvolvimento com: `npm run dev`

*(O sistema ficará disponível em http://localhost:5173)*

---

## 👨‍💻 Autor
* **Alexandre Lopes** - Análise e Desenvolvimento de Sistemas