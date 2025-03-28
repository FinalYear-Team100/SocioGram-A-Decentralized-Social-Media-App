import * as nearAPI from 'near-api-js';

// Configure NEAR connection
const nearConfig = {
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
    walletUrl: "https://testnet.mynearwallet.com",
    helperUrl: "https://helper.testnet.near.org",
    explorerUrl: "https://explorer.testnet.near.org",
    contractName: "swapnilparicha.testnet", // Replace with your contract account
};

// Global variables
let near;
let wallet;
let contract;

// Initialize NEAR connection
export async function initNear() {
    try {
        // Initialize connection to the NEAR network
        near = await nearAPI.connect({
            deps: {
                keyStore: new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
            },
            ...nearConfig,
        });

        // Initialize wallet connection
        wallet = new nearAPI.WalletConnection(near, "sociogram");

        // Initialize contract interface if user is signed in
        if (wallet.isSignedIn()) {
            contract = await new nearAPI.Contract(
                wallet.account(),
                nearConfig.contractName,
                {
                    viewMethods: ["view_users", "get_messages", "get_methods"],
                    changeMethods: ["register_user", "send_message"],
                }
            );
        }

        return { near, wallet, contract };
    } catch (error) {
        console.error("Error initializing NEAR:", error);
        throw error;
    }
}

// Login with NEAR wallet
export function login() {
    if (!wallet) {
        console.error("Wallet not initialized");
        return;
    }
    
    wallet.requestSignIn({
        contractId: nearConfig.contractName,
        methodNames: ["register_user", "send_message"],
        successUrl: window.location.origin + "/chat"
    });
}

// Logout from NEAR wallet
export function logout() {
    if (!wallet) {
        console.error("Wallet not initialized");
        return;
    }
    
    wallet.signOut();
    
    // Redirect to home page
    window.location.href = '/';
}

// Check if user is signed in
export function isSignedIn() {
    return wallet && wallet.isSignedIn();
}

// Get current account ID
export function getAccountId() {
    return wallet && wallet.isSignedIn() ? wallet.getAccountId() : null;
}

// Register a new user
export async function registerUser(username) {
    if (!contract) {
        console.error("Contract not initialized");
        return null;
    }
    
    try {
        return await contract.register_user({ username });
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

// Get all registered users
export async function getUsers() {
    if (!contract) {
        console.error("Contract not initialized");
        return [];
    }
    
    try {
        return await contract.view_users();
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

// Get messages for a user
export async function getMessages(userId) {
    try {
        if (!contract) {
            console.log("Contract not initialized, initializing now...");
            await initNear();
        }
        
        console.log("Fetching messages for user:", userId);
        try {
            const messages = await contract.get_messages({ user: userId });
            console.log("Successfully retrieved messages:", messages);
            return messages || [];
        } catch (err) {
            console.error("Error retrieving messages:", err);
            return []; // Return empty array on error
        }
    } catch (error) {
        console.error("Error in getMessages:", error);
        return [];
    }
}

// Send a message
export async function sendMessage(receiver, content) {
    if (!contract) {
        console.error("Contract not initialized");
        return null;
    }
    
    try {
        return await contract.send_message({ receiver, content });
    } catch (error) {
        console.error("Error sending message:", error);
        throw error;
    }
}