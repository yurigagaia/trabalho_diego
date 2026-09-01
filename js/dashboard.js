/* artes nossas - Admin Dashboard Logic */

// Application State
const state = {
  activeView: 'visao-geral',
  products: [
    { id: 1, name: 'Caneca Cerâmica', category: 'Cerâmica', price: 64.90, stock: 8, status: 'Publicado', image: '../assets/caneca.png' },
    { id: 2, name: 'Cesto de Fibra Natural', category: 'Decoração', price: 89.90, stock: 3, status: 'Publicado', image: '../assets/cesto.png' },
    { id: 3, name: 'Colar de Madeira', category: 'Acessórios', price: 49.90, stock: 0, status: 'Sem estoque', image: '../assets/colar.png' },
    { id: 4, name: 'Painel de Macramê', category: 'Decoração', price: 129.90, stock: 5, status: 'Publicado', image: '../assets/macrame.png' },
    { id: 5, name: 'Bolsa de Palha', category: 'Acessórios', price: 79.90, stock: 2, status: 'Publicado', image: '../assets/bolsa.png' }
  ],
  orders: [
    { id: '1024', customer: 'João Silva', itemsCount: 2, summary: 'Caneca Cerâmica x 2', total: 128.80, status: 'em-producao', date: '15/05/2024 - 10:30', dateShort: 'Hoje', location: 'Linhares - ES', image: '../assets/caneca.png' },
    { id: '1023', customer: 'Ana Souza', itemsCount: 1, summary: 'Colar de Madeira x 1', total: 49.90, status: 'enviado', date: '14/05/2024 - 16:45', dateShort: 'Ontem', location: 'Serra - ES', image: '../assets/colar.png' },
    { id: '1022', customer: 'Carlos Lima', itemsCount: 3, summary: 'Cesto de Fibra x 1 + outros', total: 219.70, status: 'concluido', date: '12/05/2024 - 09:15', dateShort: '12/05', location: 'Vitória - ES', image: '../assets/cesto.png' },
    { id: '1021', customer: 'Juliana Costa', itemsCount: 1, summary: 'Painel de Macramê x 1', total: 129.90, status: 'em-producao', date: '10/05/2024 - 11:20', dateShort: '10/05', location: 'Linhares - ES', image: '../assets/macrame.png' }
  ],
  activeOrdersFilter: 'todos',
  salesChartInstance: null,
  productImageData: '',
  artisans: JSON.parse(localStorage.getItem('artesNossasArtisans') || 'null') || [
    { id: 1, name: 'Maria Artesã', email: 'maria@artesnossas.com.br', phone: '(27) 99912-3456', role: '', permissions: ['produtos','pedidos','vendas','artesaos'], createdAt: new Date().toLocaleString('pt-BR') },
    { id: 2, name: 'Joana Oliveira', email: 'joana@artesnossas.com.br', phone: '(27) 99821-4567', role: 'Artesão', permissions: ['produtos','pedidos'], createdAt: new Date().toLocaleString('pt-BR') }
  ],
  notifications: JSON.parse(localStorage.getItem('artesNossasNotifications') || '[]')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  const savedProducts = JSON.parse(localStorage.getItem('artesNossasProducts') || 'null');
  if (savedProducts) state.products = savedProducts;
  if (window.lucide) {
    lucide.createIcons();
  }
  
  renderRecentOrders();
  renderProductsTable(state.products);
  renderOrdersList();
  syncLivePreview();
  renderArtisans();
  renderNotifications();
});

// View Switcher
function switchView(viewId) {
  state.activeView = viewId;

  // Update Nav Active Class
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.view === viewId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update Active View Section
  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update Page Title Header
  const titleEl = document.getElementById('header-title');
  const subtitleEl = document.getElementById('header-subtitle');

  switch (viewId) {
    case 'visao-geral':
      titleEl.innerHTML = 'Olá, Maria! 👋';
      subtitleEl.textContent = 'Aqui está um resumo da sua loja.';
      break;
    case 'produtos':
      titleEl.textContent = 'Meus produtos';
      subtitleEl.textContent = 'Gerencie seus produtos cadastrados na loja.';
      break;
    case 'pedidos':
      titleEl.textContent = 'Pedidos';
      subtitleEl.textContent = 'Acompanhe e atualize o status dos pedidos.';
      break;
    case 'vendas':
      titleEl.textContent = 'Vendas';
      subtitleEl.textContent = 'Acompanhe o desempenho das suas vendas.';
      setTimeout(initSalesChart, 100);
      break;
    case 'minha-loja':
      titleEl.textContent = 'Minha loja';
      subtitleEl.textContent = 'Edite as informações que aparecem na sua loja.';
      break;
    case 'artesaos':
      titleEl.textContent = 'Artesãos';
      subtitleEl.textContent = 'Gerencie a equipe, cargos e acessos da plataforma.';
      renderArtisans();
      break;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Format Currency Utility
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function persistProducts() {
  try { localStorage.setItem('artesNossasProducts', JSON.stringify(state.products)); }
  catch (error) { showToast('A imagem é grande demais para o armazenamento do navegador.', 'warning'); }
}

// Render Recent Orders Table in Visão Geral
function renderRecentOrders() {
  const tbody = document.getElementById('recent-orders-tbody');
  if (!tbody) return;

  tbody.innerHTML = state.orders.map(order => `
    <tr>
      <td><strong>#${order.id}</strong></td>
      <td>${order.customer}</td>
      <td>${order.itemsCount} ${order.itemsCount === 1 ? 'item' : 'itens'}</td>
      <td><strong>${formatCurrency(order.total)}</strong></td>
      <td>${getStatusBadgeHTML(order.status)}</td>
      <td style="color: var(--text-muted); font-size: 0.82rem;">${order.dateShort}</td>
    </tr>
  `).join('');
}

// Get Badge HTML according to status
function getStatusBadgeHTML(status) {
  switch (status) {
    case 'em-producao':
      return `<span class="badge badge-em-producao">Em produção</span>`;
    case 'enviado':
      return `<span class="badge badge-enviado">Enviado</span>`;
    case 'concluido':
      return `<span class="badge badge-concluido">Concluído</span>`;
    case 'Publicado':
      return `<span class="badge badge-publicado">Publicado</span>`;
    case 'Sem estoque':
      return `<span class="badge badge-sem-estoque">Sem estoque</span>`;
    case 'Pausado':
      return `<span class="badge badge-pausado">Pausado</span>`;
    default:
      return `<span class="badge badge-concluido">${status}</span>`;
  }
}

// Render Products Table
function renderProductsTable(productsList) {
  const tbody = document.getElementById('products-tbody');
  if (!tbody) return;

  if (productsList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">Nenhum produto encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = productsList.map(prod => `
    <tr>
      <td>
        <div class="product-item-cell">
          <img src="${prod.image}" class="product-thumb" alt="${prod.name}">
          <div>
            <div class="product-info-name">${prod.name}</div>
            <div class="product-info-cat">${prod.category}</div>
          </div>
        </div>
      </td>
      <td><strong>${formatCurrency(prod.price)}</strong></td>
      <td>${prod.stock}</td>
      <td>${getArtisanName(prod.artisanId)}</td>
      <td>${getStatusBadgeHTML(prod.status)}</td>
      <td>
        <div class="action-buttons-cell" style="justify-content: flex-end;">
          <button class="icon-btn-action" title="Editar" onclick="openAddProductModal(${prod.id})">
            <i data-lucide="edit-2"></i>
          </button>
          <button class="icon-btn-action" title="${prod.status === 'Pausado' ? 'Ativar' : 'Pausar'}" onclick="toggleProductStatus(${prod.id})">
            <i data-lucide="${prod.status === 'Pausado' ? 'eye' : 'eye-off'}"></i>
          </button>
          <button class="icon-btn-action delete" title="Excluir" onclick="deleteProduct(${prod.id})">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

// Filter Products by Search and Category
function filterProducts() {
  const query = document.getElementById('search-products-input').value.toLowerCase().trim();
  const category = document.getElementById('category-filter-select').value;

  const filtered = state.products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
    const matchesCat = category === 'todas' || p.category === category;
    return matchesQuery && matchesCat;
  });

  renderProductsTable(filtered);
}

function showLowStockProducts() {
  switchView('produtos');
  const searchInput = document.getElementById('search-products-input');
  const categorySelect = document.getElementById('category-filter-select');
  if (searchInput) searchInput.value = '';
  if (categorySelect) categorySelect.value = 'todas';
  const lowStockProducts = state.products.filter(product => product.stock <= 3);
  renderProductsTable(lowStockProducts);
  showToast(`${lowStockProducts.length} produto(s) com estoque baixo.`, 'warning');
}

// Product Modal Handlers
function openAddProductModal(productId = null) {
  const modal = document.getElementById('modal-product');
  const title = document.getElementById('modal-product-title');
  const form = document.getElementById('product-form');

  form.reset();
  fillArtisanSelect();

  if (productId) {
    const prod = state.products.find(p => p.id === productId);
    if (prod) {
      title.textContent = 'Editar produto';
      document.getElementById('prod-form-id').value = prod.id;
      document.getElementById('prod-form-name').value = prod.name;
      document.getElementById('prod-form-category').value = prod.category;
      document.getElementById('prod-form-price').value = prod.price;
      document.getElementById('prod-form-stock').value = prod.stock;
      state.productImageData = prod.image;
      document.getElementById('prod-image-preview').src = prod.image;
      document.getElementById('prod-form-artisan').value = prod.artisanId || state.artisans[0]?.id || '';
    }
  } else {
    title.textContent = 'Adicionar produto';
    document.getElementById('prod-form-id').value = '';
    state.productImageData = '../assets/caneca.png';
    document.getElementById('prod-image-preview').src = state.productImageData;
  }

  modal.classList.add('active');
}

function closeProductModal() {
  document.getElementById('modal-product').classList.remove('active');
}

function saveProduct(e) {
  e.preventDefault();
  const id = document.getElementById('prod-form-id').value;
  const name = document.getElementById('prod-form-name').value;
  const category = document.getElementById('prod-form-category').value;
  const price = parseFloat(document.getElementById('prod-form-price').value);
  const stock = parseInt(document.getElementById('prod-form-stock').value, 10);
  const image = state.productImageData || '../assets/caneca.png';
  const artisanId = Number(document.getElementById('prod-form-artisan').value);

  let status = stock > 0 ? 'Publicado' : 'Sem estoque';

  if (id) {
    const prod = state.products.find(p => p.id == id);
    if (prod) {
      prod.name = name;
      prod.category = category;
      prod.price = price;
      prod.stock = stock;
      prod.status = status;
      prod.image = image;
      prod.artisanId = artisanId;
      showToast('Produto atualizado com sucesso!', 'success');
      addNotification('product', `Produto “${name}” foi atualizado.`);
    }
  } else {
    const newProd = {
      id: Date.now(),
      name,
      category,
      price,
      stock,
      status,
      image,
      artisanId
    };
    state.products.unshift(newProd);
    showToast('Novo produto cadastrado com sucesso!', 'success');
    addNotification('product', `Novo produto cadastrado: “${name}”.`);
  }

  persistProducts();

  closeProductModal();
  filterProducts();
}

function toggleProductStatus(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  if (prod.status === 'Pausado') {
    prod.status = prod.stock > 0 ? 'Publicado' : 'Sem estoque';
    showToast(`Produto "${prod.name}" foi ativado.`, 'success');
  } else {
    prod.status = 'Pausado';
    showToast(`Produto "${prod.name}" foi pausado.`, 'warning');
  }

  filterProducts();
  persistProducts();
  addNotification('product', `Produto “${prod.name}” foi ${prod.status === 'Pausado' ? 'pausado' : 'ativado'}.`);
}

function deleteProduct(id) {
  const prod = state.products.find(p => p.id === id);
  if (!prod) return;

  if (confirm(`Tem certeza que deseja excluir "${prod.name}"?`)) {
    state.products = state.products.filter(p => p.id !== id);
    persistProducts();
    filterProducts();
    addNotification('product', `Produto “${prod.name}” foi excluído.`);
    showToast('Produto excluído com sucesso.', 'info');
  }
}

// Render Orders List in Pedidos View
function renderOrdersList() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  const sortValue = document.getElementById('sort-orders-select')?.value || 'recentes';

  let list = state.orders.filter(order => {
    if (state.activeOrdersFilter === 'todos') return true;
    if (state.activeOrdersFilter === 'novos') return order.status === 'em-producao';
    return order.status === state.activeOrdersFilter;
  });

  if (sortValue === 'maior-valor') {
    list.sort((a, b) => b.total - a.total);
  } else if (sortValue === 'menor-valor') {
    list.sort((a, b) => a.total - b.total);
  }

  if (list.length === 0) {
    container.innerHTML = `<div class="card" style="text-align: center; color: var(--text-muted); padding: 40px;">Nenhum pedido encontrado nesta categoria.</div>`;
    return;
  }

  container.innerHTML = list.map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <div class="order-id-date">
          <span class="order-id">#${order.id}</span>
          <span class="order-date">${order.date}</span>
        </div>
        ${getStatusBadgeHTML(order.status)}
      </div>

      <div class="order-card-body">
        <div class="order-product-info">
          <img src="${order.image}" class="order-product-thumb" alt="${order.summary}">
          <div class="order-details-text">
            <h4>${order.summary}</h4>
            <div class="order-price">${formatCurrency(order.total)}</div>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="order-customer-info">
            <div class="customer-name">${order.customer}</div>
            <div class="customer-location">${order.location}</div>
          </div>

          <button class="btn-outline" onclick="openOrderModal('${order.id}')">
            Ver pedido
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function filterOrdersTab(btn, status) {
  document.querySelectorAll('.filter-tabs .tab-btn').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  state.activeOrdersFilter = status;
  renderOrdersList();
}

function openOrderModal(orderId) {
  const order = state.orders.find(o => o.id === orderId);
  if (!order) return;

  const modal = document.getElementById('modal-order');
  const title = document.getElementById('modal-order-title');
  const body = document.getElementById('modal-order-body');

  title.textContent = `Pedido #${order.id}`;
  body.innerHTML = `
    <div style="margin-bottom: 16px;">
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Cliente</p>
      <p style="font-weight: 600;">${order.customer} (${order.location})</p>
    </div>

    <div style="margin-bottom: 16px;">
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Data e hora</p>
      <p>${order.date}</p>
    </div>

    <div style="margin-bottom: 16px;">
      <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Item do pedido</p>
      <div style="display: flex; align-items: center; gap: 12px; margin-top: 6px;">
        <img src="${order.image}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;">
        <div>
          <div style="font-weight: 600;">${order.summary}</div>
          <div style="color: var(--primary); font-weight: 700;">${formatCurrency(order.total)}</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <label class="form-label">Atualizar Status do Pedido</label>
      <select class="form-input" id="update-order-status-select">
        <option value="em-producao" ${order.status === 'em-producao' ? 'selected' : ''}>Em produção</option>
        <option value="enviado" ${order.status === 'enviado' ? 'selected' : ''}>Enviado</option>
        <option value="concluido" ${order.status === 'concluido' ? 'selected' : ''}>Concluído</option>
      </select>
    </div>
  `;

  document.getElementById('update-order-status-select').onchange = (e) => {
    order.status = e.target.value;
    renderRecentOrders();
    renderOrdersList();
    showToast(`Status do pedido #${order.id} alterado.`, 'success');
    addNotification(order.status === 'concluido' ? 'sale' : 'order', order.status === 'concluido' ? `Venda concluída no pedido #${order.id}: ${formatCurrency(order.total)}.` : `Pedido #${order.id} atualizado.`);
  };

  modal.classList.add('active');
}

function closeOrderModal() {
  document.getElementById('modal-order').classList.remove('active');
}

// Live Store Preview Synchronization
function syncLivePreview() {
  const name = document.getElementById('input-store-name')?.value || 'Maria Artesã';
  const bio = document.getElementById('input-store-bio')?.value || '';
  const location = document.getElementById('input-store-location')?.value || 'Linhares - ES';
  const specialty = document.getElementById('input-store-specialty')?.value || 'Cerâmica';

  const prevName = document.getElementById('preview-name');
  const prevBio = document.getElementById('preview-bio');
  const prevLocation = document.getElementById('preview-location');
  const prevSpecialty = document.getElementById('preview-specialty');
  const headerUser = document.getElementById('header-user-name');

  if (prevName) prevName.textContent = name;
  if (prevBio) prevBio.textContent = `"${bio}"`;
  if (prevLocation) prevLocation.textContent = location;
  if (prevSpecialty) prevSpecialty.textContent = `${specialty} artesanal`;
  if (headerUser) headerUser.textContent = name;
}

function saveStoreProfile(e) {
  e.preventDefault();
  showToast('Informações da loja salvas com sucesso!', 'success');
}

function handleAvatarChange(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('form-avatar-img').src = e.target.result;
      document.getElementById('preview-avatar').src = e.target.result;
      document.getElementById('header-avatar').src = e.target.result;
      showToast('Foto do perfil da loja atualizada!', 'success');
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Sales Analytics Chart Initialization (Chart.js)
function initSalesChart() {
  const ctx = document.getElementById('salesChart');
  if (!ctx) return;

  if (state.salesChartInstance) {
    state.salesChartInstance.destroy();
  }

  const labels = ['01/05', '04/05', '08/05', '11/05', '15/05', '18/05', '21/05', '25/05', '28/05', '31/05'];
  const dataPoints = [180, 240, 360, 420, 310, 520, 480, 710, 640, 780];

  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(59, 84, 45, 0.25)');
  gradient.addColorStop(1, 'rgba(59, 84, 45, 0.0)');

  state.salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Faturamento (R$)',
        data: dataPoints,
        borderColor: '#3B542D',
        borderWidth: 3,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B542D',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Faturamento: R$ ${context.parsed.y},00`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#6B7265', font: { family: 'Inter', size: 11 } }
        },
        y: {
          min: 0,
          max: 800,
          ticks: {
            stepSize: 200,
            color: '#6B7265',
            font: { family: 'Inter', size: 11 },
            callback: function(val) {
              return 'R$ ' + val;
            }
          },
          grid: { color: '#ECE9DC', drawBorder: false }
        }
      }
    }
  });
}

function persistArtisans() {
  localStorage.setItem('artesNossasArtisans', JSON.stringify(state.artisans));
}

function getArtisanName(id) {
  return state.artisans.find(a => a.id === Number(id))?.name || 'Não definido';
}

function fillArtisanSelect(query = '') {
  const select = document.getElementById('prod-form-artisan');
  if (!select) return;
  const current = select.value;
  const normalized = query.toLowerCase().trim();
  const list = state.artisans.filter(a => `${a.name} ${a.email} ${a.role}`.toLowerCase().includes(normalized));
  select.innerHTML = list.map(a => `<option value="${a.id}">${a.name} — ${a.role}</option>`).join('');
  if (list.some(a => String(a.id) === current)) select.value = current;
}

function filterArtisanOptions() {
  fillArtisanSelect(document.getElementById('artisan-product-search').value);
}

function selectLibraryImage(value) {
  state.productImageData = value;
  document.getElementById('prod-image-preview').src = value;
}

function previewProductImage(input) {
  const file = input.files?.[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { input.value = ''; showToast('A imagem deve ter no máximo 2 MB.', 'warning'); return; }
  const reader = new FileReader();
  reader.onload = e => { state.productImageData = e.target.result; document.getElementById('prod-image-preview').src = e.target.result; };
  reader.readAsDataURL(file);
}

function renderArtisans() {
  const tbody = document.getElementById('artisans-tbody');
  if (!tbody) return;
  const query = (document.getElementById('search-artisans-input')?.value || '').toLowerCase().trim();
  const list = state.artisans.filter(a => `${a.name} ${a.email} ${a.phone} ${a.role}`.toLowerCase().includes(query));
  tbody.innerHTML = list.length ? list.map(a => `<tr><td><strong>${a.name}</strong><div class="product-info-cat">${a.permissions.join(', ') || 'Sem acessos'}</div></td><td>${a.email}<div class="product-info-cat">${a.phone || 'Sem telefone'}</div></td><td><span class="badge badge-publicado">${a.role}</span></td><td>${a.createdAt}</td><td><div class="action-buttons-cell" style="justify-content:flex-end"><button class="icon-btn-action" title="Editar" onclick="openArtisanModal(${a.id})"><i data-lucide="edit-2"></i></button><button class="icon-btn-action delete" title="Excluir" onclick="deleteArtisan(${a.id})"><i data-lucide="trash-2"></i></button></div></td></tr>`).join('') : '<tr><td colspan="5" class="empty-table">Nenhum artesão encontrado.</td></tr>';
  if (window.lucide) lucide.createIcons();
}

function openArtisanModal(id = null) {
  const form = document.getElementById('artisan-form'); form.reset();
  document.getElementById('artisan-form-id').value = id || '';
  document.getElementById('modal-artisan-title').textContent = id ? 'Editar artesão' : 'Adicionar artesão';
  const artisan = state.artisans.find(a => a.id === id);
  if (artisan) {
    document.getElementById('artisan-form-name').value = artisan.name;
    document.getElementById('artisan-form-email').value = artisan.email;
    document.getElementById('artisan-form-phone').value = artisan.phone;
    document.getElementById('artisan-form-role').value = artisan.role;
    document.querySelectorAll('#artisan-form input[type=checkbox]').forEach(c => c.checked = artisan.permissions.includes(c.value));
  }
  document.getElementById('modal-artisan').classList.add('active');
}

function closeArtisanModal() { document.getElementById('modal-artisan').classList.remove('active'); }

function saveArtisan(event) {
  event.preventDefault();
  const id = Number(document.getElementById('artisan-form-id').value);
  const data = { name: document.getElementById('artisan-form-name').value.trim(), email: document.getElementById('artisan-form-email').value.trim(), phone: document.getElementById('artisan-form-phone').value.trim(), role: document.getElementById('artisan-form-role').value, permissions: [...document.querySelectorAll('#artisan-form input[type=checkbox]:checked')].map(c => c.value) };
  if (id) Object.assign(state.artisans.find(a => a.id === id), data);
  else state.artisans.unshift({ id: Date.now(), ...data, createdAt: new Date().toLocaleString('pt-BR') });
  persistArtisans(); renderArtisans(); closeArtisanModal();
  addNotification('artisan', id ? `Cadastro de ${data.name} foi atualizado.` : `Novo artesão registrado: ${data.name}.`);
  showToast(id ? 'Artesão atualizado.' : 'Artesão adicionado e convite preparado.', 'success');
  if (!id) window.location.href = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent('Convite para Artes Nossas')}&body=${encodeURIComponent(`Olá, ${data.name}! Você foi convidado para a Artes Nossas como ${data.role}. Ao criar sua conta, terá acesso a: ${data.permissions.join(', ') || 'área básica'}.`)}`;
}

function deleteArtisan(id) {
  const artisan = state.artisans.find(a => a.id === id);
  if (!artisan || !confirm(`Excluir o cadastro de ${artisan.name}?`)) return;
  state.artisans = state.artisans.filter(a => a.id !== id); persistArtisans(); renderArtisans(); fillArtisanSelect();
  addNotification('artisan', `Cadastro de ${artisan.name} foi excluído.`);
}

function addNotification(type, message) {
  state.notifications.unshift({ id: Date.now(), type, message, read: false, createdAt: new Date().toLocaleString('pt-BR') });
  state.notifications = state.notifications.slice(0, 50);
  localStorage.setItem('artesNossasNotifications', JSON.stringify(state.notifications)); renderNotifications();
  const button = document.getElementById('notification-button'); button?.classList.remove('ringing'); void button?.offsetWidth; button?.classList.add('ringing');
}

function renderNotifications() {
  const list = document.getElementById('notifications-list'); if (!list) return;
  const unread = state.notifications.filter(n => !n.read).length;
  document.getElementById('notification-count').textContent = unread;
  document.getElementById('notification-count').style.display = unread ? 'flex' : 'none';
  document.getElementById('notification-dot').style.display = unread ? 'block' : 'none';
  list.innerHTML = state.notifications.length ? state.notifications.map(n => `<button class="notification-item ${n.read ? '' : 'unread'}" onclick="readNotification(${n.id})"><span>${n.type === 'sale' ? '🛍️' : n.type === 'artisan' ? '👤' : n.type === 'product' ? '📦' : '🔔'}</span><span><strong>${n.message}</strong><small>${n.createdAt}</small></span></button>`).join('') : '<div class="empty-notifications">Nenhuma notificação.</div>';
}

function toggleNotifications() { document.getElementById('notifications-panel').classList.toggle('active'); }
function readNotification(id) { const n = state.notifications.find(item => item.id === id); if (n) n.read = true; localStorage.setItem('artesNossasNotifications', JSON.stringify(state.notifications)); renderNotifications(); }
function markAllNotificationsRead() { state.notifications.forEach(n => n.read = true); localStorage.setItem('artesNossasNotifications', JSON.stringify(state.notifications)); renderNotifications(); }

// Toast Manager
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '🔔';
  if (type === 'success') icon = '✅';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
