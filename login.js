// Login Page JavaScript
let demoAccounts = [
    {
        email: "traffic.officer@city.gov",
        password: "demo123",
        name: "Traffic Officer",
        department: "City Traffic Department",
        accessLevel: "officer",
    },
    {
        email: "admin@traffic.gov",
        password: "admin456",
        name: "System Administrator",
        department: "Traffic Management",
        accessLevel: "admin",
    },
];

let isProcessing = false;
let rememberUser = false;

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
    // Check for remembered login
    checkRememberedLogin();

    // Add form submit event listener
    document
        .getElementById("loginForm")
        .addEventListener("submit", handleLogin);

    // Add remember me checkbox listener
    document.getElementById("remember").addEventListener("change", function () {
        rememberUser = this.checked;
    });
});

// Check for remembered login
function checkRememberedLogin() {
    const rememberedEmail = localStorage.getItem("safecross_remembered_email");
    const rememberedPassword = localStorage.getItem(
        "safecross_remembered_password",
    );

    if (rememberedEmail && rememberedPassword) {
        document.getElementById("email").value = rememberedEmail;
        document.getElementById("password").value = rememberedPassword;
        document.getElementById("remember").checked = true;
        rememberUser = true;
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById("password");
    const toggleIcon = document.getElementById("toggleIcon");

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        toggleIcon.classList.remove("fa-eye");
        toggleIcon.classList.add("fa-eye-slash");
    } else {
        passwordInput.type = "password";
        toggleIcon.classList.remove("fa-eye-slash");
        toggleIcon.classList.add("fa-eye");
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    if (isProcessing) return;

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Basic validation
    if (!email || !password) {
        showError("Please enter both email and password");
        return;
    }

    if (!isValidEmail(email)) {
        showError("Please enter a valid official email address");
        return;
    }

    // Start processing
    isProcessing = true;
    const loginBtn = document.querySelector(".login-btn");
    loginBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;

    // Simulate API call delay
    setTimeout(() => {
        const user = authenticateUser(email, password);

        if (user) {
            // Store user data if "Remember me" is checked
            if (rememberUser) {
                localStorage.setItem("safecross_remembered_email", email);
                localStorage.setItem("safecross_remembered_password", password);
                localStorage.setItem("safecross_user_name", user.name);
                localStorage.setItem("safecross_user_dept", user.department);
            } else {
                // Clear stored data if not remembered
                localStorage.removeItem("safecross_remembered_email");
                localStorage.removeItem("safecross_remembered_password");
            }

            // Store session data
            sessionStorage.setItem("safecross_logged_in", "true");
            sessionStorage.setItem("safecross_user_email", email);
            sessionStorage.setItem("safecross_user_name", user.name);
            sessionStorage.setItem("safecross_user_dept", user.department);
            sessionStorage.setItem("safecross_access_level", user.accessLevel);

            // Show success
            showSuccess(user);
        } else {
            showError(
                "Invalid credentials. Please check your email and password.",
            );
            loginBtn.innerHTML =
                '<i class="fas fa-sign-in-alt"></i> Login to Dashboard';
            loginBtn.disabled = false;
            isProcessing = false;
        }
    }, 1500);
}

// Authenticate user (simulated)
function authenticateUser(email, password) {
    // Check against demo accounts
    const user = demoAccounts.find(
        (account) => account.email === email && account.password === password,
    );

    // Also allow any @traffic-department.gov email for demo purposes
    if (
        !user &&
        email.endsWith("@traffic-department.gov") &&
        password.length >= 6
    ) {
        return {
            email: email,
            name: "Authorized Officer",
            department: "Traffic Department",
            accessLevel: "officer",
        };
    }

    return user;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show success modal
function showSuccess(user) {
    document.getElementById("userEmail").textContent = user.email;
    document.getElementById("successModal").classList.add("show");

    // Auto-redirect after 3 seconds
    setTimeout(() => {
        redirectToDashboard();
    }, 3000);
}

// Show error modal
function showError(message) {
    document.getElementById("errorMessage").textContent = message;
    document.getElementById("errorModal").classList.add("show");
}

// Close modal
function closeModal() {
    document.getElementById("successModal").classList.remove("show");
    document.getElementById("errorModal").classList.remove("show");
}

// Redirect to dashboard
function redirectToDashboard() {
    // In a real application, this would redirect to the actual dashboard
    // For this demo, we'll redirect to the main page with a logged-in state
    window.location.href = "index.html?loggedIn=true";
}

// Demo login (pre-filled credentials)
function demoLogin() {
    // Use the first demo account
    const demoAccount = demoAccounts[0];

    document.getElementById("email").value = demoAccount.email;
    document.getElementById("password").value = demoAccount.password;
    document.getElementById("remember").checked = true;
    rememberUser = true;

    // Show notification
    alert(
        `Demo credentials filled:\nEmail: ${demoAccount.email}\nPassword: ${demoAccount.password}\n\nClick "Login to Dashboard" to continue.`,
    );
}

// Simulate forgot password
document.querySelector(".forgot-link").addEventListener("click", function (e) {
    e.preventDefault();
    alert(
        "Password reset feature would be implemented in a production environment.\n\nFor now, use demo credentials:\nEmail: traffic.officer@city.gov\nPassword: demo123",
    );
});

// Add some visual effects to form inputs
const formInputs = document.querySelectorAll(".form-group input");
formInputs.forEach((input) => {
    // Add focus effect
    input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused");
    });

    // Remove focus effect
    input.addEventListener("blur", function () {
        if (!this.value) {
            this.parentElement.classList.remove("focused");
        }
    });

    // Add validation styling
    input.addEventListener("input", function () {
        if (this.checkValidity()) {
            this.style.borderColor = "#2ecc71";
        } else {
            this.style.borderColor = "#e74c3c";
        }
    });
});

// Add CSS for focused state
const style = document.createElement("style");
style.textContent = `
    .form-group.focused label {
        color: #3498db;
    }
    
    .form-group.focused .password-toggle {
        color: #3498db;
    }
`;
document.head.appendChild(style);
