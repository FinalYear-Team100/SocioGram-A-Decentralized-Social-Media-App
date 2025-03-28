// Import NEAR API (Ensure near-api-js is included in your HTML before this script)
const nearConfig = {
    networkId: "testnet",
    contractName: "swapnilparicha.testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org"
};

let wallet, contract, accountId, selectedUser = null;

async function init() {
    const near = await nearApi.connect({
        networkId: nearConfig.networkId,
        keyStore: new nearApi.keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: nearConfig.nodeUrl,
        walletUrl: nearConfig.walletUrl,
        helperUrl: nearConfig.helperUrl,
    });

    wallet = new nearApi.WalletConnection(near, "sociochat");
    accountId = wallet.getAccountId();

    // HTML Elements
    const loginContainer = document.getElementById("login-container");
    const chatContainer = document.getElementById("chat-container");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const registerBtn = document.getElementById("register-btn");
    const userList = document.getElementById("user-list");
    const chatBox = document.getElementById("chat-box");
    const messagesContainer = document.getElementById("messages-container");
    const sendMessageBtn = document.getElementById("send-message");
    const messageInput = document.getElementById("message");

    loginBtn.onclick = () => wallet.requestSignIn(nearConfig.contractName);
    logoutBtn.onclick = () => {
        wallet.signOut();
        window.location.reload();
    };

    if (wallet.isSignedIn()) {
        loginContainer.classList.add("hidden");
        chatContainer.classList.remove("hidden");
        registerBtn.classList.remove("hidden");

        contract = new nearApi.Contract(wallet.account(), nearConfig.contractName, {
            viewMethods: ["view_users", "get_messages"],
            changeMethods: ["register_user", "send_message"],
        });

        // 🟢 Define selectUser first
        function selectUser(username) {
            selectedUser = username; // Store selected user
            chatBox.classList.remove("hidden");
            document.getElementById("chat-header").innerText = `Chat with ${username}`;

            // Preserve selected user after sending a message
            sendMessageBtn.onclick = async () => {
                const message = messageInput.value.trim();
                if (!message) {
                    alert("Message cannot be empty!");
                    return;
                }

                sendMessageBtn.disabled = true;
                sendMessageBtn.innerText = "Sending...";

                try {
                    const args = { receiver: username, content: message };
                    console.log("Sending JSON Payload:", JSON.stringify(args));

                    await contract.send_message(args, "300000000000000");

                    console.log("Message Sent Successfully!");
                    messageInput.value = "";

                    // Refresh messages for the same user instead of reloading the user list
                    loadMessages(username);  
                } catch (error) {
                    console.error("🚨 Error sending message:", error);
                    alert("Error sending message: " + (error.message || "Unknown error"));
                } finally {
                    sendMessageBtn.disabled = false;
                    sendMessageBtn.innerText = "Send";
                }
            };

            // Load messages when the user is selected
            loadMessages(username);
        }

        // 🟢 Now define loadUsers
        async function loadUsers() {
            try {
                const users = await contract.view_users();
                if (!users.length) {
                    userList.innerHTML = "<li>No active users</li>";
                    return;
                }

                userList.innerHTML = users
            .map(user => `<li class="user-item" data-username="${user[0]}">${user[1]}</li>`)
                    .join("");

                document.querySelectorAll(".user-item").forEach(item => {
                    item.addEventListener("click", () => selectUser(item.dataset.username));
                });

                // If a user was previously selected, re-select them
                if (selectedUser) {
                    selectUser(selectedUser);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
                alert("Error fetching users: " + error.message);
            }
        }

        // 🟢 Load messages
        async function loadMessages(username) {
            try {
                console.log("Fetching messages for:", username);
                const currentUser = wallet.getAccountId();

                const messagesContainer = document.getElementById("messages-container");
                if (!messagesContainer) {
                    console.error("Error: messagesContainer element not found.");
                    return;
                }

                messagesContainer.innerHTML = "<p>Loading messages...</p>";

                const args = { user: username };
                console.log("Fetching messages with payload:", JSON.stringify(args));

                const messages = await contract.get_messages(args);
                console.log("Messages received:", messages);

                messagesContainer.innerHTML = "";

                if (!messages || messages.length === 0) {
                    messagesContainer.innerHTML = "<p>No messages found.</p>";
                    return;
                }

                // Filter messages to only show conversation between current user and selected user
                const filteredMessages = messages.filter(msg => 
                    (msg.sender === currentUser && msg.receiver === username) ||
                    (msg.sender === username && msg.receiver === currentUser)
                );

                filteredMessages.forEach(msg => {
                    const messageElement = document.createElement("p");
                    messageElement.textContent = `${msg.sender === currentUser ? 'You' : msg.sender} ➝ ${msg.receiver === currentUser ? 'You' : msg.receiver}: ${msg.content}`;
                    messagesContainer.appendChild(messageElement);
                });

            } catch (error) {
                console.error("🚨 Error loading messages:", error);
                alert("Failed to load messages. " + (error.message || "Unknown error"));
            }
        }

        // 🟢 Register User
        registerBtn.onclick = async () => {
            const username = prompt("Enter your username:");
            if (!username) return alert("Username cannot be empty!");

            try {
                console.log("Registering user:", username);

                await contract.register_user(
                    { username },
                    "30000000000000", // Gas
                    "0" // Deposit
                );

                alert("User registered successfully!");
                loadUsers();
            } catch (error) {
                console.error("Registration error:", error);
                alert("Registration error: " + error.message);
            }
        };

        // Load users on startup
        loadUsers();
    } else {
        chatContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    }
}

// Ensure near-api-js is loaded before running init()
if (typeof nearApi === "undefined") {
    console.error("Error: near-api-js not found. Ensure it is included in your HTML.");
} else {
    init();
}
