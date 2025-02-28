// Load purchases from local storage
function loadPurchases() {
    const purchaseList = document.getElementById('purchaseList');
    purchaseList.innerHTML = ''; // Clear existing purchases

    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    purchases.forEach(purchase => {
        const purchaseCard = document.createElement('div');
        purchaseCard.className = 'purchase-card';
        purchaseCard.innerHTML = `
            <div style="display: flex; align-items: center;">
                <img src="${purchase.image}" alt="${purchase.name}">
                <div>
                    <h3>${purchase.name}</h3>
                    <p>₹${purchase.price} per kg</p>
                    <p>${purchase.description}</p>
                </div>
            </div>
        `;
        purchaseList.appendChild(purchaseCard);
    });
}

// Load purchases when the page loads
window.onload = loadPurchases;
