/**
 * Servidor Backend - Projeto de Rede LAN
 * API REST para cadastro de utilizadores (SQLite)
 */

const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_PATH = path.join(__dirname, '..', 'data', 'utilizadores.db');

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
app.use(express.static(path.join(__dirname, '..')));

function initDB() {
  const dbDir = path.join(__dirname, '..', 'data');
  const fs = require('fs');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

  const db = new Database(DB_PATH);
  const schemaPath = path.join(__dirname, '..', 'sqlite', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8')
      .replace(/--.*$/gm, '')
      .replace(/CREATE TRIGGER[\s\S]*?END;/g, '');
    db.exec(schema);
  }
  try { db.exec('ALTER TABLE utilizadores ADD COLUMN role_id INTEGER DEFAULT 4'); } catch (e) {}
  try { db.exec('ALTER TABLE utilizadores ADD COLUMN ativo INTEGER DEFAULT 1'); } catch (e) {}
  return db;
}

const db = initDB();

app.get('/api/health', (req, res) => {
  try {
    db.prepare('SELECT 1').get();
    res.json({ ok: true, db: 'sqlite' });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.get('/api/roles', (req, res) => {
  try {
    const rows = db.prepare('SELECT id, nome, descricao FROM roles ORDER BY id').all();
    res.json({ ok: true, dados: rows });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

function hashPassword(pass) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(pass + 'salt_lan_2026').digest('hex');
}

app.get('/api/usuarios', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT u.id, u.nome, u.email, u.role_id, u.criado_em, u.atualizado_em,
             COALESCE(r.nome, 'Convidado') as role_nome
      FROM utilizadores u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `).all();
    res.json({ ok: true, dados: rows });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.post('/api/usuarios', (req, res) => {
  try {
    const body = req.body || {};
    const { nome, email, password, role_id } = body;
    if (!nome || !email || !password) {
      return res.status(400).json({ ok: false, erro: 'Nome, email e password são obrigatórios.' });
    }
    const hash = hashPassword(password);
    const rid = role_id ? parseInt(role_id, 10) : 4;
    const stmt = db.prepare('INSERT INTO utilizadores (nome, email, password_hash, role_id) VALUES (?, ?, ?, ?)');
    const info = stmt.run(nome.trim(), email.trim().toLowerCase(), hash, rid);
    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ ok: false, erro: 'Este email já está registado.' });
    }
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.put('/api/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const body = req.body || {};
    const { nome, email, password, role_id } = body;
    if (!nome || !email) {
      return res.status(400).json({ ok: false, erro: 'Nome e email são obrigatórios.' });
    }
    const rid = role_id ? parseInt(role_id, 10) : null;
    if (password && password.length > 0) {
      const hash = hashPassword(password);
      if (rid !== null) {
        db.prepare('UPDATE utilizadores SET nome=?, email=?, password_hash=?, role_id=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?')
          .run(nome.trim(), email.trim().toLowerCase(), hash, rid, id);
      } else {
        db.prepare('UPDATE utilizadores SET nome=?, email=?, password_hash=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?')
          .run(nome.trim(), email.trim().toLowerCase(), hash, id);
      }
    } else {
      if (rid !== null) {
        db.prepare('UPDATE utilizadores SET nome=?, email=?, role_id=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?')
          .run(nome.trim(), email.trim().toLowerCase(), rid, id);
      } else {
        db.prepare('UPDATE utilizadores SET nome=?, email=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?')
          .run(nome.trim(), email.trim().toLowerCase(), id);
      }
    }
    res.json({ ok: true });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      return res.status(400).json({ ok: false, erro: 'Este email já está registado.' });
    }
    res.status(500).json({ ok: false, erro: e.message });
  }
});

app.delete('/api/usuarios/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM utilizadores WHERE id=?').run(id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, erro: e.message });
  }
});

// Página admin - utilizadores na base de dados (backend)
function escapeHtmlAdmin(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
app.get('/admin', (req, res) => {
  try {
    const escapeHtml = (s) => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const rows = db.prepare(`
      SELECT u.id, u.nome, u.email, u.role_id, u.ativo, u.criado_em, u.atualizado_em,
             COALESCE(r.nome, 'Convidado') as role_nome
      FROM utilizadores u
      LEFT JOIN roles r ON u.role_id = r.id
      ORDER BY u.id
    `).all();
    const html = `<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><title>Admin - Utilizadores (BD)</title>
<style>body{font-family:monospace;background:#0f172a;color:#94a3b8;padding:2rem;margin:0}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #334155;padding:0.5rem 1rem;text-align:left}
th{background:#1e293b;color:#06b6d4}h1{color:#f8fafc;margin-bottom:1rem}
pre{background:#1e293b;padding:1rem;overflow-x:auto;border-radius:8px}
a{color:#06b6d4}</style></head>
<body>
<h1>📋 Utilizadores na Base de Dados (SQLite)</h1>
<p><a href="/">← Voltar ao site</a></p>
<h2>Formato tabela</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Email</th><th>Função</th><th>Ativo</th><th>Criado</th><th>Atualizado</th></tr>
${rows.map(u => `<tr><td>${u.id}</td><td>${escapeHtml(u.nome)}</td><td>${escapeHtml(u.email)}</td><td>${u.role_nome}</td><td>${u.ativo}</td><td>${(u.criado_em||'').slice(0,19)}</td><td>${(u.atualizado_em||'').slice(0,19)}</td></tr>`).join('')}
</table>
<h2>Formato JSON (linguagem de máquina)</h2>
<pre>${JSON.stringify(rows, null, 2)}</pre>
</body></html>`;
    res.send(html);
  } catch (e) {
    res.status(500).send('<h1>Erro</h1><pre>' + e.message + '</pre>');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
