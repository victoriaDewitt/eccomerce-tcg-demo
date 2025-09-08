// ====== Variables modal login ======
const btnLogin = document.getElementById('btn-login');
const modal = document.getElementById('modal-login');
const modalClose = document.getElementById('modal-close');
const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');
const toggleAuth = document.getElementById('toggle-auth');
const emailContainer = document.getElementById('email-container');
const authSubmit = document.getElementById('auth-submit');
let isLogin = true; // true = login, false = registro

// ====== Abrir y cerrar modal ======
btnLogin?.addEventListener('click', () => modal.style.display = 'block');
modalClose?.addEventListener('click', () => modal.style.display = 'none');
window.addEventListener('click', e => { if(e.target === modal) modal.style.display = 'none'; });

// ====== Toggle Login / Registro ======
toggleAuth?.addEventListener('click', (e) => {
  e.preventDefault();
  isLogin = !isLogin;

  if (isLogin) {
    authSubmit.textContent = 'Login';
    toggleAuth.textContent = 'Register';
    emailContainer.style.display = 'none';
    document.getElementById('modal-title').textContent = 'Login';
  } else {
    authSubmit.textContent = 'Register';
    toggleAuth.textContent = 'Login';
    emailContainer.style.display = 'block';
    document.getElementById('modal-title').textContent = 'Register';
  }
});

// ====== Función de login/registro ======
authForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const email = document.getElementById('email')?.value;

  const url = isLogin
    ? 'http://localhost:8081/api/auth/login'
    : 'http://localhost:8081/api/auth/register';

  // Enviar como URLSearchParams
  const payload = isLogin
    ? { username, password }
    : { username, email, password };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(payload)
    });

    const data = await res.text(); // ahora Spring retorna texto simple

    if (res.ok) {
      // Guardar en sessionStorage para tu carrito y UI
      sessionStorage.setItem('username', username);
      sessionStorage.setItem('userId', '1'); // ⚠️ Ajusta si tu backend retorna ID real

      btnLogin.textContent = `Hi, ${username}`;
      modal.style.display = 'none';
      authForm.reset();
      authMessage.textContent = '';

      // Cargar carrito
      loadCart();
    } else {
      authMessage.style.color = 'red';
      authMessage.textContent = data || 'Error en login/registro';
    }
  } catch (err) {
    authMessage.style.color = 'red';
    authMessage.textContent = 'Error de conexión';
    console.error(err);
  }
});


// ====== Obtener userId dinámicamente ======
function getUserId() {
  const user = JSON.parse(sessionStorage.getItem('user'));
  return user?.id || null;
}

// ====== Cargar carrito ======
async function loadCart() {
  const userId = getUserId();
  if (!userId) return;

  try {
    const res = await fetch(`http://localhost:8081/api/cart/${userId}`);
    const items = await res.json();
    renderCart(items);
  } catch (err) {
    console.error('Error al cargar carrito:', err);
  }
}

// ====== Renderizar carrito ======
function renderCart(items) {
  const container = document.getElementById('cart-container');
  if (!container) return;
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = '<p>The cart is empty.</p>';
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <p>${item.product.name} x ${item.quantity} - $${(item.product.price * item.quantity).toFixed(2)}</p>
      <button onclick="removeFromCart(${item.product.id})">Eliminar</button>
    `;
    container.appendChild(div);
  });
}

// ====== Agregar al carrito ======
async function addToCart(productId, quantity = 1) {
  const userId = getUserId();
  if (!userId) return alert('Inicia sesión primero.');

  try {
    await fetch(`http://localhost:8081/api/cart/add?userId=${userId}&productId=${productId}&quantity=${quantity}`, { method: 'POST' });
    loadCart();
  } catch (err) {
    console.error('Error al agregar al carrito:', err);
  }
}

// ====== Eliminar del carrito ======
async function removeFromCart(productId) {
  const userId = getUserId();
  if (!userId) return;

  try {
    await fetch(`http://localhost:8081/api/cart/remove?userId=${userId}&productId=${productId}`, { method: 'DELETE' });
    loadCart();
  } catch (err) {
    console.error('Error al eliminar del carrito:', err);
  }
}

// ====== Mostrar usuario logueado al cargar la página ======
window.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (user) btnLogin.textContent = `Hi, ${user.username}`;
  loadCart();
});

