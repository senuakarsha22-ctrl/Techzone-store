document.addEventListener('DOMContentLoaded', () => {
  let shoppingCart = [];
  let currentCheckoutItem = null; // For single "Buy Now" purchases

  // DOM Elements
  const cartToggleBtn = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCart');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemCount = document.getElementById('cartItemCount');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  
  const toast = document.getElementById('toast');
  const toastText = document.getElementById('toastText');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  // Modal Elements
  const checkoutModal = document.getElementById('checkoutModal');
  const closeCheckoutBtn = document.getElementById('closeCheckout');
  const checkoutBtn = document.getElementById('checkoutBtn');
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotalAmount = document.getElementById('checkoutTotalAmount');
  const paymentForm = document.getElementById('paymentForm');

  // --- Cart Navigation & Drawer ---
  const openCart = () => {
    cartDrawer.classList.add('active');
    cartOverlay.classList.add('active');
  };

  const closeCart = () => {
    cartDrawer.classList.remove('active');
    cartOverlay.classList.remove('active');
  };

  cartToggleBtn.addEventListener('click', openCart);
  closeCartBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);

  // --- Add Item to Cart ---
  document.querySelectorAll('.btn-add-cart').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      const id = card.dataset.id;
      const name = card.dataset.name;
      const price = parseFloat(card.dataset.price);
      const img = card.dataset.img;

      addItemToCart(id, name, price, img);
      triggerToast(`Added "${name}" to cart!`);
    });
  });

  function addItemToCart(id, name, price, img) {
    const existing = shoppingCart.find(item => item.id === id);
    if (existing) {
      existing.quantity += 1;
    } else {
      shoppingCart.push({ id, name, price, img, quantity: 1 });
    }
    renderCart();
  }

  function renderCart() {
    const totalCount = shoppingCart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cartBadge.textContent = totalCount;
    cartItemCount.textContent = totalCount;
    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;

    if (shoppingCart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-state">
          <i class="fa-solid fa-basket-shopping"></i>
          <p>Your cart is empty.</p>
        </div>`;
      return;
    }

    cartItemsList.innerHTML = shoppingCart.map(item => `
      <div style="display:flex; gap:12px; align-items:center; margin-bottom:12px; background:#181b24; padding:8px; border-radius:6px;">
        <img src="${item.img}" style="width:48px; height:48px; object-fit:cover; border-radius:4px;">
        <div style="flex:1;">
          <h4 style="font-size:0.85rem; margin-bottom:2px; color:#fff;">${item.name}</h4>
          <span style="font-size:0.8rem; color:var(--accent-cyan);">$${item.price.toFixed(2)} x ${item.quantity}</span>
        </div>
      </div>
    `).join('');
  }

  // --- Buy Now & Checkout Interface ---
  document.querySelectorAll('.btn-buy-now').forEach(button => {
    button.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      currentCheckoutItem = {
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        img: card.dataset.img,
        quantity: 1
      };
      openCheckoutModal(false); // Direct single item purchase
    });
  });

  checkoutBtn.addEventListener('click', () => {
    if (shoppingCart.length === 0) {
      triggerToast('Your cart is empty!');
      return;
    }
    currentCheckoutItem = null; // Multi-item cart purchase
    closeCart();
    openCheckoutModal(true);
  });

  const openCheckoutModal = (isCartPurchase) => {
    checkoutModal.classList.add('active');

    let total = 0;
    if (isCartPurchase) {
      total = shoppingCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      checkoutItems.innerHTML = shoppingCart.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
          <span>${item.name} (x${item.quantity})</span>
          <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
        </div>
      `).join('');
    } else if (currentCheckoutItem) {
      total = currentCheckoutItem.price;
      checkoutItems.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:6px;">
          <span>${currentCheckoutItem.name} (x1)</span>
          <strong>$${total.toFixed(2)}</strong>
        </div>
      `;
    }

    checkoutTotalAmount.textContent = `$${total.toFixed(2)}`;
  };

  const closeCheckoutModal = () => {
    checkoutModal.classList.remove('active');
  };

  closeCheckoutBtn.addEventListener('click', closeCheckoutModal);

  // Auto-format Credit Card Expiry (MM/YY) & Card Number spacing
  document.getElementById('cardExp').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      e.target.value = val.slice(0, 2) + '/' + val.slice(2, 4);
    } else {
      e.target.value = val;
    }
  });

  document.getElementById('cardNumber').addEventListener('input', (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    e.target.value = val.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  // Handle Form Submission
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('shipName').value;
    
    // Simulate transaction
    closeCheckoutModal();
    if (currentCheckoutItem === null) {
      shoppingCart = []; // Clear cart on checkout
      renderCart();
    }
    
    alert(`Thank you for your order, ${name}!\n\nYour purchase was successful. We will deliver your package to 50/A, WENNAPPUWA or your custom address soon!`);
    paymentForm.reset();
  });

  // --- Category Switcher & Interfaces ---
  function filterCategory(category) {
    const sections = document.querySelectorAll('.section-container');
    
    sections.forEach(section => {
      if (category === 'all' || section.dataset.category === category) {
        section.style.display = 'block';
      } else {
        section.style.display = 'none';
      }
    });

    // Reset card visibility in filtered sections
    document.querySelectorAll('.product-card').forEach(card => {
      card.style.display = 'flex';
    });

    // Update Category Nav active state
    document.querySelectorAll('.nav-tab').forEach(tab => {
      if (tab.dataset.category === category) {
        tab.classList.add('active-tab');
      } else {
        tab.classList.remove('active-tab');
      }
    });

    // Sync dropdown
    if (categorySelect) categorySelect.value = category;
  }

  // Navigation tab clicks
  document.querySelectorAll('.nav-tab, .nav-tab-link, .hero-category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const category = btn.dataset.category;
      if (category) {
        filterCategory(category);
      }
    });
  });

  // Header Dropdown Category Selector
  categorySelect.addEventListener('change', (e) => {
    filterCategory(e.target.value);
  });

  // Logo Reset
  document.getElementById('logoBtn').addEventListener('click', (e) => {
    e.preventDefault();
    filterCategory('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Live Product Search Filter ---
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.product-card').forEach(card => {
      const title = card.dataset.name.toLowerCase();
      card.style.display = title.includes(term) ? 'flex' : 'none';
    });
  });

  // Toast Helper
  function triggerToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
});

