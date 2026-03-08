# SQLite - Base de Dados de Utilizadores

Esta pasta contém a configuração e schema da base de dados SQLite para o Projeto de Rede LAN.

## Estrutura
- `schema.sql` - Definição das tabelas
- `usuarios.db` - Base de dados (criada automaticamente pelo SQL.js no browser)

## Tecnologia
O projeto web utiliza **SQL.js** (SQLite compilado para WebAssembly) para executar SQLite no browser. Os dados são persistidos em IndexedDB.

## Tabela: utilizadores
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| nome | TEXT | Nome do utilizador |
| email | TEXT | Email (único) |
| password_hash | TEXT | Palavra-passe (hash) |
| criado_em | DATETIME | Data de criação |
| atualizado_em | DATETIME | Última atualização |
