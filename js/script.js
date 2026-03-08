/**
 * Projeto de Rede LAN - Script principal
 * Servidores: DHCP, DNS, Web, FTP, Email | Ligações Wireless
 */

const cardsData = [
  { id: '01', titulo: 'Topologia com Access Points', descricao: 'Rede com servidores e pontos de acesso ALUNOS, CONVIDADOS e PROFESSORES ligados a dispositivos móveis.', imagem: 'assets/images/01.png', secao: 'wireless' },
  { id: '02', titulo: 'Servidor DNS', descricao: 'Configuração IP estática: 192.168.3.1, máscara 255.255.255.0, gateway 192.168.3.2. Resolve nomes como WEBB.', imagem: 'assets/images/dns.png', secao: 'dns' },
  { id: '03', titulo: 'Servidor Email', descricao: 'Serviço de correio com SMTP e POP3, domínio escolafundao.pt.', imagem: 'assets/images/email.png', secao: 'email' },
  { id: '05', titulo: 'Código do Servidor Web', descricao: 'Ficheiro index.html com HTML e CSS inline no servidor WEBB.', imagem: 'assets/images/05.png', secao: 'web' },
  { id: '04', titulo: 'Página Web no Navegador', descricao: 'Página HTML com CSS visualizada no PC0 em http://WEBB — servidor Web a funcionar.', imagem: 'assets/images/04.png', secao: 'web' },
  { id: '12', titulo: 'Teste Web — Página a Funcionar', descricao: 'PC0 a visualizar http://WEBB no browser. Página "Olá!" com CSS e botão Clica aqui — servidor Web testado e a funcionar.', imagem: 'assets/images/web-teste.png', secao: 'web' },
  { id: '13', titulo: 'Navegação Web na Rede LAN', descricao: 'Acesso ao servidor WEBB a partir de um PC cliente. HTTP a funcionar com resolução de nomes pelo DNS.', imagem: 'assets/images/04.png', secao: 'web' },
  { id: '14', titulo: 'Acesso Web via IP/Nome', descricao: 'PC0 a aceder ao servidor WEBB no browser (http://WEBB ou IP). Página "Olá!" com CSS — como procurei através do IP/nome na rede.', imagem: 'assets/images/web-acesso-ip.png', secao: 'web' },
  { id: '06', titulo: 'Servidor FTP', descricao: 'Utilizadores admin, cisco, user com permissões de leitura, escrita e listagem.', imagem: 'assets/images/ftp.png', secao: 'ftp' },
  { id: '07', titulo: 'PC1 — Cliente com DNS', descricao: 'Configuração do PC1: IP 192.168.3.10, DNS 192.168.3.1 — utiliza o servidor DNS.', imagem: 'assets/images/07.png', secao: 'dns' },
  { id: '08', titulo: 'Access Point PROFESSORES', descricao: 'SSID PROFESSORES, canal 6, WPA2-PSK, AES. Dispositivos ligam-se via Wi-Fi.', imagem: 'assets/images/ap-professores.png', secao: 'wireless' },
  { id: '09', titulo: 'Smartphone — DHCP a Funcionar', descricao: 'Smartphone0 ligado à rede PROFESSORES. IP 192.168.3.13 atribuído automaticamente pelo DHCP.', imagem: 'assets/images/dhcp.png', secao: 'dhcp' },
  { id: '10', titulo: 'Topologia Completa', descricao: 'Switches 2960, servidores, PCs, laptop e dispositivos wireless na rede.', imagem: 'assets/images/10.png', secao: 'topologia' },
  { id: '11', titulo: 'Testes de Ping', descricao: 'PC-GERALDO a testar conectividade: ping 192.168.3.12 e 192.168.3.10 com 0% de perda de pacotes.', imagem: 'assets/images/ping.png', secao: 'conectividade' }
];

const secaoIds = { dhcp: 'cardsDHCP', dns: 'cardsDNS', web: 'cardsWeb', ftp: 'cardsFTP', email: 'cardsEmail', conectividade: 'cardsConectividade', wireless: 'cardsWireless', topologia: 'cardsTopologia' };

class GaleriaRedeLAN {
  constructor() {
    this.modal = document.getElementById('modal');
    this.inicializar();
  }

  inicializar() {
    this.renderizarPorSecao();
    this.configurarModal();
    this.configurarCarrossel();
  }

  configurarCarrossel() {
    document.querySelectorAll('.carrossel-wrapper').forEach(wrapper => {
      const carrossel = wrapper.querySelector('.carrossel');
      const prevBtn = wrapper.querySelector('.carrossel-prev');
      const nextBtn = wrapper.querySelector('.carrossel-next');
      if (!carrossel || !prevBtn || !nextBtn) return;

      const cardWidth = () => {
        const card = carrossel.querySelector('.card');
        return card ? card.offsetWidth + 24 : 400;
      };

      prevBtn.addEventListener('click', () => {
        carrossel.scrollBy({ left: -cardWidth(), behavior: 'smooth' });
      });
      nextBtn.addEventListener('click', () => {
        carrossel.scrollBy({ left: cardWidth(), behavior: 'smooth' });
      });

      /* Swipe em mobile */
      let touchStartX = 0;
      carrossel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      carrossel.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) carrossel.scrollBy({ left: diff, behavior: 'smooth' });
      }, { passive: true });

      /* Arrastar com rato no desktop */
      let isDown = false, startX, scrollLeft;
      carrossel.addEventListener('mousedown', e => {
        isDown = true;
        carrossel.style.cursor = 'grabbing';
        carrossel.style.scrollSnapType = 'none';
        startX = e.pageX - carrossel.offsetLeft;
        scrollLeft = carrossel.scrollLeft;
      });
      carrossel.addEventListener('mouseleave', () => {
        isDown = false;
        carrossel.style.cursor = 'grab';
        carrossel.style.scrollSnapType = 'x mandatory';
      });
      carrossel.addEventListener('mouseup', () => {
        isDown = false;
        carrossel.style.cursor = 'grab';
        carrossel.style.scrollSnapType = 'x mandatory';
      });
      carrossel.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carrossel.offsetLeft;
        const walk = (x - startX) * 1.2;
        carrossel.scrollLeft = scrollLeft - walk;
      });
      carrossel.style.cursor = 'grab';
    });
  }

  renderizarPorSecao() {
    Object.keys(secaoIds).forEach(secao => {
      const container = document.getElementById(secaoIds[secao]);
      if (!container) return;
      const cards = cardsData.filter(c => c.secao === secao);
      container.innerHTML = cards.map(card => this.criarCard(card)).join('');
    });
    this.registarCliquesCards();
  }

  criarCard(card) {
    const badge = ['dhcp','dns','web','ftp','email'].includes(card.secao) 
      ? '<span class="badge-funcionar-card">● A Funcionar</span>' : '';
    const imgSrc = card.imagem;
    return `
      <article class="card" data-categoria="${card.secao}">
        ${badge}
        <img src="${imgSrc}" alt="${card.titulo}" class="card-imagem" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22150%22%3E%3Crect fill=%22%231e293b%22 width=%22200%22 height=%22150%22/%3E%3Ctext fill=%22%2394a3b8%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 font-size=%2214%22%3EImagem indisponível%3C/text%3E%3C/svg%3E'; this.onerror=null;">
        <div class="card-conteudo">
          <h3 class="card-titulo">${card.titulo}</h3>
          <p class="card-descricao">${card.descricao}</p>
        </div>
      </article>
    `;
  }

  registarCliquesCards() {
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const titulo = card.querySelector('.card-titulo')?.textContent || '';
        const descricao = card.querySelector('.card-descricao')?.textContent || '';
        if (img) this.abrirModal(img.src, img.alt, titulo, descricao);
      });
    });
  }

  configurarModal() {
    if (!this.modal) return;
    this.modal.addEventListener('click', e => { if (e.target === this.modal) this.fecharModal(); });
    document.getElementById('modalClose')?.addEventListener('click', e => { e.stopPropagation(); this.fecharModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.fecharModal(); });
  }

  abrirModal(src, alt, titulo, descricao) {
    if (!this.modal) return;
    const img = this.modal.querySelector('#modalImage');
    const titleEl = this.modal.querySelector('#modalTitle');
    const descEl = this.modal.querySelector('#modalDescription');
    if (img) { img.src = src; img.alt = alt; }
    if (titleEl) titleEl.textContent = titulo;
    if (descEl) descEl.textContent = descricao;
    this.modal.classList.add('visivel');
    document.body.style.overflow = 'hidden';
  }

  fecharModal() {
    this.modal?.classList.remove('visivel');
    document.body.style.overflow = '';
  }
}

/* ========== Cadastro de Utilizadores (API primeiro, localStorage fallback) ========== */
const STORAGE_KEY = 'conf_red_lan_usuarios';
const API_BASE = '';
const ROLE_NAMES = { 1: 'Professor', 2: 'Aluno', 3: 'Administrador', 4: 'Convidado' };

function escapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

let usarAPI = false;

async function verificarAPI() {
  try {
    const r = await fetch(`${API_BASE}/api/health`, { method: 'GET' });
    const ok = r.ok && (await r.json()).ok;
    usarAPI = !!ok;
  } catch (e) {
    usarAPI = false;
  }
  const badge = document.getElementById('badgeDb');
  const intro = document.getElementById('introCadastro');
  if (badge) badge.textContent = usarAPI ? 'API' : 'Local';
  if (intro) intro.textContent = usarAPI
    ? 'Os dados são guardados na base de dados SQLite do servidor.'
    : 'Servidor indisponível. Os dados são guardados localmente no teu browser.';
  return usarAPI;
}

function getUsuariosLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { nextId: 1, usuarios: [] };
  } catch (e) {
    return { nextId: 1, usuarios: [] };
  }
}

function saveUsuariosLocal(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function renderTabela(dados, comFuncao = true) {
  const tbody = document.getElementById('tbodyUtilizadores');
  if (!tbody) return;
  const cols = comFuncao ? 6 : 5;
  tbody.innerHTML = dados.length === 0
    ? `<tr><td colspan="${cols}">Nenhum utilizador registado. Preenche o formulário acima.</td></tr>`
    : dados.map(u => `
        <tr>
          <td>${u.id}</td>
          <td>${escapeHtml(u.nome)}</td>
          <td>${escapeHtml(u.email)}</td>
          <td>${escapeHtml(u.role_nome || ROLE_NAMES[u.role_id] || '-')}</td>
          <td>${(u.criado_em || '').slice(0, 16)}</td>
          <td>
            <button type="button" class="btn-editar" data-id="${u.id}" data-nome="${escapeHtml(u.nome)}" data-email="${escapeHtml(u.email)}" data-role="${u.role_id || 4}">Editar</button>
            <button type="button" class="btn-apagar" data-id="${u.id}">Apagar</button>
          </td>
        </tr>
      `).join('');
  tbody.querySelectorAll('.btn-editar').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('userId').value = btn.dataset.id;
      document.getElementById('inputNome').value = btn.dataset.nome || '';
      document.getElementById('inputEmail').value = btn.dataset.email || '';
      const roleEl = document.getElementById('inputRole');
      if (roleEl) roleEl.value = btn.dataset.role || '4';
      document.getElementById('inputPassword').value = '';
      document.getElementById('inputPassword').placeholder = 'Deixe em branco para manter';
    });
  });
  tbody.querySelectorAll('.btn-apagar').forEach(btn => {
    btn.addEventListener('click', () => apagarUtilizador(btn.dataset.id));
  });
}

async function carregarTabelaUtilizadores() {
  if (usarAPI) {
    try {
      const r = await fetch(`${API_BASE}/api/usuarios`);
      const json = await r.json();
      if (json.ok && Array.isArray(json.dados)) {
        renderTabela(json.dados, true);
        return;
      }
    } catch (e) {}
  }
  const data = getUsuariosLocal();
  const usuarios = (data.usuarios || []).map(u => ({ ...u, role_nome: u.role_nome || ROLE_NAMES[u.role_id] || 'Convidado' }));
  renderTabela(usuarios, true);
}

async function guardarUtilizador(payload) {
  if (usarAPI) {
    try {
      const id = payload.id;
      if (id) {
        const r = await fetch(`${API_BASE}/api/usuarios/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await r.json();
        if (json.ok) { await carregarTabelaUtilizadores(); return true; }
        if (json.erro) alert(json.erro);
        return false;
      } else {
        const r = await fetch(`${API_BASE}/api/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await r.json();
        if (json.ok) { await carregarTabelaUtilizadores(); return true; }
        if (json.erro) alert(json.erro);
        return false;
      }
    } catch (e) {
      alert('Servidor não respondeu. A guardar localmente.');
      usarAPI = false;
      document.getElementById('badgeDb').textContent = 'Local';
      document.getElementById('introCadastro').textContent = 'Os dados são guardados localmente no teu browser.';
    }
  }
  const data = getUsuariosLocal();
  const { id, nome, email, password, role_id } = payload;
  const agora = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (id) {
    const idx = data.usuarios.findIndex(u => String(u.id) === id);
    if (idx >= 0) {
      data.usuarios[idx] = { ...data.usuarios[idx], nome, email, role_id: role_id || 4 };
      saveUsuariosLocal(data);
    }
  } else {
    if (data.usuarios.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      alert('Este email já está registado.');
      return false;
    }
    data.usuarios.push({ id: data.nextId++, nome, email, role_id: role_id || 4, role_nome: ROLE_NAMES[role_id || 4] || 'Convidado', criado_em: agora });
    saveUsuariosLocal(data);
  }
  carregarTabelaUtilizadores();
  return true;
}

async function apagarUtilizador(id) {
  if (!confirm('Apagar este utilizador?')) return;
  if (usarAPI) {
    try {
      const r = await fetch(`${API_BASE}/api/usuarios/${id}`, { method: 'DELETE' });
      const json = await r.json();
      if (json.ok) { await carregarTabelaUtilizadores(); return; }
    } catch (e) {}
  }
  const data = getUsuariosLocal();
  data.usuarios = data.usuarios.filter(u => u.id != id);
  saveUsuariosLocal(data);
  carregarTabelaUtilizadores();
}

document.addEventListener('DOMContentLoaded', async () => {
  new GaleriaRedeLAN();
  await verificarAPI();
  await carregarTabelaUtilizadores();

  const form = document.getElementById('formUtilizador');
  const btnCancelar = document.getElementById('btnCancelar');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('userId').value;
      const nome = document.getElementById('inputNome').value.trim();
      const email = document.getElementById('inputEmail').value.trim();
      const password = document.getElementById('inputPassword').value;
      const roleEl = document.getElementById('inputRole');
      const role_id = roleEl ? parseInt(roleEl.value, 10) : 4;
      if (!nome || !email) return;
      if (!id && !password) {
        alert('Password obrigatória para novo utilizador.');
        return;
      }
      const payload = { nome, email, role_id };
      if (id) payload.id = id;
      if (password) payload.password = password;
      const ok = await guardarUtilizador(payload);
      const msgEl = document.getElementById('msgCadastro');
      if (ok) {
        form.reset();
        document.getElementById('userId').value = '';
        if (roleEl) roleEl.value = '4';
        document.getElementById('inputPassword').placeholder = 'Password (obrigatório ao registar)';
        window.location.href = 'cadastro-sucesso.html';
      } else {
        if (msgEl) {
          msgEl.textContent = '';
          msgEl.className = 'msg-cadastro';
        }
      }
    });
  }
  if (btnCancelar) {
    btnCancelar.addEventListener('click', () => {
      form.reset();
      document.getElementById('userId').value = '';
      const roleEl = document.getElementById('inputRole');
      if (roleEl) roleEl.value = '4';
      document.getElementById('inputPassword').placeholder = 'Password (obrigatório ao registar)';
    });
  }
});
