document.addEventListener('DOMContentLoaded', function() {
    const botaoDownload = document.querySelector('.botao-download');
    
    if (!botaoDownload) return;

    botaoDownload.addEventListener('click', async function() {
        const botao = this;
        const textoOriginal = botao.innerHTML;
        
        try {
            // Feedback visual mínimo
            botao.disabled = true;
            botao.innerHTML = `
                <span class="loading-spinner"></span>
            `;
            
            const scale = window.devicePixelRatio > 1 ? 3 : 2;
            
            const canvas = await html2canvas(document.querySelector('.orcamento'), {
                scale,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#FFFFFF',
                logging: false,
                ignoreElements: (element) => {
                    // Elementos que serão removidos da imagem final
                    return element.classList.contains('adicionar-servico') || 
                           element.classList.contains('toggle-sidebar') ||
                           element.classList.contains('remover-servico');
                },
                onclone: (clonedDoc) => {
                    // Remove completamente os elementos indesejados do clone
                    const btnAdicionar = clonedDoc.querySelector('.adicionar-servico');
                    if (btnAdicionar) btnAdicionar.remove();
                    
                    // Remove qualquer feedback visual de loading
                    const loadingElements = clonedDoc.querySelectorAll('.loading-spinner');
                    loadingElements.forEach(el => el.remove());
                    
                    // Melhora a aparência para exportação
                    clonedDoc.querySelector('.orcamento').style.boxShadow = 'none';
                    clonedDoc.querySelectorAll('[contenteditable="true"]').forEach(el => {
                        el.style.cursor = 'default';
                    });
                }
            });
            
            // Cria link de download
            const link = document.createElement('a');
            link.download = `Orcamento_${new Date().toISOString().slice(0,10)}.png`;
            link.href = canvas.toDataURL('image/png');
            
            // Dispara o download silenciosamente
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error("Erro ao gerar imagem:", error);
        } finally {
            // Restaura o botão rapidamente sem mensagens
            setTimeout(() => {
                botao.disabled = false;
                botao.innerHTML = textoOriginal;
            }, 300);
        }
    });
});