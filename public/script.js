// ============================================
// VARIABLES GLOBALES
// ============================================
const API_BASE_URL = 'https://www.cheapshark.com/api/1.0';
let games = [];
let filteredGames = [];
let currentPage = 0;
let isLoading = false;
let searchMode = false;
let currentStoreFilter = '';
let currentSortOption = 'default';

// Elementos del DOM
const gameContainer = document.getElementById('gameContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const errorContainer = document.getElementById('errorContainer');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const storeFilter = document.getElementById('storeFilter');
const sortSelect = document.getElementById('sortSelect');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const detailModal = document.getElementById('detailModal');
const closeModalBtn = document.getElementById('closeModalBtn');

// ============================================
// FUNCIONES DE API
// ============================================

/**
 * Obtiene juegos del endpoint /deals de CheapShark
 * @param {number} pageSize - Cantidad de juegos a cargar (default: 20)
 * @param {number} pageNumber - Número de página
 * @param {string} storeID - ID de la tienda (opcional)
 * @returns {Promise<Array>} Array de juegos
 */
async function fetchGames(pageSize = 20, pageNumber = 0, storeID = '') {
  try {
    showLoading(true);
    hideError();
    
    let url = `${API_BASE_URL}/deals?pageSize=${pageSize}&pageNumber=${pageNumber}`;
    if (storeID) {
      url += `&storeID=${storeID}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener los juegos');
    }
    
    const data = await response.json();
    showLoading(false);
    return data;
  } catch (error) {
    showLoading(false);
    showError(`No se pudieron cargar los juegos: ${error.message}`);
    console.error('Error en fetchGames:', error);
    return [];
  }
}

/**
 * Busca juegos por nombre
 * @param {string} searchTerm - Término de búsqueda
 * @returns {Promise<Array>} Array de juegos encontrados
 */
async function searchGames(searchTerm) {
  try {
    if (!searchTerm.trim()) {
      showError('Por favor, ingresa un término de búsqueda');
      return [];
    }
    
    showLoading(true);
    hideError();
    
    const url = `${API_BASE_URL}/games?title=${encodeURIComponent(searchTerm)}&limit=20`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al buscar juegos');
    }
    
    const data = await response.json();
    showLoading(false);
    
    if (data.length === 0) {
      showError('No se encontraron juegos con ese nombre');
      return [];
    }
    
    return data;
  } catch (error) {
    showLoading(false);
    showError(`Error en la búsqueda: ${error.message}`);
    console.error('Error en searchGames:', error);
    return [];
  }
}

/**
 * Obtiene detalles de una deal específica
 * @param {string} dealID - ID del deal
 * @returns {Promise<Object>} Objeto con detalles del deal
 */
async function fetchDealDetails(dealID) {
  try {
    const url = `${API_BASE_URL}/deals?id=${dealID}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles');
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error('Error en fetchDealDetails:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE RENDERIZADO
// ============================================

/**
 * Crea una tarjeta de juego
 * @param {Object} game - Objeto del juego
 * @returns {HTMLElement} Elemento de tarjeta
 */
function createGameCard(game) {
  const card = document.createElement('div');
  card.className = 'bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer transform hover:scale-105 transition-transform';
  
  const discount = Math.round(game.savings);
  const salePrice = parseFloat(game.salePrice) || 0;
  const normalPrice = parseFloat(game.normalPrice) || 0;
  
  card.innerHTML = `
    <div class="relative">
      <img src="${game.thumb}" alt="${game.title}" class="w-full h-40 object-cover bg-slate-200">
      ${discount > 0 ? `<div class="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded font-bold text-sm">-${discount}%</div>` : ''}
    </div>
    <div class="p-4">
      <h3 class="font-semibold text-slate-900 truncate">${game.title}</h3>
      <div class="mt-3 space-y-1">
        ${normalPrice > 0 ? `<p class="text-xs text-slate-500 line-through">$${normalPrice.toFixed(2)}</p>` : ''}
        <p class="text-lg font-bold text-green-600">$${salePrice.toFixed(2)}</p>
      </div>
      <button class="mt-4 w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition view-detail-btn" data-game='${JSON.stringify(game)}'>
        Ver detalle
      </button>
    </div>
  `;
  
  card.addEventListener('click', () => showDetailModal(game));
  
  return card;
}

/**
 * Renderiza los juegos en el contenedor
 * @param {Array} gamesToRender - Array de juegos a mostrar
 */
function renderGames(gamesToRender) {
  gameContainer.innerHTML = '';
  
  if (gamesToRender.length === 0) {
    gameContainer.innerHTML = '<p class="col-span-full text-center text-slate-500 py-8">No se encontraron juegos.</p>';
    loadMoreBtn.classList.add('hidden');
    return;
  }
  
  gamesToRender.forEach(game => {
    const card = createGameCard(game);
    gameContainer.appendChild(card);
  });
  
  // Mostrar botón "Cargar más" solo si estamos en modo de deals y no en búsqueda
  if (!searchMode && gamesToRender.length >= 20) {
    loadMoreBtn.classList.remove('hidden');
  } else {
    loadMoreBtn.classList.add('hidden');
  }
}

/**
 * Muestra el modal de detalles de un juego
 * @param {Object} game - Objeto del juego
 */
function showDetailModal(game) {
  const normalPrice = parseFloat(game.normalPrice) || 0;
  const salePrice = parseFloat(game.salePrice) || 0;
  const discount = Math.round(game.savings);
  
  document.getElementById('modalTitle').textContent = game.title;
  document.getElementById('modalImage').src = game.thumb;
  document.getElementById('modalImage').alt = game.title;
  document.getElementById('modalNormalPrice').textContent = normalPrice > 0 ? `$${normalPrice.toFixed(2)}` : 'N/A';
  document.getElementById('modalSalePrice').textContent = `$${salePrice.toFixed(2)}`;
  document.getElementById('modalDiscount').textContent = `${discount}% OFF`;
  document.getElementById('modalStore').textContent = getStoreName(game.storeID) || 'Tienda desconocida';
  document.getElementById('modalStoreLink').href = game.dealID ? `https://www.cheapshark.com/redirect/deal/${game.dealID}` : '#';
  
  detailModal.classList.remove('hidden');
}

/**
 * Cierra el modal de detalles
 */
function hideDetailModal() {
  detailModal.classList.add('hidden');
}

/**
 * Obtiene el nombre de la tienda por ID
 * @param {string} storeID - ID de la tienda
 * @returns {string} Nombre de la tienda
 */
function getStoreName(storeID) {
  const storeNames = {
    '1': 'Steam',
    '2': 'Best in Slot',
    '3': 'GamersGate',
    '4': 'Green Man Gaming',
    '5': 'Amazon',
    '6': 'Voidu',
    '7': 'Epic Games Store',
    '8': 'Humble Store',
    '9': '2Game',
    '10': 'Fanatical',
    '11': 'GOG',
    '12': 'ShinyLoot',
  };
  return storeNames[storeID] || 'Tienda';
}

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

/**
 * Muestra/oculta el indicador de carga
 * @param {boolean} show - True para mostrar, false para ocultar
 */
function showLoading(show) {
  if (show) {
    loadingIndicator.classList.remove('hidden');
    isLoading = true;
  } else {
    loadingIndicator.classList.add('hidden');
    isLoading = false;
  }
}

/**
 * Muestra un mensaje de error
 * @param {string} message - Mensaje de error
 */
function showError(message) {
  errorMessage.textContent = message;
  errorContainer.classList.remove('hidden');
}

/**
 * Oculta el mensaje de error
 */
function hideError() {
  errorContainer.classList.add('hidden');
  errorMessage.textContent = '';
}

// ============================================
// FUNCIONES DE FILTRADO Y ORDENAMIENTO
// ============================================

/**
 * Filtra y ordena los juegos
 */
function filterAndSort() {
  let toProcess = searchMode ? filteredGames : games;
  
  // Filtrar por tienda si está seleccionada
  if (currentStoreFilter) {
    toProcess = toProcess.filter(game => game.storeID === currentStoreFilter);
  }
  
  // Ordenar según la opción seleccionada
  switch (currentSortOption) {
    case 'price-asc':
      toProcess.sort((a, b) => parseFloat(a.salePrice) - parseFloat(b.salePrice));
      break;
    case 'price-desc':
      toProcess.sort((a, b) => parseFloat(b.salePrice) - parseFloat(a.salePrice));
      break;
    case 'discount':
      toProcess.sort((a, b) => parseFloat(b.savings) - parseFloat(a.savings));
      break;
    case 'name':
      toProcess.sort((a, b) => a.title.localeCompare(b.title));
      break;
    default:
      break;
  }
  
  renderGames(toProcess);
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Inicializa los event listeners
 */
function initEventListeners() {
  // Botón de búsqueda
  searchBtn.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    if (searchTerm.trim()) {
      searchMode = true;
      currentPage = 0;
      filteredGames = await searchGames(searchTerm);
      filterAndSort();
    }
  });
  
  // Enter en el input de búsqueda
  searchInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      searchBtn.click();
    }
  });
  
  // Filtro de tienda
  storeFilter.addEventListener('change', (e) => {
    currentStoreFilter = e.target.value;
    filterAndSort();
  });
  
  // Ordenamiento
  sortSelect.addEventListener('change', (e) => {
    currentSortOption = e.target.value;
    filterAndSort();
  });
  
  // Botón Cargar más
  loadMoreBtn.addEventListener('click', async () => {
    currentPage++;
    const newGames = await fetchGames(20, currentPage, currentStoreFilter);
    games = games.concat(newGames);
    filterAndSort();
  });
  
  // Cerrar modal
  closeModalBtn.addEventListener('click', hideDetailModal);
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      hideDetailModal();
    }
  });
}

// ============================================
// INICIALIZACIÓN
// ============================================

/**
 * Inicializa la aplicación
 */
async function initApp() {
  console.log('🎮 GameZone Store iniciada');
  
  // Cargar juegos iniciales
  games = await fetchGames(20, 0);
  
  if (games.length > 0) {
    searchMode = false;
    filterAndSort();
    console.log(`✓ Se cargaron ${games.length} juegos`);
  } else {
    showError('No se pudieron cargar los juegos iniciales. Por favor, recarga la página.');
  }
  
  // Inicializar event listeners
  initEventListeners();
}

// Ejecutar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
