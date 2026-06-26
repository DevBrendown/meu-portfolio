const LINK_DEPOIMENTOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTY4kVmAgmRH78nNTbZKPcHABd2u5NOqtvUoscWuhWwmp9oMb4ap0hZQf5wpmyvhmtcAbSKV3d3Y89U/pub?gid=0&single=true&output=csv";
const LINK_PROJETOS = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTY4kVmAgmRH78nNTbZKPcHABd2u5NOqtvUoscWuhWwmp9oMb4ap0hZQf5wpmyvhmtcAbSKV3d3Y89U/pub?gid=1375268468&single=true&output=csv";

let currentIndex = 0;
let cards = [];
let track = null;

document.addEventListener('DOMContentLoaded', () => {
    carregarDepoimentosDaPlanilha();
    carregarProjetosDaPlanilha();

    const textElement = document.getElementById('typing-text');
    const phrases = ["soluções web inteligentes.", "automações eficientes.", "interfaces modernas.", "resultados reais."];
    let phraseIndex = 0, charIndex = 0, isDeleting = false;

    function typeEffect() {
        if (!textElement) return;
        const currentPhrase = phrases[phraseIndex];

        if (isDeleting) {
            textElement.textContent = currentPhrase.substring(0, charIndex - 1);
            charIndex--;
        } else {
            textElement.textContent = currentPhrase.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 90;

        if (!isDeleting && charIndex === currentPhrase.length) {
            typeSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typeSpeed = 500;
        }
        setTimeout(typeEffect, typeSpeed);
    }
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

function parsearLinhaCSV(linha) {
    const colunas = [];
    let colunaAtual = '';
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i++) {
        const char = line = linha[i];
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

                    const titulo = columns[0];
                    const desc = columns[1];
                    const site = columns[2];
                    const github = columns[3];
                    const imagem = columns[4] || 'assets/img/projetos/default.png';

                    container.innerHTML += `
                        <div class="card-projeto hidden" data-titulo="${titulo}" data-desc="${desc}" data-site="${site}" data-github="${github}">
                            <img src="${imagem}" alt="${titulo}" class="projeto-img">
                            <div class="projeto-info">
                                <h3>${titulo}</h3>
                                <div class="projeto-links">
                                    <a href="${github}" target="_blank" class="btn-icon" title="GitHub"><i class="fab fa-github"></i></a>
                                    <a href="${site}" target="_blank" class="btn-icon" title="Visitar Site"><i class="fas fa-external-link-alt"></i></a>
                                    <button class="btn-open-modal">Mais Info</button>
                                </div>
                            </div>
                        </div>
                    `;
                }
            });

            inicializarEventosModaisEObserver();
        })
        .catch(error => console.error('Erro ao carregar projetos:', error));
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
                if(modal) modal.style.display = 'flex';
            }
        };
    });

    if (closeModal) {
        closeModal.onclick = () => { if(modal) modal.style.display = 'none'; };
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