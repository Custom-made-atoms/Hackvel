// Sidebar functionality
function openSidebar() {
    document.getElementById('sidebar').style.width = '250px';
}

function closeSidebar() {
    document.getElementById('sidebar').style.width = '0';
}

// Profile form submission
document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    alert(`Profile Updated!\nName: ${name}\nEmail: ${email}`);
});
