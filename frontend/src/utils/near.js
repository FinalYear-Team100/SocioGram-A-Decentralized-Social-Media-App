import * as nearAPI from 'near-api-js';

// Configure NEAR connection
const nearConfig = {
    networkId:     import.meta.env.VITE_NEAR_NETWORK_ID    || 'testnet',
    nodeUrl:       import.meta.env.VITE_NEAR_NODE_URL      || 'https://rpc.testnet.near.org',
    walletUrl:     import.meta.env.VITE_NEAR_WALLET_URL    || 'https://wallet.testnet.near.org',
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
            contract = new nearAPI.Contract(
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

// Redirect to NEAR Wallet for sign-in
export function login() {
    if (!wallet) {
        console.error("❌ Wallet not initialized");
        return;
    }

    // ← always use the old signature
    wallet.requestSignIn(
        nearConfig.contractName,
        ['register_user','send_message'],
        window.location.origin + '/chat',
        window.location.origin
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
    if (!contract) await initNear();
    return (await contract.get_messages({ user: userId })) || [];
}

export async function sendMessage(receiver, content) {
    if (!contract) throw new Error("Contract not initialized");
    return contract.send_message({ receiver, content });
}