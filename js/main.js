document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais do DOM
    const listaServicos = document.getElementById('lista-servicos');
    const valorTotal = document.getElementById('valorTotal');
    const btnAdicionarServico = document.querySelector('.adicionar-servico');
    const modalAdicionarServico = document.querySelector('.modal-adicionar-servico');
    const btnSalvarServico = document.getElementById('salvar-servico');
    const inputNomeServico = document.getElementById('nome-servico');
    const inputDescricaoServico = document.getElementById('descricao-servico');
    const inputValorServico = document.getElementById('valor-servico');
    const tituloTexto = document.getElementById('titulo-texto');
    const bannerImagem = document.getElementById('banner-imagem');

    // Elementos da barra lateral (apenas cores)
    const corPrimariaInput = document.getElementById('cor-primaria');
    const corPrimariaTexto = document.getElementById('cor-primaria-texto');
    const corSecundariaInput = document.getElementById('cor-secundaria');
    const corSecundariaTexto = document.getElementById('cor-secundaria-texto');
    const corTextoDarkInput = document.getElementById('cor-texto-dark');
    const corTextoDarkTexto = document.getElementById('cor-texto-dark-texto');
    const sidebarCloseBtn = document.querySelector('.sidebar-close-btn');

    // Elementos do modal de imagem
    const modalImagem = document.getElementById('modal-imagem');
    const urlImagemInput = document.getElementById('url-imagem');
    const btnSalvarImagem = document.getElementById('salvar-imagem');
    const btnCancelarImagem = document.getElementById('cancelar-imagem');

    // Funções para salvar e carregar do LocalStorage
    function salvarOrcamento() {
        const orcamento = {
            titulo: tituloTexto.textContent,
            descricao: document.querySelector('.descricao-orcamento').textContent,
            servicos: Array.from(document.querySelectorAll('.servico')).map(servico => ({
                nome: servico.querySelector('.servico-nome').textContent,
                descricao: servico.querySelector('.servico-descricao').textContent,
                valor: servico.querySelector('.servico-preco').getAttribute('data-valor')
            })),
            imagem: bannerImagem.src,
            cores: {
                primaria: corPrimariaInput.value,
                secundaria: corSecundariaInput.value,
                textoDark: corTextoDarkInput.value
            }
        };
        localStorage.setItem('orcamentoSalvo', JSON.stringify(orcamento));
    }

    function carregarOrcamento() {
        const salvo = localStorage.getItem('orcamentoSalvo');
        if (salvo) {
            const orcamento = JSON.parse(salvo);
            
            tituloTexto.textContent = orcamento.titulo;
            document.querySelector('.descricao-orcamento').textContent = orcamento.descricao;
            bannerImagem.src = orcamento.imagem;
            
            corPrimariaInput.value = orcamento.cores.primaria;
            corSecundariaInput.value = orcamento.cores.secundaria;
            corTextoDarkInput.value = orcamento.cores.textoDark;
            updateColors();
            
            document.querySelectorAll('.servico').forEach(s => s.remove());
            orcamento.servicos.forEach(servico => {
                adicionarServico(servico.nome, servico.descricao, servico.valor);
            });
            
            calcularTotal();
        }
    }

    // Função para adicionar serviços
    function adicionarServico(nome, descricao, valor) {
        const novoServico = document.createElement('div');
        novoServico.classList.add('servico');
        
        let valorNumerico;
        if (typeof valor === 'string') {
            valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        } else {
            valorNumerico = Number(valor) || 0;
        }
        
        valorNumerico = Math.max(0, valorNumerico);

        novoServico.innerHTML = `
            <div class="servico-detalhes">
                <div class="servico-nome" contenteditable="true">${nome || 'Novo Serviço'}</div>
                <div class="servico-descricao" contenteditable="true">${descricao || 'Descrição do serviço'}</div>
            </div>
            <div class="servico-preco" data-valor="${valorNumerico}">${formatarMoeda(valorNumerico)}</div>
            <span class="remover-servico" title="Remover Serviço">✖</span>
        `;

        listaServicos.appendChild(novoServico);
        configurarEdicaoItem(novoServico);
        calcularTotal();
        salvarOrcamento();
    }

    // Configura a edição de um item de serviço
    function configurarEdicaoItem(servicoElement) {
        const nome = servicoElement.querySelector('.servico-nome');
        const descricao = servicoElement.querySelector('.servico-descricao');
        const preco = servicoElement.querySelector('.servico-preco');
        const btnRemover = servicoElement.querySelector('.remover-servico');

        nome.addEventListener('dblclick', () => nome.focus());
        descricao.addEventListener('dblclick', () => descricao.focus());

        [nome, descricao].forEach(el => {
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    el.blur();
                }
            });
            
            el.addEventListener('blur', () => {
                if (!el.textContent.trim()) {
                    el.textContent = el.classList.contains('servico-nome') 
                        ? 'Novo Serviço' 
                        : 'Descrição do serviço';
                }
                salvarOrcamento();
            });
        });

        preco.addEventListener('dblclick', function() {
            const valorAtual = parseFloat(this.getAttribute('data-valor')) || 0;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = valorAtual.toFixed(2).replace('.', ',');
            input.className = 'editar-preco';
            
            this.textContent = '';
            this.appendChild(input);
            input.focus();
            
            input.addEventListener('input', function(e) {
                let valor = e.target.value.replace(/[^\d,]/g, '');
                if (valor.includes(',')) {
                    const partes = valor.split(',');
                    valor = partes[0] + ',' + (partes[1] ? partes[1].substring(0, 2) : '');
                }
                e.target.value = valor;
            });
            
            const finalizarEdicao = () => {
                let valorNumerico = parseFloat(input.value.replace(/\./g, '').replace(',', '.')) || 0;
                valorNumerico = Math.max(0, valorNumerico);
                this.setAttribute('data-valor', valorNumerico);
                this.textContent = formatarMoeda(valorNumerico);
                calcularTotal();
                salvarOrcamento();
                input.remove();
            };
            
            input.addEventListener('blur', finalizarEdicao);
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') finalizarEdicao();
            });
        });

        btnRemover.addEventListener('click', function() {
            if (document.querySelectorAll('.servico').length > 1) {
                servicoElement.remove();
                calcularTotal();
                salvarOrcamento();
            } else {
                alert('É necessário manter pelo menos um serviço na lista.');
            }
        });
    }

    // Atualiza as cores do tema
    function updateColors() {
        document.documentElement.style.setProperty('--primary-color', corPrimariaInput.value);
        document.documentElement.style.setProperty('--secondary-color', corSecundariaInput.value);
        document.documentElement.style.setProperty('--text-dark', corTextoDarkInput.value);
        
        corPrimariaTexto.value = corPrimariaInput.value;
        corSecundariaTexto.value = corSecundariaInput.value;
        corTextoDarkTexto.value = corTextoDarkInput.value;
        
        salvarOrcamento();
    }

    // Calcula o valor total
    function calcularTotal() {
        const precos = document.querySelectorAll('.servico-preco');
        let total = 0;
        
        precos.forEach(preco => {
            const valor = parseFloat(preco.getAttribute('data-valor')) || 0;
            total += valor;
        });
        
        valorTotal.textContent = `Valor Total: ${formatarMoeda(total)}`;
    }

    // Formata valores monetários
    function formatarMoeda(valor) {
        const numero = typeof valor === 'string' 
            ? parseFloat(valor.replace(/\./g, '').replace(',', '.')) 
            : Number(valor);
            
        return numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Configura a barra lateral
    function configurarSidebar() {
        // Eventos para cores
        [corPrimariaInput, corSecundariaInput, corTextoDarkInput].forEach(input => {
            input.addEventListener('input', updateColors);
        });
        
        // Atualiza campos de texto das cores
        [corPrimariaTexto, corSecundariaTexto, corTextoDarkTexto].forEach(input => {
            input.addEventListener('change', function() {
                const colorInput = document.getElementById(this.id.replace('-texto', ''));
                if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                    colorInput.value = this.value;
                    updateColors();
                }
            });
        });

        // Botão de fechar sidebar (mobile)
        if (sidebarCloseBtn) {
            sidebarCloseBtn.addEventListener('click', function() {
                document.querySelector('.editor-sidebar').classList.remove('active');
                document.querySelector('.sidebar-overlay').classList.remove('active');
            });
        }
    }

    // Configura o modal de serviço
    function configurarModalServico() {
        btnAdicionarServico.addEventListener('click', () => {
            modalAdicionarServico.style.display = 'flex';
            inputNomeServico.focus();
        });

        btnSalvarServico.addEventListener('click', function() {
            const nome = inputNomeServico.value.trim();
            const descricao = inputDescricaoServico.value.trim();
            const valor = inputValorServico.value.trim();
            
            if (nome && valor) {
                adicionarServico(nome, descricao, valor);
                modalAdicionarServico.style.display = 'none';
                inputNomeServico.value = '';
                inputDescricaoServico.value = '';
                inputValorServico.value = '';
            } else {
                alert('Por favor, preencha pelo menos o nome e o valor do serviço.');
            }
        });

        modalAdicionarServico.addEventListener('click', function(e) {
            if (e.target === modalAdicionarServico) {
                modalAdicionarServico.style.display = 'none';
            }
        });
    }

    // Configura o modal de imagem
    function configurarModalImagem() {
        bannerImagem.addEventListener('click', function() {
            urlImagemInput.value = bannerImagem.src;
            modalImagem.style.display = 'flex';
            urlImagemInput.focus();
        });

        btnSalvarImagem.addEventListener('click', function() {
            const novaUrl = urlImagemInput.value.trim();
            
            if (novaUrl) {
                try {
                    new URL(novaUrl);
                    bannerImagem.src = novaUrl;
                    modalImagem.style.display = 'none';
                    salvarOrcamento();
                } catch (e) {
                    alert('Por favor, insira uma URL válida (começando com http:// ou https://)');
                }
            } else {
                alert('Por favor, insira uma URL para a imagem');
            }
        });

        btnCancelarImagem.addEventListener('click', function() {
            modalImagem.style.display = 'none';
        });

        modalImagem.addEventListener('click', function(e) {
            if (e.target === modalImagem) {
                modalImagem.style.display = 'none';
            }
        });
    }

    // Configura o exemplo inicial
    function configurarExemplo() {
        const exemplo = document.querySelector('.servico');
        if (exemplo) {
            configurarEdicaoItem(exemplo);
        }
    }

    // Controle do menu lateral mobile
    function setupMobileMenu() {
        const toggleBtn = document.querySelector('.toggle-sidebar');
        const sidebar = document.querySelector('.editor-sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        
        if (!toggleBtn || !sidebar || !overlay) return;
    
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });
    
        // Mostrar o botão de fechar em todas as resoluções
        if (sidebarCloseBtn) {
            sidebarCloseBtn.style.display = 'block';
        }
        
    }

    // Configura o botão para limpar dados
    function configurarBotaoLimpar() {
        document.querySelector('.botao-limpar')?.addEventListener('click', function() {
            if (confirm('Tem certeza que deseja limpar todos os dados salvos?')) {
                localStorage.removeItem('orcamentoSalvo');
                location.reload();
            }
        });
    }

    // Formatação do input de valor
    inputValorServico.addEventListener('input', function(e) {
        let valor = e.target.value.replace(/[^\d,]/g, '');
        valor = valor.replace(/,+/g, ',');
        
        if (valor.includes(',')) {
            const partes = valor.split(',');
            if (partes[1] && partes[1].length > 2) {
                valor = partes[0] + ',' + partes[1].substring(0, 2);
            }
        }
        
        e.target.value = valor;
    });

    // Configura a edição do título e descrição
    function configurarEdicaoConteudo() {
        // Título
        tituloTexto.addEventListener('dblclick', () => tituloTexto.focus());
        tituloTexto.addEventListener('blur', salvarOrcamento);
        
        // Descrição
        const descricaoOrcamento = document.querySelector('.descricao-orcamento');
        descricaoOrcamento.addEventListener('blur', salvarOrcamento);
        descricaoOrcamento.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                descricaoOrcamento.blur();
            }
        });
    }

    // Inicialização
    function init() {
        configurarSidebar();
        configurarModalServico();
        configurarModalImagem();
        configurarExemplo();
        setupMobileMenu();
        configurarBotaoLimpar();
        configurarEdicaoConteudo();
        
        carregarOrcamento();
        
        document.querySelectorAll('.servico').forEach(servico => {
            configurarEdicaoItem(servico);
        });
    }

    init();
});