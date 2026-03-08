-- =============================================
-- Projeto Rede LAN - Escola Fundão
-- Schema profissional da base de dados SQLite
-- =============================================

-- Tabela de perfis/roles
CREATE TABLE IF NOT EXISTS roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir roles padrão
INSERT OR IGNORE INTO roles (id, nome, descricao) VALUES
    (1, 'Professor', 'Docente da escola'),
    (2, 'Aluno', 'Estudante'),
    (3, 'Administrador', 'Gestão do sistema'),
    (4, 'Convidado', 'Acesso limitado');

-- Tabela de utilizadores
CREATE TABLE IF NOT EXISTS utilizadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL CHECK (length(nome) >= 2),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER DEFAULT 4,
    ativo INTEGER DEFAULT 1 CHECK (ativo IN (0, 1)),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_utilizadores_email ON utilizadores (email);
CREATE INDEX IF NOT EXISTS idx_utilizadores_role ON utilizadores (role_id);
CREATE INDEX IF NOT EXISTS idx_utilizadores_ativo ON utilizadores (ativo);
