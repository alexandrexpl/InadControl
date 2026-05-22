# InadControl - Sistema de Gestão de Inadimplência

## 1. Descrição do Projeto
O InadControl é uma plataforma web em desenvolvimento para centralizar e analisar cobranças de pequenas e médias empresas, automatizando o controle de inadimplência.

## 2. Tecnologias Utilizadas
* **Backend:** .NET 9 (C#), Entity Framework Core
* **Banco de Dados:** PostgreSQL (via Docker)
* **Documentação de API:** Swagger / OpenAPI
* **Frontend:** React

## 3. Status Atual
Nesta etapa de documentação parcial, a infraestrutura e o backend foram fundamentados:
* Configuração do contêiner Docker para o PostgreSQL.
* Modelagem das entidades: Usuário, Cliente e Cobrança.
* Desenvolvimento dos Controllers (Rotas CRUD) para Clientes e Cobranças.
* Testes e validações realizados via Swagger.

## 4. Como rodar o projeto
1. Clone este repositório.
2. Na pasta raiz, suba o banco de dados executando: `docker compose up -d`
3. Navegue até a pasta da API (`cd InadControl.Api`) e atualize o banco: `dotnet ef database update`
4. Inicie o servidor: `dotnet run`
5. Acesse a documentação Swagger no navegador através da porta indicada no terminal (ex: `http://localhost:5278/swagger`).
