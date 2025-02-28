// Function to post an item
function postItem() {
    const itemName = document.getElementById('itemName').value;
    const itemPrice = document.getElementById('itemPrice').value;
    const itemDescription = document.getElementById('itemDescription').value;
    const itemImage = document.getElementById('itemImage').files[0];

    if (itemName && itemPrice && itemDescription && itemImage) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const item = {
                name: itemName,
                price: itemPrice,
                description: itemDescription,
                image: e.target.result // Base64 image data
            };
            saveItem(item);
        };
        reader.readAsDataURL(itemImage);
    } else {
        alert('Please fill all fields and upload an image');
    }
}

// Save item to local storage
function saveItem(item) {
    let items = JSON.parse(localStorage.getItem('items')) || [];
    items.push(item);
    localStorage.setItem('items', JSON.stringify(items));
    alert('Item Posted Successfully!');
    // Clear form
    document.getElementById('itemName').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('itemDescription').value = '';
    document.getElementById('itemImage').value = '';
    // Reload item list
    loadItems();
}

// Load items from local storage
function loadItems() {
    const itemList = document.getElementById('itemList');
    itemList.innerHTML = '<h2>Previously Added Items</h2>'; // Clear existing items

    const items = JSON.parse(localStorage.getItem('items')) || [];
    items.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';
        itemCard.innerHTML = `
            <div style="display: flex; align-items: center;">
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    <p>₹${item.price} per kg</p>
                    <p>${item.description}</p>
                </div>
            </div>
            <button onclick="deleteItem(${index})">Delete</button>
        `;
        itemList.appendChild(itemCard);
    });
}

// Delete item from local storage
function deleteItem(index) 
{
    let items = JSON.parse(localStorage.getItem('items')) || [];
    items.splice(index, 1); // Remove the item at the specified index
    localStorage.setItem('items', JSON.stringify(items));
    alert('Item Deleted Successfully!');
    // Reload item list
    loadItems();
}

// Load items when the page loads
window.onload = loadItems;
