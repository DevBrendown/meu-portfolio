const LINK_DEPOIMENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTY4kVmAgmRH78nNTbZKPcHABd2u5NOqtvUoscWuhWwmp9oMb4ap0hZQf5wpmyvhmtcAbSKV3d3Y89U/pub?gid=0&single=true&output=csv";
const LINK_PROJETOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTY4kVmAgmRH78nNTbZKPcHABd2u5NOqtvUoscWuhWwmp9oMb4ap0hZQf5wpmyvhmtcAbSKV3d3Y89U/pub?gid=1375268468&single=true&output=csv";

let currentIndex = 0;
let cards = [];
let track = null;
let projetoIndexAtual = 0;
let listaDeProjetosCards = [];

// Variáveis do efeito de digitação (globais, para o i18n.js poder trocar as frases)
window.phrases = ["soluções web inteligentes.", "automações eficientes.", "interfaces modernas.", "resultados reais."];
window.phraseIndex = 0;
window.charIndex = 0;
window.isDeleting = false;

function typeEffect() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;
    const currentPhrase = window.phrases[window.phraseIndex];

    if (window.isDeleting) {
        textElement.textContent = currentPhrase.substring(0, window.charIndex - 1);
        window.charIndex--;
    } else {
        textElement.textContent = currentPhrase.substring(0, window.charIndex + 1);
        window.charIndex++;
    }

    let typeSpeed = window.isDeleting ? 50 : 90;

    if (!window.isDeleting && window.charIndex === currentPhrase.length) {
        typeSpeed = 2000;
        window.isDeleting = true;
    } else if (window.isDeleting && window.charIndex === 0) {
        window.isDeleting = false;
        window.phraseIndex = (window.phraseIndex + 1) % window.phrases.length;
        typeSpeed = 500;
    }
    setTimeout(typeEffect, typeSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDepoimentosDaPlanilha();
    carregarProjetosDaPlanilha();
    inicializarEventosModaisEObserver(); // Ativa as funções para fechar e escutar cliques do modal ao iniciar

    typeEffect();

    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.querySelector('.navbar');
    const navLinksClick = document.querySelectorAll('.nav-links li a');

    if (mobileMenu && navbar) {
        mobileMenu.addEventListener('click', () => navbar.classList.toggle('active'));
        navLinksClick.forEach(link => link.addEventListener('click', () => navbar.classList.remove('active')));
    }

    const panel = document.querySelector('.theme-panel');
    const toggle = document.querySelector('.panel-toggle');
    const colorDots = document.querySelectorAll('.color-dot');
    const heroProfileImg = document.querySelector('.hero-profile-img');

    if (toggle && panel) {
        toggle.addEventListener('click', () => panel.classList.toggle('open'));
    }

    const themes = {
        orange: { primary: '#f6803b', hover: '#eb9c25' },
        green: { primary: '#289424', hover: '#11550f' },
        blue: { primary: '#3b76f6', hover: '#2553eb' },
        red: { primary: '#bb2424', hover: '#ff0000' }
    };

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const color = dot.getAttribute('data-color');
            document.documentElement.style.setProperty('--accent-blue', themes[color].primary);
            document.documentElement.style.setProperty('--accent-hover', themes[color].hover);

            if (heroProfileImg) {
                heroProfileImg.style.opacity = '0';
                heroProfileImg.style.transform = 'scale(0.8)';
                setTimeout(() => {
                    heroProfileImg.src = `assets/img/perfil/my-picture-${color}.png`;
                    heroProfileImg.style.opacity = '1';
                    heroProfileImg.style.transform = 'scale(1)';
                }, 400);
            }
        });
    });
});

// FUNÇÃO GLOBAL RESPONSÁVEL POR INJETAR OS DADOS NO SEU MODAL E ABRI-LO
function abrirModalProjeto(titulo, descricao, siteUrl, githubUrl) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    document.getElementById('modal-title').innerText = titulo;
    document.getElementById('modal-description').innerText = descricao;
    document.getElementById('modal-site').href = siteUrl;
    document.getElementById('modal-github').href = githubUrl;

    modal.style.display = 'flex';
}

function parsearLinhaCSV(linha) {
    const colunas = [];
    let colunaAtual = '';
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i++) {
        const char = linha[i]; // Correção do bug de atribuição dupla (line = linha[i])
        if (char === '"') {
            dentroDeAspas = !dentroDeAspas;
        } else if (char === ',' && !dentroDeAspas) {
            colunas.push(colunaAtual.trim().replace(/^"|"$/g, ''));
            colunaAtual = '';
        } else {
            colunaAtual += char;
        }
    }
    colunas.push(colunaAtual.trim().replace(/^"|"$/g, ''));
    return colunas;
}

function carregarDepoimentosDaPlanilha() {
    const container = document.getElementById('depoimentos-container');
    if (!container) return;

    fetch(LINK_DEPOIMENTOS)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split(/\r?\n/);
            const dataLines = lines.slice(1).filter(line => line.trim() !== '');

            container.innerHTML = '';

            dataLines.forEach(line => {
                const columns = parsearLinhaCSV(line);

                if (columns.length >= 3) {
                    const status = columns[5] ? columns[5].toLowerCase() : 'inativo';
                    if (status !== 'ativo') return;

                    const texto = columns[0];
                    const nome = columns[1];
                    const cargo = columns[2];
                    const logo = columns[3] || 'assets/img/icons/default-company.png';
                    const altLogo = columns[4] || `Logo ${nome}`;

                    container.innerHTML += `
                        <div class="depoimento-card-v2">
                            <div class="quote-icon">”</div>
                            <p>${texto}</p>
                            <div class="cliente-info">
                                <div class="empresa-logo">
                                    <img src="${logo}" alt="${altLogo}">
                                </div>
                                <div class="cliente-detalhes">
                                    <span class="nome">${nome}</span>
                                    <span class="cargo">${cargo}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });
            inicializarEventosCarrossel();
        })
        .catch(error => console.error('Erro ao carregar depoimentos:', error));
}

function carregarProjetosDaPlanilha() {
    const container = document.getElementById('projetos-container');
    if (!container) return;

    fetch(LINK_PROJETOS)
        .then(response => response.text())
        .then(csvText => {
            const lines = csvText.split(/\r?\n/);
            const dataLines = lines.slice(1).filter(line => line.trim() !== '');

            container.innerHTML = '';

            dataLines.forEach(line => {
                const columns = parsearLinhaCSV(line);

                if (columns.length >= 5) {
                    const status = columns[5] ? columns[5].toLowerCase() : 'inativo';
                    if (status !== 'ativo') return;

                    // NOVO: só entra no carrossel de destaque da home quem tiver "SIM" na coluna G (índice 6)
                    const destaque = columns[6] ? columns[6].toLowerCase() : 'nao';
                    if (destaque !== 'sim') return;

                    const titulo = columns[0];
                    const desc = columns[1];
                    const site = columns[2];
                    const github = columns[3];
                    const imagem = columns[4] || 'assets/img/projetos/default.png';

                    // Limpa quebras de linha e aspas para o parâmetro não quebrar a string do Javascript
                    const descTratada = desc.replace(/'/g, "\\'").replace(/\r?\n/g, " ");

                    container.innerHTML += `
                        <div class="card-projeto-3d" data-titulo="${titulo}" data-desc="${desc}" data-site="${site}" data-github="${github}">
                                <img src="${imagem}" alt="${titulo}" class="projeto-img-3d">
                                <div class="projeto-info-3d">
                                    <h3>${titulo}</h3>
                                    <p style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 1px;">
                                        ${desc.substring(0, 60)}... 
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

            listaDeProjetosCards = document.querySelectorAll('.card-projeto-3d');
            inicializarControles3D();
        })
        .catch(error => console.error('Erro ao carregar projetos 3D:', error));
}

function atualizarCarrossel3D() {
    const total = listaDeProjetosCards.length;
    if (total === 0) return;

    listaDeProjetosCards.forEach((card, index) => {
        card.classList.remove('active', 'prev', 'next');

        if (index === projetoIndexAtual) {
            card.classList.add('active');
        } else if (index === (projetoIndexAtual - 1 + total) % total) {
            card.classList.add('prev');
        } else if (index === (projetoIndexAtual + 1) % total) {
            card.classList.add('next');
        }
    });
}

function inicializarControles3D() {
    const btnPrev3D = document.querySelector('.btn-projeto-prev');
    const btnNext3D = document.querySelector('.btn-projeto-next');

    if (listaDeProjetosCards.length === 0) return;

    atualizarCarrossel3D();

    if (btnNext3D && btnPrev3D) {
        btnNext3D.onclick = () => {
            projetoIndexAtual = (projetoIndexAtual + 1) % listaDeProjetosCards.length;
            atualizarCarrossel3D();
        };

        btnPrev3D.onclick = () => {
            projetoIndexAtual = (projetoIndexAtual - 1 + listaDeProjetosCards.length) % listaDeProjetosCards.length;
            atualizarCarrossel3D();
        };
    }
}

function inicializarEventosModaisEObserver() {
    const modal = document.getElementById('project-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-description');
    const modalSite = document.getElementById('modal-site');
    const modalGithub = document.getElementById('modal-github');
    const closeModal = document.querySelector('.close-modal');

    document.querySelectorAll('.btn-open-modal').forEach(btn => {
        btn.onclick = (e) => {
            const card = e.target.closest('.card-projeto');
            if (card) {
                modalTitle.textContent = card.dataset.titulo;
                modalDesc.textContent = card.dataset.desc;
                modalSite.href = card.dataset.site;
                modalGithub.href = card.dataset.github;
                if (modal) modal.style.display = 'flex';
            }
        };
    });

    if (closeModal) {
        closeModal.onclick = () => { if (modal) modal.style.display = 'none'; };
    }

    window.onclick = (e) => {
        if (e.target === modal) { modal.style.display = 'none'; }
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.hidden').forEach(el => observer.observe(el));
}

function inicializarEventosCarrossel() {
    track = document.querySelector('.carrossel-track');
    cards = document.querySelectorAll('.carrossel-track .depoimento-card-v2');
    const btnPrev = document.querySelector('.btn-prev');
    const btnNext = document.querySelector('.btn-next');

    if (!track || cards.length === 0 || !btnPrev || !btnNext) return;

    function getCardsPerView() {
        return window.innerWidth >= 768 ? 2 : 1;
    }

    function moveCarrossel(targetIndex) {
        const cardsPerView = getCardsPerView();
        const maxStartIndex = cards.length - cardsPerView;

        if (targetIndex > maxStartIndex) {
            currentIndex = 0;
        } else if (targetIndex < 0) {
            currentIndex = maxStartIndex < 0 ? 0 : maxStartIndex;
        } else {
            currentIndex = targetIndex;
        }

        const cardWidth = cards[0].getBoundingClientRect().width + 30;
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    }

    btnNext.onclick = () => moveCarrossel(currentIndex + 1);
    btnPrev.onclick = () => moveCarrossel(currentIndex - 1);

    window.addEventListener('resize', () => moveCarrossel(0));
    moveCarrossel(0);
}