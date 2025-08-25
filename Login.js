// login.js

// Auto-create default admin if no users exist
if (!localStorage.getItem("users")) {
  const defaultUsers = [
    { username: "admin", password: "1234" }
  ];
  localStorage.setItem("users", JSON.stringify(defaultUsers));
}

function signIn() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || [];

  // Check if user exists and password matches
  const foundUser = users.find(user => user.username === username && user.password === password);

  if (foundUser) {
    // Store current session
    localStorage.setItem("loggedInUser", username);

    // Redirect to dashboard
    window.location.href = "index.html"; // change this if your dashboard file name is different
  } else {
    alert("Invalid username or password.");
  }
}
