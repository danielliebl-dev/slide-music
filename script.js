// ESTADO DA APLICAÇÃO
let songs = []; // Lista de músicas: { id, title, versesPerSlide, slides: [] }
let activeSongId = null;

// VARIÁVEIS DE APRESENTAÇÃO
let currentSongIndex = 0;
let currentSlideIndex = 0;

// ELEMENTOS DOM
const songTitleInput = document.getElementById('songTitleInput');
const songLyricsInput = document.getElementById('songLyricsInput');
const versesSelect = document.getElementById('versesPerSlide');
const addSongBtn = document.getElementById('addSongBtn');
const playlist = document.getElementById('playlist');
const songCount = document.getElementById('songCount');
const slidesOutput = document.getElementById('slidesOutput');
const selectedSongTitle = document.getElementById('selectedSongTitle');
const selectedSongSubtitle = document.getElementById('selectedSongSubtitle');
const startPresentationBtn = document.getElementById('startPresentationBtn');
const clearAllBtn = document.getElementById('clearAllBtn');

// ELEMENTOS DO MODAL DE APRESENTAÇÃO
const presentationModal = document.getElementById('presentationModal');
const presentationText = document.getElementById('presentationText');
const currentSongBadge = document.getElementById('currentSongBadge');
const currentSongTitle = document.getElementById('currentSongTitle');
const slideCounter = document.getElementById('slideCounter');
const closePresentBtn = document.getElementById('closePresentBtn');
const prevSlideBtn = document.getElementById('prevSlideBtn');
const nextSlideBtn = document.getElementById('nextSlideBtn');

// ADICIONAR MÚSICA
addSongBtn.addEventListener('click', () => {
  const title = songTitleInput.value.trim() || `Música ${songs.length + 1}`;
  const lyrics = songLyricsInput.value.trim();
  const versesPerSlide = parseInt(versesSelect.value, 10);

  if (!lyrics) {
    alert('Por favor, cole a letra da música antes de adicionar.');
    return;
  }

  // Processa as linhas da letra
  const lines = lyrics
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const slides = [];
  for (let i = 0; i < lines.length; i += versesPerSlide) {
    slides.push(lines.slice(i, i + versesPerSlide).join('\n'));
  }

  const newSong = {
    id: Date.now().toString(),
    title,
    slides,
    versesPerSlide
  };

  songs.push(newSong);
  activeSongId = newSong.id;

  // Limpa campos
  songTitleInput.value = '';
  songLyricsInput.value = '';

  renderPlaylist();
  renderSelectedSong();
  updateGlobalButtons();
});

// RENDERIZAR LISTA DE MÚSICAS DA MISSA
function renderPlaylist() {
  playlist.innerHTML = '';
  songCount.textContent = songs.length;

  songs.forEach((song, index) => {
    const li = document.createElement('li');
    li.className = `playlist-item ${song.id === activeSongId ? 'active' : ''}`;
    
    li.innerHTML = `
      <div class="playlist-item-info">
        <span class="playlist-item-title">${index + 1}. ${song.title}</span>
        <span class="playlist-item-details">${song.slides.length} slides</span>
      </div>
      <div class="playlist-item-actions">
        <button class="icon-btn remove-btn" title="Excluir">&times;</button>
      </div>
    `;

    // Selecionar música para ver detalhes
    li.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-btn')) return;
      activeSongId = song.id;
      renderPlaylist();
      renderSelectedSong();
    });

    // Excluir música
    li.querySelector('.remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      songs = songs.filter(s => s.id !== song.id);
      if (activeSongId === song.id) {
        activeSongId = songs.length > 0 ? songs[songs.length - 1].id : null;
      }
      renderPlaylist();
      renderSelectedSong();
      updateGlobalButtons();
    });

    playlist.appendChild(li);
  });
}

// RENDERIZAR DETALHES E SLIDES DA MÚSICA SELECIONADA
function renderSelectedSong() {
  slidesOutput.innerHTML = '';

  const song = songs.find(s => s.id === activeSongId);

  if (!song) {
    selectedSongTitle.textContent = 'Selecione ou adicione uma música';
    selectedSongSubtitle.textContent = 'Os slides gerados aparecerão abaixo para conferência.';
    slidesOutput.innerHTML = `
      <div class="empty-state">
        <span>🎵</span>
        <p>Nenhuma música selecionada. Adicione músicas no painel lateral à esquerda para começar a montar o repertório da missa.</p>
      </div>
    `;
    return;
  }

  selectedSongTitle.textContent = song.title;
  selectedSongSubtitle.textContent = `Abaixo estão os ${song.slides.length} slides formatados para esta música.`;

  song.slides.forEach((slideText, index) => {
    const slideBox = document.createElement('div');
    slideBox.className = 'slide-box';

    slideBox.innerHTML = `
      <div>
        <span class="slide-header">Slide ${index + 1}</span>
        <div class="slide-content">${slideText}</div>
      </div>
    `;

    slidesOutput.appendChild(slideBox);
  });
}

function updateGlobalButtons() {
  const hasSongs = songs.length > 0;
  startPresentationBtn.disabled = !hasSongs;
  clearAllBtn.disabled = !hasSongs;
}

// LIMPAR TUDO
clearAllBtn.addEventListener('click', () => {
  if (confirm('Deseja realmente limpar todo o repertório da missa?')) {
    songs = [];
    activeSongId = null;
    renderPlaylist();
    renderSelectedSong();
    updateGlobalButtons();
  }
});

// MODAL DE APRESENTAÇÃO
startPresentationBtn.addEventListener('click', () => {
  if (songs.length === 0) return;

  const initialIndex = songs.findIndex(s => s.id === activeSongId);
  currentSongIndex = initialIndex !== -1 ? initialIndex : 0;
  currentSlideIndex = 0;

  updatePresentationModal();
  presentationModal.classList.remove('hidden');

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }
});

function closePresentation() {
  presentationModal.classList.add('hidden');
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

closePresentBtn.addEventListener('click', closePresentation);

// ATUALIZA CONTEÚDO DA APRESENTAÇÃO
function updatePresentationModal() {
  const song = songs[currentSongIndex];
  if (!song) return;

  currentSongBadge.textContent = `Música ${currentSongIndex + 1} de ${songs.length}`;
  currentSongTitle.textContent = song.title;
  presentationText.textContent = song.slides[currentSlideIndex];
  slideCounter.textContent = `Slide ${currentSlideIndex + 1} / ${song.slides.length}`;
}

// NAVEGAÇÃO DE SLIDES E MÚSICAS
function nextSlide() {
  const song = songs[currentSongIndex];
  if (currentSlideIndex < song.slides.length - 1) {
    currentSlideIndex++;
  } else if (currentSongIndex < songs.length - 1) {
    // Passa para a próxima música da missa
    currentSongIndex++;
    currentSlideIndex = 0;
  }
  updatePresentationModal();
}

function prevSlide() {
  if (currentSlideIndex > 0) {
    currentSlideIndex--;
  } else if (currentSongIndex > 0) {
    // Volta para a música anterior da missa (no último slide dela)
    currentSongIndex--;
    currentSlideIndex = songs[currentSongIndex].slides.length - 1;
  }
  updatePresentationModal();
}

function nextSong() {
  if (currentSongIndex < songs.length - 1) {
    currentSongIndex++;
    currentSlideIndex = 0;
    updatePresentationModal();
  }
}

function prevSong() {
  if (currentSongIndex > 0) {
    currentSongIndex--;
    currentSlideIndex = 0;
    updatePresentationModal();
  }
}

prevSlideBtn.addEventListener('click', prevSlide);
nextSlideBtn.addEventListener('click', nextSlide);

// ATALHOS DO TECLADO NO MODO APRESENTAÇÃO
document.addEventListener('keydown', (e) => {
  if (presentationModal.classList.contains('hidden')) return;

  if (e.key === 'ArrowRight' || e.key === ' ') {
    e.preventDefault();
    nextSlide();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevSlide();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    nextSong(); // Seta para Baixo pula para a próxima música
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    prevSong(); // Seta para Cima volta para a música anterior
  } else if (e.key === 'Escape') {
    closePresentation();
  }
});
