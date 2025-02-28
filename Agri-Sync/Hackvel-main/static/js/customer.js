    const products = [
        { id: 1, name: "Fresh Tomatoes", price: 50 },
        { id: 2, name: "Organic Carrots", price: 40 },
        { id: 3, name: "Potatoes", price: 30 }
    ];

    const cart = [];

    function displayProducts() {
        const productGrid = document.getElementById("productGrid");
        productGrid.innerHTML = "";
        products.forEach(product => {
            const productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <h3>${product.name}</h3>
                <p>Price: ₹${product.price} per kg</p>
                <input type="number" id="qty-${product.id}" placeholder="Enter quantity (kg)" min="1">
                <button onclick="addToCart(${product.id})">Request & Add to Cart</button>
            `;
            productGrid.appendChild(productCard);
        });
    }

    function addToCart(productId) {
        const quantity = document.getElementById(`qty-${productId}`).value;
        if (quantity && quantity > 0) {
            const product = products.find(p => p.id === productId);
            const existingIndex = cart.findIndex(item => item.id === productId);
            if (existingIndex !== -1) {
                cart[existingIndex].quantity += parseInt(quantity);
            } else {
                cart.push({ ...product, quantity: parseInt(quantity) });
            }
            updateCart();
        } else {
            alert("Please enter a valid quantity.");
        }
    }

    function updateCart() {
        const cartItems = document.getElementById("cartItems");
        cartItems.innerHTML = "";
        cart.forEach(item => {
            const cartItem = document.createElement("li");
            cartItem.textContent = `${item.name} - ${item.quantity} kg (₹${item.price * item.quantity})`;
            cartItems.appendChild(cartItem);
        });
    }

    function checkout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }
    
        fetch("/checkout", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "X-CSRFToken": "{{ csrf_token() }}"  // Add CSRF protection if needed
            },
            credentials: 'include',  // Important for session cookies
            body: JSON.stringify({ cart: cart })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(data => {
            alert("Order placed successfully!");
            localStorage.removeItem('cart');  // Clear the cart
            updateCart();  // Refresh the cart display
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Checkout failed: " + (error.error || error.message));
        });
    }
    document.addEventListener("DOMContentLoaded", function () {
        displayProducts();
        updateCart();  // Ensure cart is empty on page load
    });