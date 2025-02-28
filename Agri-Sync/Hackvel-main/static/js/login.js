const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
  container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
  container.classList.remove("right-panel-active");
});

// Simple role validation for the sign-up form
document.querySelector('.sign-up-container form').addEventListener('submit', function (e) {
  const role = document.getElementById('role').value;
  if (!role) {
    e.preventDefault();
    alert('Please select a role (Customer or Farmer).');
  }
});
