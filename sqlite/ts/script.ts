/**
 * Projeto de Rede LAN - Script principal
 * Desenvolvido em TypeScript
 */

// Interface para os dados de cada card da galeria
interface CardItem {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
  categoria: string;
}

// Dados dos cards com as imagens e descrições do projeto
const cardsData: CardItem[] = [
  {
    id: '01',
    titulo: 'Topologia da Rede LAN',
    descricao: 'Visão geral da rede com servidores (FTP, WEBB, EMAIL, DHCP, DNS), PCs, laptops e pontos de acesso sem fios (ALUNOS, CONVIDADOS, PROFESSORES).',
    imagem: 'assets/images/01.png',
    categoria: 'topologia'
  },
  {
    id: '02',
    titulo: 'Configuração do Servidor DNS',
    descricao: 'Configuração IP estática do servidor DNS: IPv4 192.168.3.1, máscara 255.255.255.0 e gateway 192.168.3.2.',
    imagem: 'assets/images/02.png',
    categoria: 'servidores'
  },
  {
    id: '03',
    titulo: 'Servidor de Email',
    descricao: 'Serviço de email com SMTP e POP3 ativos, domínio escolafundao.pt e gestão de utilizadores.',
    imagem: 'assets/images/03.png',
    categoria: 'servidores'
  },
  {
    id: '04',
    titulo: 'Página Web no Navegador',
    descricao: 'Página HTML simples com CSS a ser visualizada no PC0 através do endereço http://WEBB.',
    imagem: 'assets/images/04.png',
    categoria: 'web'
  },
  {
    id: '05',
    titulo: 'Código do Servidor WEBB',
    descricao: 'Ficheiro index.html do servidor web com HTML e CSS inline para estilização da página.',
    imagem: 'assets/images/05.png',
    categoria: 'web'
  },
  {
    id: '06',
    titulo: 'Configuração do Servidor FTP',
    descricao: 'Servidor FTP com utilizadores configurados (admin, cisco, user) e permissões de leitura, escrita e listagem.',
    imagem: 'assets/images/06.png',
    categoria: 'servidores'
  },
  {
    id: '07',
    titulo: 'Configuração IP do PC1',
    descricao: 'Configuração estática do PC1: IP 192.168.3.10, gateway 192.168.3.3 e DNS 192.168.3.1.',
    imagem: 'assets/images/07.png',
    categoria: 'clientes'
  },
  {
    id: '08',
    titulo: 'Access Point PROFESSORES',
    descricao: 'Configuração wireless do AP PROFESSORES: SSID, canal 6, WPA2-PSK com encriptação AES.',
    imagem: 'assets/images/08.png',
    categoria: 'wireless'
  },
  {
    id: '09',
    titulo: 'Smartphone na Rede',
    descricao: 'Smartphone0 ligado à rede PROFESSORES via DHCP, com endereço IP 192.168.3.13 atribuído automaticamente.',
    imagem: 'assets/images/09.png',
    categoria: 'wireless'
  },
  {
    id: '10',
    titulo: 'Topologia Completa com Switches',
    descricao: 'Diagrama completo da rede com switches 2960, servidores, PCs (PC_MIGUEL, PC-GERALDO), laptop e dispositivos wireless.',
    imagem: 'assets/images/10.png',
    categoria: 'topologia'
  }
];

// Classe principal da aplicação
class GaleriaRedeLAN {
  private container: HTMLElement | null;
  private modal: HTMLElement | null;
  private filtros: NodeListOf<HTMLButtonElement>;
  private cardsFiltrados: CardItem[] = [...cardsData];

  constructor() {
    this.container = document.getElementById('galeria');
    this.modal = document.getElementById('modal');
    this.filtros = document.querySelectorAll('.filtros button');
    this.inicializar();
  }

  private inicializar(): void {
    this.renderizarCards();
    this.configurarFiltros();
    this.configurarModal();
  }

  private renderizarCards(): void {
    if (!this.container) return;

    this.container.innerHTML = this.cardsFiltrados
      .map(
        (card) => `
        <article class="card" data-categoria="${card.categoria}">
          <img src="${card.imagem}" alt="${card.titulo}" class="card-imagem" loading="lazy">
          <div class="card-conteudo">
            <h3 class="card-titulo">${card.titulo}</h3>
            <p class="card-descricao">${card.descricao}</p>
          </div>
        </article>
      `
      )
      .join('');

    this.registarCliquesCards();
  }

  private registarCliquesCards(): void {
    const cards = this.container?.querySelectorAll('.card');
    cards?.forEach((card) => {
      card.addEventListener('click', () => {
        const img = card.querySelector('img');
        if (img) this.abrirModal(img.src, img.alt);
      });
    });
  }

  private configurarFiltros(): void {
    this.filtros.forEach((btn) => {
      btn.addEventListener('click', () => {
        const categoria = btn.dataset.categoria || 'todos';
        this.filtrarPorCategoria(categoria);
        this.filtros.forEach((b) => b.classList.remove('ativo'));
        btn.classList.add('ativo');
      });
    });
  }

  private filtrarPorCategoria(categoria: string): void {
    this.cardsFiltrados =
      categoria === 'todos'
        ? [...cardsData]
        : cardsData.filter((c) => c.categoria === categoria);
    this.renderizarCards();
  }

  private configurarModal(): void {
    if (!this.modal) return;

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.fecharModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.fecharModal();
    });
  }

  private abrirModal(src: string, alt: string): void {
    if (!this.modal) return;
    const img = this.modal.querySelector('img');
    if (img) {
      img.src = src;
      img.alt = alt;
    }
    this.modal.classList.add('visivel');
    document.body.style.overflow = 'hidden';
  }

  private fecharModal(): void {
    this.modal?.classList.remove('visivel');
    document.body.style.overflow = '';
  }
}

// Iniciar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new GaleriaRedeLAN();
});
