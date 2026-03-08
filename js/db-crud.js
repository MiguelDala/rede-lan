/**
 * CRUD de Utilizadores - SQLite3 (SQL.js)
 * Projeto de Rede LAN - Armazena dados dos utilizadores
 */

const DB_CRUD = (function() {
  let db = null;
  const IDB_NAME = 'conf_red_lan_db';
  const IDB_STORE = 'usuarios_db';

  function saveToIndexedDB() {
    if (!db || !window.indexedDB) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const data = db.export();
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readwrite');
        const store = tx.objectStore(IDB_STORE);
        store.put({ id: 1, data: data });
        tx.oncomplete = resolve;
        tx.onerror = reject;
      };
      req.onerror = reject;
    });
  }

  function loadFromIndexedDB() {
    if (!window.indexedDB) return Promise.resolve(null);
    return new Promise((resolve) => {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
      req.onsuccess = () => {
        const tx = req.result.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const getReq = store.get(1);
        getReq.onsuccess = () => resolve(getReq.result?.data || null);
        getReq.onerror = () => resolve(null);
      };
      req.onerror = () => resolve(null);
    });
  }

  async function init() {
    if (db) return db;
    if (typeof initSqlJs === 'undefined') {
      console.error('SQL.js não carregado.');
      return null;
    }
    try {
      const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}` });
      const saved = await loadFromIndexedDB();
      db = saved ? new SQL.Database(saved) : new SQL.Database();
      db.run(`
        CREATE TABLE IF NOT EXISTS utilizadores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
          atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      db.run('CREATE INDEX IF NOT EXISTS idx_utilizadores_email ON utilizadores(email)');
      if (!saved) await saveToIndexedDB();
      return db;
    } catch (e) {
      console.error('Erro ao inicializar SQLite:', e);
      return null;
    }
  }

  function hashPassword(pass) {
    let h = 0;
    const s = pass + 'salt_lan_2026';
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i) | 0;
    return h.toString(16);
  }

  return {
    async init() { return await init(); },

    async create(nome, email, password) {
      await init();
      if (!db) return { ok: false, erro: 'Base de dados não disponível' };
      try {
        const hash = hashPassword(password);
        db.run('INSERT INTO utilizadores (nome, email, password_hash) VALUES (?, ?, ?)', [nome, email, hash]);
        const r = db.exec('SELECT last_insert_rowid() as id');
        const id = r[0]?.values[0]?.[0] || null;
        await saveToIndexedDB();
        return { ok: true, id };
      } catch (e) {
        return { ok: false, erro: e.message };
      }
    },

    async read(id) {
      await init();
      if (!db) return { ok: false, dados: null };
      try {
        let r;
        if (id) {
          const stmt = db.prepare('SELECT id, nome, email, criado_em, atualizado_em FROM utilizadores WHERE id = ?');
          stmt.bind([id]);
          const dados = [];
          while (stmt.step()) dados.push(stmt.getAsObject());
          stmt.free();
          return { ok: true, dados };
        }
        r = db.exec('SELECT id, nome, email, criado_em, atualizado_em FROM utilizadores ORDER BY id');
        if (!r[0]) return { ok: true, dados: [] };
        const cols = r[0].columns;
        const dados = r[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]])));
        return { ok: true, dados };
      } catch (e) {
        return { ok: false, dados: null, erro: e.message };
      }
    },

    async update(id, nome, email, password) {
      await init();
      if (!db) return { ok: false, erro: 'Base de dados não disponível' };
      try {
        if (password && password.length > 0) {
          const hash = hashPassword(password);
          db.run('UPDATE utilizadores SET nome=?, email=?, password_hash=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?', [nome, email, hash, id]);
        } else {
          db.run('UPDATE utilizadores SET nome=?, email=?, atualizado_em=CURRENT_TIMESTAMP WHERE id=?', [nome, email, id]);
        }
        await saveToIndexedDB();
        return { ok: true };
      } catch (e) {
        return { ok: false, erro: e.message };
      }
    },

    async delete(id) {
      await init();
      if (!db) return { ok: false, erro: 'Base de dados não disponível' };
      try {
        db.run('DELETE FROM utilizadores WHERE id = ?', [id]);
        await saveToIndexedDB();
        return { ok: true };
      } catch (e) {
        return { ok: false, erro: e.message };
      }
    }
  };
})();
