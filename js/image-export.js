document.addEventListener('DOMContentLoaded', function() {
    const botaoDownload = document.querySelector('.botao-download');
    const orcamentoElement = document.querySelector('.orcamento');

    if (!botaoDownload || !orcamentoElement) {
        console.error("Elementos essenciais não encontrados.");
        return;
    }

    botaoDownload.addEventListener('click', async function() {
        const botao = this;
        const textoOriginal = botao.innerHTML;

        botao.disabled = true;
        botao.innerHTML = `<span class="loading-spinner" style="margin: 0 auto;"></span> Gerando...`;

        try {
            console.log("Iniciando captura com html2canvas...");
            const scale = window.devicePixelRatio > 1 ? 2 : 1;

            const canvas = await html2canvas(orcamentoElement, {
                scale: scale,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                logging: true, // Mantenha para debug se necessário
                onclone: (clonedDoc) => {
                    console.log("Clonando documento para captura...");
                    // --- Modificações APENAS no clone ---

                    // Remove botões interativos e outros elementos indesejados (código existente)
                    const elementsToRemove = clonedDoc.querySelectorAll(
                        '.adicionar-servico, .toggle-sidebar, .remover-servico, .botao-download .loading-spinner'
                        // Não precisamos mais do .adicionar-servico aqui, pois a div pai (.acoes) será removida
                    );
                    elementsToRemove.forEach(el => {
                        // Verificação defensiva
                        if (el && !el.classList.contains('acoes')) { // Evita tentar remover .acoes duas vezes se estivesse no seletor
                           console.log("Removendo elemento interativo do clone:", el.className || el.tagName);
                           el.remove();
                        }
                    });

                    // ***** NOVO CÓDIGO *****
                    // Remove toda a seção de ações (abaixo do total) do clone
                    const acoesDiv = clonedDoc.querySelector('.acoes');
                    if (acoesDiv) {
                        console.log("Removendo seção de ações (.acoes) do clone.");
                        acoesDiv.remove(); // Remove a div inteira com os botões de baixo
                    } else {
                        console.warn("Seção .acoes não encontrada no clone para remoção.");
                    }
                    // ***** FIM DO NOVO CÓDIGO *****

                    // Remover sombra apenas no clone (código existente)
                    const clonedOrcamento = clonedDoc.querySelector('.orcamento');
                    if (clonedOrcamento) {
                        clonedOrcamento.style.boxShadow = 'none';
                        console.log("Removida sombra do clone.");
                    }

                    // Resetar cursor dos editáveis apenas no clone (código existente)
                    const clonedEditables = clonedDoc.querySelectorAll('[contenteditable="true"]');
                    clonedEditables.forEach(el => {
                        el.style.cursor = 'default';
                    });
                    console.log("Resetado cursor dos editáveis no clone.");
                    // --- Fim das modificações no clone ---
                }
            });

            console.log("Captura concluída. Gerando Data URL...");
            const dataUrl = canvas.toDataURL('image/png');

             if (!dataUrl || dataUrl === 'data:,') {
                 throw new Error("Falha ao gerar Data URL (canvas vazio?). Verifique console.");
             }

            console.log("Data URL gerada. Criando link...");
            const link = document.createElement('a');
            const tituloElement = document.getElementById('titulo-texto');
            const nomeArquivoBase = tituloElement ? tituloElement.textContent.trim().replace(/[^a-z0-9]/gi, '_') : 'Orcamento';
            link.download = `${nomeArquivoBase || 'Orcamento'}_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = dataUrl;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("Download disparado.");

        } catch (error) {
            console.error("Erro detalhado ao gerar imagem:", error);
            botao.innerHTML = 'Erro!';

        } finally {
            setTimeout(() => {
                if (botao) {
                   botao.disabled = false;
                   botao.innerHTML = textoOriginal;
                   console.log("Botão restaurado.");
                }
            }, 1000);
        }
    });
});