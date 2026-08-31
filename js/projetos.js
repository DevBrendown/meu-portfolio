document.addEventListener('DOMContentLoaded', () => {
    carregarTodosProjetos();
});

function carregarTodosProjetos() {
    const container = document.getElementById('todos-projetos-container');
    if (!container) return;

    fetch(LINK_PROJETOS)
        .then(r => r.text())
        .then(csvText => {
            const lines = csvText.split(/\r?\n/);
            const dataLines = lines.slice(1).filter(l => l.trim() !== '');

            container.innerHTML = '';

            dataLines.forEach(line => {
                const columns = parsearLinhaCSV(line);
                if (columns.length >= 5) {
                    const status = columns[5] ? columns[5].toLowerCase() : 'inativo';
                    if (status !== 'ativo') return; // mostra TODOS os ativos, com ou sem destaque

                    const titulo = columns[0];
                    const desc = columns[1];
                    const site = columns[2];
                    const github = columns[3];
                    const imagem = columns[4] || 'assets/img/projetos/default.png';
                    const descTratada = desc.replace(/'/g, "\\'").replace(/\r?\n/g, " ");

                    container.innerHTML += `
                        <div class="card-projeto-grid">
                            <img src="${imagem}" alt="${titulo}">
                            <div class="card-projeto-grid-info">
                                <h3>${titulo}</h3>
                                <p>${desc.substring(0, 90)}...
                                    <span class="ver-mais-btn" style="color: var(--accent-blue); cursor: pointer; font-weight: 600;" onclick="abrirModalProjeto('${titulo}', '${descTratada}', '${site}', '${github}')">Ver mais</span>
                                </p>
                                <div class="projeto-links-3d">
                                    <a href="${github}" target="_blank" style="color:#fff; font-size:1.4rem;"><i class="fab fa-github"></i></a>
                                    <button class="btn-acessar-projeto" onclick="window.open('${site}', '_blank')">Acessar</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
        })
        .catch(error => console.error('Erro ao carregar todos os projetos:', error));
}