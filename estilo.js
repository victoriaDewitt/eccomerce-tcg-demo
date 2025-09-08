// ====== Variables modal login ======
const btnLogin = document.getElementById('btn-login');
const modal = document.getElementById('modal-login');
const modalClose = document.getElementById('modal-close');

btnLogin.addEventListener('click', () => modal.style.display = 'block');
modalClose.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

// ====== Animación slide-in ======
function checkSlide() {
  const elements = document.querySelectorAll('.slide-in');
  elements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('active');
  });
}
window.addEventListener('scroll', checkSlide);
window.addEventListener('load', checkSlide);

// ====== Renderizar productos ======
function renderProducts(products) {
  const container = document.getElementById('product-list');
  if (!container) return;

  container.innerHTML = '';

  if (!products || products.length === 0) {
    container.innerHTML = '<p>No hay productos en esta categoría.</p>';
    return;
  }

  products.forEach(product => {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" 
           onerror="this.onerror=null; this.src='img/default.jpg';"/>
      <h3>${product.name}</h3>
      <p>${product.description || 'No description available'}</p>
      <strong>${product.price ? '$' + product.price.toFixed(2) : 'N/A'}</strong>
      <p>Status: ${product.status}</p>
      <button onclick="addToCart(${product.id})">Add to cart</button>
    `;
    container.appendChild(card);
  });

  // Activar animación
  const slideElements = container.querySelectorAll('.slide-in');
  slideElements.forEach(el => {
    void el.offsetWidth; // fuerza reflow
    el.classList.add('active');
  });
}

// ====== Cargar productos desde products.json ======
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('product-list');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || null;

  fetch('products.json') // tu JSON local
    .then(res => res.json())
    .then(products => {
      const filtered = category ? products.filter(p => p.category === category) : products;
      renderProducts(filtered);
    })
    .catch(err => {
      console.error('Error al cargar productos:', err);
      container.innerHTML = '<p>Error al cargar productos.</p>';
    });

  // Inicializar UI y carrito
  updateUI();
  loadCart();
});

// ====== Gestión de usuario y carrito ======
function getUserId() {
  return sessionStorage.getItem('userId');
}

function updateUI() {
  const username = sessionStorage.getItem('username');
  if (username) btnLogin.textContent = `Hi, ${username}`;
  else btnLogin.textContent = 'Sign In';
}

async function loadCart() {
  const userId = getUserId();
  if (!userId) return;

  try {
    // Aquí solo simulamos el carrito porque no hay backend
    const items = JSON.parse(sessionStorage.getItem('cart') || '[]');
    renderCart(items);
  } catch (err) {
    console.error('Error al cargar carrito:', err);
  }
}

function renderCart(items) {
  const container = document.getElementById('cart-container');
  if (!container) return;

  container.innerHTML = '';
  if (!items || items.length === 0) {
    container.innerHTML = '<p>The cart is empty.</p>';
    return;
  }

  let total = 0;
  items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p>${item.name} x ${item.quantity} - $${itemTotal.toFixed(2)}</p>
      <button onclick="removeFromCart(${item.id})">Eliminar</button>
    `;
    container.appendChild(div);
  });

  const totalDiv = document.createElement('div');
  totalDiv.className = 'cart-total';
  totalDiv.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
  container.appendChild(totalDiv);
}

function addToCart(productId, quantity = 1) {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const product = products.find(p => p.id === productId);
  if (!product) return;

  let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
  const existing = cart.find(item => item.id === productId);
  if (existing) existing.quantity += quantity;
  else cart.push({...product, quantity});

  sessionStorage.setItem('cart', JSON.stringify(cart));
  renderCart(cart);
}

function removeFromCart(productId) {
  let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');
  cart = cart.filter(item => item.id !== productId);
  sessionStorage.setItem('cart', JSON.stringify(cart));
  renderCart(cart);
}
