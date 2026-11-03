/* Authentication for the local school/demo website.
   This is client-side demo authentication, not production security. */
(() => {
    "use strict";

    const USERS_KEY = "johnLesterUsers";
    const SESSION_KEY = "johnLesterLoggedIn";
    const NAME_KEY = "johnLesterName";

    const byId = (id) => document.getElementById(id);
    const authForm = byId("authForm");

    // script.js is also referenced by some site pages; only run auth code on login.html.
    if (!authForm) {
        return;
    }

    const loginMode = byId("loginMode");
    const signupMode = byId("signupMode");
    const formTitle = byId("formTitle");
    const formSubtitle = byId("formSubtitle");
    const submitBtn = byId("submitBtn");
    const switchText = byId("switchText");
    const loginOptions = byId("loginOptions");
    const message = byId("message");
    const showPassword = byId("showPassword");
    const username = byId("username");
    const nameInput = byId("name");
    const password = byId("password");
    const confirmPassword = byId("confirmPassword");
    const signupFields = document.querySelectorAll(".signup-only");

    let mode = "login";

    function getUsers() {
        try {
            const stored = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
            return Array.isArray(stored) ? stored.filter(
                user => user && typeof user === "object"
            ) : [];
        } catch (error) {
            return [];
        }
    }

    function saveUsers(users) {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            return true;
        } catch (error) {
            showMessage("Unable to save your account in this browser. Check your browser storage settings.");
            return false;
        }
    }

    function showMessage(text, success = false) {
        message.textContent = text;
        message.style.color = success ? "#a8e63d" : "#ff7d9d";
    }

    function setMode(newMode) {
        mode = newMode === "signup" ? "signup" : "login";
        const signup = mode === "signup";

        signupFields.forEach((el) => {
            el.classList.toggle("hidden", !signup);
        });

        loginMode.classList.toggle("active", !signup);
        signupMode.classList.toggle("active", signup);
        loginMode.setAttribute("aria-pressed", String(!signup));
        signupMode.setAttribute("aria-pressed", String(signup));

        formTitle.textContent = signup ? "Create account" : "Sign in";
        formSubtitle.textContent = signup
            ? "Register to enter John Lester's personal website."
            : "Access John Lester's personal website.";
        submitBtn.textContent = signup ? "Create account →" : "Login →";
        loginOptions.classList.toggle("hidden", signup);

        // Update only the switch-link text and button without replacing the form or losing listeners.
        switchText.replaceChildren(document.createTextNode(
            signup ? "Already have an account? " : "Don't have an account? "
        ));
        const switchButton = document.createElement("button");
        switchButton.type = "button";
        switchButton.id = "switchBtn";
        switchButton.textContent = signup ? "Sign in" : "Create one";
        switchButton.addEventListener("click", () => setMode(signup ? "login" : "signup"));
        switchText.appendChild(switchButton);

        password.autocomplete = signup ? "new-password" : "current-password";
        confirmPassword.required = signup;
        nameInput.required = signup;
        password.type = "password";
        confirmPassword.type = "password";
        showPassword.textContent = "Show";
        message.textContent = "";
    }

    function normalizeUsername(value) {
        return value.trim().toLowerCase();
    }

    function startSession(account) {
        try {
            localStorage.setItem(SESSION_KEY, "true");
            localStorage.setItem(NAME_KEY, account.name || account.username || "John Lester Francisco");
        } catch (error) {
            showMessage("Your browser could not save the login session. Please enable browser storage.");
            return false;
        }
        showMessage(mode === "signup" ? "Account created. Opening website..." : "Login successful. Welcome!", true);
        window.setTimeout(() => {
            window.location.href = "index.html";
        }, 600);
        return true;
    }

    loginMode.addEventListener("click", () => setMode("login"));
    signupMode.addEventListener("click", () => setMode("signup"));

    showPassword.addEventListener("click", () => {
        const reveal = password.type === "password";
        password.type = reveal ? "text" : "password";
        confirmPassword.type = reveal ? "text" : "password";
        showPassword.textContent = reveal ? "Hide" : "Show";
        showPassword.setAttribute("aria-pressed", String(reveal));
    });

    authForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const userName = username.value.trim();
        const normalized = normalizeUsername(userName);
        const pass = password.value;

        if (!userName || !pass) {
            showMessage("Please complete all fields.");
            return;
        }

        if (userName.length < 3 || userName.length > 40) {
            showMessage("Username must be between 3 and 40 characters.");
            return;
        }

        if (mode === "signup") {
            const fullName = nameInput.value.trim();
            const confirm = confirmPassword.value;

            if (!fullName || !confirm) {
                showMessage("Please complete all fields.");
                return;
            }
            if (fullName.length > 80) {
                showMessage("Full name must be 80 characters or fewer.");
                return;
            }
            if (pass.length < 6) {
                showMessage("Password must be at least 6 characters.");
                return;
            }
            if (pass !== confirm) {
                showMessage("Passwords do not match.");
                return;
            }

            const users = getUsers();
            if (users.some(user => normalizeUsername(String(user.username || user.email || "")) === normalized)) {
                showMessage("That username is already registered.");
                return;
            }

            users.push({ name: fullName, username: userName, password: pass });
            if (!saveUsers(users)) return;
            startSession({ name: fullName, username: userName });
            return;
        }

        const users = getUsers();
        const account = users.find(user => {
            const storedUsername = normalizeUsername(String(user.username || user.email || ""));
            return storedUsername === normalized && user.password === pass;
        });

        // Keep the existing README/demo login working, using its email as the username.
        const demo = normalized === "john@example.com" && pass === "123456"
            ? { name: "John Lester Francisco", username: "john@example.com" }
            : null;

        if (!account && !demo) {
            showMessage("Incorrect username or password.");
            return;
        }
        startSession(account || demo);
    });

    byId("forgotPassword").addEventListener("click", (event) => {
        event.preventDefault();
        showMessage("For this school demo, create a new account if needed.");
    });

    setMode("login");
})();
