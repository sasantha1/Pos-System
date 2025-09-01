// Simple form validation + alert
document.getElementById("loginForm").addEventListener("submit", function(event) {
  event.preventDefault(); // prevent page reload

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username && password) {
    alert("Welcome, " + username + "*!");
    // TODO: Replace this with backend authentication (API call, etc.)
  } else {
    alert("Please fill in all fields continue !");
  }
});
