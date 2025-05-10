document.addEventListener('DOMContentLoaded', () => {
    const cartCountElement = document.querySelector('.cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-button');


    function getCart() {
        return JSON.parse(localStorage.getItem('shoppingCart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        if (!cartCountElement) return;
        const cart = getCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }

    function addToCart(product) {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        saveCart(cart);
        alert(`${product.name} добавлен в корзину!`);
    }


    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const card = event.target.closest('.product-card');
                if (!card) return;

                const product = {
                    id: card.dataset.productId,
                    name: card.dataset.name,
                    price: parseFloat(card.dataset.price),
                    image: card.dataset.image
                };
                addToCart(product);
            });
        });
    }


    const cartItemsListElement = document.querySelector('.cart-items-list');
    const cartTotalAmountElement = document.querySelector('.cart-total .total-amount');

    function renderCartItems() {
        if (!cartItemsListElement) return;

        const cart = getCart();
        cartItemsListElement.innerHTML = '';

        if (cart.length === 0) {
            cartItemsListElement.innerHTML = '<p class="empty-cart-message">Ваша корзина пуста.</p>';
            if(cartTotalAmountElement) cartTotalAmountElement.textContent = '0';
            updateCartCount();
            return;
        }

        cart.forEach(item => {
            const listItem = document.createElement('li');
            listItem.classList.add('cart-item');
            if (item.highlighted) listItem.classList.add('highlighted');
            listItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-info">
                    <h2 class="cart-item-title">${item.name}</h2>
                    <div class="quantity-selector">
                        <button type="button" class="quantity-btn minus" data-product-id="${item.id}" aria-label="Уменьшить количество">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button type="button" class="quantity-btn plus" data-product-id="${item.id}" aria-label="Увеличить количество">+</button>
                    </div>
                </div>
                <p class="cart-item-price">${(item.price * item.quantity).toFixed(0)} руб</p> <!-- Общая цена за позицию -->
                <button type="button" class="button-icon remove-item-button" data-product-id="${item.id}" aria-label="Удалить товар">
                    <img src="logo_ikons/close.svg" alt="Удалить">
                </button>
            `;
            cartItemsListElement.appendChild(listItem);
        });

        addCartItemEventListeners();
        updateCartTotal();
        updateCartCount();
    }

    function addCartItemEventListeners() {
        document.querySelectorAll('.quantity-btn.minus').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.quantity-btn.plus').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        document.querySelectorAll('.remove-item-button').forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    function handleQuantityChange(event) {
        const productId = event.target.dataset.productId;
        const isPlus = event.target.classList.contains('plus');
        const cart = getCart();
        const itemToUpdate = cart.find(item => item.id === productId);

        if (itemToUpdate) {
            if (isPlus) {
                itemToUpdate.quantity += 1;
            } else {
                itemToUpdate.quantity -= 1;
                if (itemToUpdate.quantity <= 0) {
                    const itemIndex = cart.findIndex(item => item.id === productId);
                    if (itemIndex > -1) {
                        cart.splice(itemIndex, 1);
                    }
                }
            }
            saveCart(cart);
            renderCartItems();
        }
    }

    function handleRemoveItem(event) {
        const button = event.target.closest('.remove-item-button');
        if (!button) return;
        const productId = button.dataset.productId;
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
        renderCartItems();
    }

    function updateCartTotal() {
        if (!cartTotalAmountElement) return;
        const cart = getCart();
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalAmountElement.textContent = total.toFixed(0);
    }


    updateCartCount();

    if (cartItemsListElement) {
        renderCartItems();
    }
});