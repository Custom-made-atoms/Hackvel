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
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    fetch("/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart: cart })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Checkout failed: " + data.error);
        } else {
            alert("Order placed successfully!");
            localStorage.removeItem('cart');  // Clear cart after successful order
            displayCart();
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("There was an error processing your order.");
    });
}


document.addEventListener("DOMContentLoaded", displayProducts);
