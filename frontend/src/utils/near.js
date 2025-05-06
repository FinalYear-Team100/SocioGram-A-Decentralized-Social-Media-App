import * as nearAPI from 'near-api-js';

// Configure NEAR connection
const nearConfig = {
    networkId:     import.meta.env.VITE_NEAR_NETWORK_ID    || 'testnet',
    nodeUrl:       import.meta.env.VITE_NEAR_NODE_URL      || 'https://rpc.testnet.near.org',
    walletUrl:     import.meta.env.VITE_NEAR_WALLET_URL    || 'https://testnet.mynearwallet.com',
    helperUrl:     import.meta.env.VITE_NEAR_HELPER_URL    || 'https://helper.testnet.near.org',
    explorerUrl:   import.meta.env.VITE_NEAR_EXPLORER_URL  || 'https://explorer.testnet.near.org',
    contractName:  import.meta.env.VITE_NEAR_CONTRACT_NAME || 'swapnilparicha.testnet',
  }

// Global variables
let near;
let wallet;
let contract;

// Initialize NEAR connection
export async function initNear() {
    try {
        console.log("Initializing NEAR with config:", nearConfig);
        
        // Initialize connection to the NEAR network
        near = await nearAPI.connect({
            networkId: nearConfig.networkId,
            nodeUrl:    nearConfig.nodeUrl,
            walletUrl:  nearConfig.walletUrl,
            helperUrl:  nearConfig.helperUrl,
            keyStore:   new nearAPI.keyStores.BrowserLocalStorageKeyStore(),
        });
        console.log("NEAR connection established");

        // Initialize wallet connection
        wallet = new nearAPI.WalletConnection(near, "sociogram");
        console.log("Wallet initialized, signed in:", wallet.isSignedIn());

        // Initialize contract interface if user is signed in
        if (wallet.isSignedIn()) {
            console.log("User is signed in, initializing contract for:", nearConfig.contractName);
            contract = new nearAPI.Contract(
                wallet.account(),
                nearConfig.contractName,
                {
                    viewMethods: ["view_users", "get_messages", "get_methods"],
                    changeMethods: ["register_user", "send_message"],
                }
            );
            console.log("Contract interface initialized");
        }

        return { near, wallet, contract };
    } catch (error) {
        console.error("Error initializing NEAR:", error);
        throw error;
    }
}

// Redirect to NEAR Wallet for sign-in
export function login() {
    if (!wallet) throw new Error("Wallet not initialized");
    // ← use the positional overload so it hits /login on MyNearWallet
    return wallet.requestSignIn(
        nearConfig.contractName,          // your contract
        ['register_user','send_message'], // the methods you'll call
        window.location.origin + '/chat',  // success redirect
        window.location.origin            // failure redirect
    );
}

// Sign out and reload
export function logout() {
    if (!wallet) {
        console.error("❌ Wallet not initialized");
        return;
    }
    wallet.signOut();
    window.location.reload();
}

// Helpers
export function isSignedIn() {
    return wallet?.isSignedIn() || false;
}

export function getAccountId() {
    return wallet?.isSignedIn() ? wallet.getAccountId() : null;
}

// Contract calls
export async function registerUser(username) {
    if (!contract) throw new Error("Contract not initialized");
    return contract.register_user({ username });
}

export async function getUsers() {
    if (!contract) return [];
    return contract.view_users();
}

export async function getMessages(userId) {
    try {
        if (!contract) {
            console.log("Contract not initialized, attempting to initialize NEAR...");
            await initNear();
            
            if (!contract) {
                console.error("Failed to initialize contract");
                return [];
            }
        }
        
        console.log("Getting messages for user:", userId);
        const messages = await contract.get_messages({ user: userId }) || [];
        console.log("Received messages:", messages.length);
        return messages;
    } catch (error) {
        console.error("Error getting messages:", error);
        return [];
    }
}

export async function sendMessage(receiver, content) {
    if (!contract) throw new Error("Contract not initialized");
    return contract.send_message({ receiver, content });
}










