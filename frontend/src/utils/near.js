import * as nearAPI from 'near-api-js';

// Configure NEAR connection
const nearConfig = {
  networkId: import.meta.env.VITE_NEAR_NETWORK_ID || 'testnet',
  nodeUrl: import.meta.env.VITE_NEAR_NODE_URL || 'https://rpc.testnet.near.org',
  walletUrl: import.meta.env.VITE_NEAR_WALLET_URL || 'https://testnet.mynearwallet.com',
  helperUrl: import.meta.env.VITE_NEAR_HELPER_URL || 'https://helper.testnet.near.org',
  explorerUrl: import.meta.env.VITE_NEAR_EXPLORER_URL || 'https://explorer.testnet.near.org',
  contractName: import.meta.env.VITE_NEAR_CONTRACT_NAME || 'swapnilparicha.testnet',
};

// Global variables with more descriptive names
let nearConnection;
let walletConnection;
let contractInstance;

/**
 * Initialize NEAR connection with better error handling
 * @param {boolean} forceReinit - Force reinitialization even if already initialized
 * @returns {Promise<{near: object, wallet: object, contract: object}>}
 */
export async function initNear(forceReinit = false) {
  // If already initialized and not forcing reinit, return existing
  if (!forceReinit && nearConnection && walletConnection) {
    console.log('Using existing NEAR connection');
    return { near: nearConnection, wallet: walletConnection, contract: contractInstance };
  }
  
  try {
    // Clear any existing references if forcing reinit
    if (forceReinit) {
      resetConnection();
    }
    
    console.log('Initializing NEAR with config:', JSON.stringify({
      networkId: nearConfig.networkId,
      nodeUrl: nearConfig.nodeUrl,
      walletUrl: nearConfig.walletUrl,
      contractName: nearConfig.contractName
    }));

    // Create a new keystore to avoid potential issues with existing keys
    const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();
    
    // Initialize connection to the NEAR network with timeout
    const connectPromise = nearAPI.connect({
      networkId: nearConfig.networkId,
      nodeUrl: nearConfig.nodeUrl,
      walletUrl: nearConfig.walletUrl,
      helperUrl: nearConfig.helperUrl,
      keyStore: keyStore,
      headers: {}
    });
    
    // Set up a timeout to handle potential hanging connections
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Connection timeout')), 10000);
    });
    
    // Wait for connection or timeout
    nearConnection = await Promise.race([connectPromise, timeoutPromise]);
    
    // Initialize wallet connection with app name
    walletConnection = new nearAPI.WalletConnection(nearConnection, "sociogram");
    
    console.log('Wallet initialized, signed in:', walletConnection.isSignedIn());

    // Initialize contract interface if user is signed in
    if (walletConnection.isSignedIn()) {
      try {
        // Add a delay before initializing the contract to ensure the wallet is fully ready
        console.log('User is signed in, initializing contract with delay...');
        
        // Create a delayed initialization function
        const initContractWithDelay = async () => {
          try {
            console.log(`Initializing contract: ${nearConfig.contractName}`);
            contractInstance = new nearAPI.Contract(
              walletConnection.account(),
              nearConfig.contractName,
              {
                viewMethods: ["view_users", "get_messages", "get_methods"],
                changeMethods: ["register_user", "send_message"],
              }
            );
            console.log('Contract initialized successfully');
            return contractInstance;
          } catch (delayedContractError) {
            console.error('Delayed contract initialization failed:', delayedContractError);
            return null;
          }
        };
        
        // First try immediate initialization
        contractInstance = new nearAPI.Contract(
          walletConnection.account(),
          nearConfig.contractName,
          {
            viewMethods: ["view_users", "get_messages", "get_methods"],
            changeMethods: ["register_user", "send_message"],
          }
        );
        
        // If we get here without error, we succeeded immediately
        console.log('Contract initialized successfully on first attempt');
      } catch (contractError) {
        console.error('First attempt to initialize contract failed:', contractError);
        console.log('Will retry after wallet is fully loaded...');
        
        // Set a delayed retry
        setTimeout(async () => {
          try {
            contractInstance = new nearAPI.Contract(
              walletConnection.account(),
              nearConfig.contractName,
              {
                viewMethods: ["view_users", "get_messages", "get_methods"],
                changeMethods: ["register_user", "send_message"],
              }
            );
            console.log('Contract initialized successfully on delayed attempt');
          } catch (retryError) {
            console.error('Failed to initialize contract on retry:', retryError);
          }
        }, 2000); // 2-second delay
      }
    }

    return { 
      near: nearConnection, 
      wallet: walletConnection, 
      contract: contractInstance 
    };
  } catch (error) {
    console.error("Error initializing NEAR:", error);
    // More detailed error reporting
    if (error.message.includes('network')) {
      console.error("Network connection issue. Please check your internet connection.");
    } else if (error.message.includes('contract')) {
      console.error("Contract error. The smart contract may be unavailable.");
    }
    throw error;
  }
}

/**
 * Get current path without any query parameters
 * @returns {string} Clean path
 */
function getCleanPath() {
  return window.location.pathname;
}

/**
 * Redirect to NEAR Wallet for sign-in with improved error handling
 */
export function login() {
  // Check if wallet is already initialized
  if (!walletConnection) {
    console.log('Wallet not initialized, attempting to initialize...');
    return initNear().then(() => login());
  }
  
  // If already signed in, handle properly
  if (walletConnection.isSignedIn()) {
    console.log('Already signed in as:', walletConnection.getAccountId());
    
    // If we're already signed in but contract isn't initialized, try reinitializing
    if (!contractInstance) {
      console.log('Already signed in but contract not initialized, reinitializing...');
      return initNear().then(() => {
        // Redirect to chat page if we're on the home page
        if (getCleanPath() === '/') {
          window.location.href = '/chat';
          return true;
        }
        return true;
      });
    }
    
    // If already logged in and on home page, redirect to chat
    if (getCleanPath() === '/') {
      window.location.href = '/chat';
    }
    
    return Promise.resolve(true);
  }
  
  // Set up redirect URLs
  const currentPath = getCleanPath();
  // Make sure we redirect to /chat if we're on the home page
  const successPath = currentPath === '/' ? '/chat' : currentPath;
  
  // Make sure the URLs are absolute with origin
  const successUrl = new URL(successPath, window.location.origin).toString();
  const failureUrl = new URL('/', window.location.origin).toString();
  
  console.log(`Login: Redirecting to wallet with successUrl=${successUrl}, failureUrl=${failureUrl}`);
  
  try {
    // Use the latest requestSignIn pattern which is more reliable
    return walletConnection.requestSignIn({
      contractId: nearConfig.contractName,
      methodNames: ['register_user', 'send_message'],
      successUrl: successUrl,
      failureUrl: failureUrl
    });
  } catch (error) {
    console.error('Error during login process:', error);
    
    // If we detect the specific deserialization error, try a different approach
    if (error.toString().includes('Deserialization')) {
      console.log('Detected deserialization error, trying alternative login approach...');
      
      // Use an alternative login approach with timeout
      setTimeout(() => {
        try {
          walletConnection.requestSignIn(
            nearConfig.contractName,
            undefined,
            successUrl,
            failureUrl
          );
        } catch (retryError) {
          console.error('Alternative login also failed:', retryError);
          alert('Login failed. Please try again or contact support.');
        }
      }, 1000);
    } else {
      // For other errors, just throw
      throw error;
    }
  }
}

/**
 * Sign out and reload with improved error handling
 */
export function logout() {
  try {
    if (!walletConnection) {
      console.error("❌ Wallet not initialized");
      return false;
    }
    walletConnection.signOut();
    
    // Instead of reloading immediately, redirect to home page
    window.location.href = '/';
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    return false;
  }
}

/**
 * Check if user is signed in
 * @returns {boolean} True if signed in
 */
export function isSignedIn() {
  return walletConnection?.isSignedIn() || false;
}

/**
 * Get current account ID
 * @returns {string|null} Account ID or null
 */
export function getAccountId() {
  return walletConnection?.isSignedIn() ? walletConnection.getAccountId() : null;
}

/**
 * Register a new user
 * @param {string} username Username to register
 * @returns {Promise} Result of contract call
 */
export async function registerUser(username) {
  try {
    if (!contractInstance) {
      console.log('Contract not initialized, attempting to initialize...');
      await initNear();
      
      if (!contractInstance) {
        throw new Error("Contract initialization failed");
      }
    }
    
    console.log(`Registering user: ${username}`);
    return await contractInstance.register_user({ username });
  } catch (error) {
    console.error(`Error registering user ${username}:`, error);
    if (error.message.includes('already registered')) {
      throw new Error('Username already taken');
    }
    throw error;
  }
}

/**
 * Get list of registered users
 * @returns {Promise<Array>} List of users
 */
export async function getUsers() {
  try {
    if (!contractInstance) {
      await initNear();
      // If still not initialized after attempt, return empty array
      if (!contractInstance) return [];
    }
    
    const users = await contractInstance.view_users();
    console.log(`Retrieved ${users?.length || 0} users`);
    return users || [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
}

/**
 * Get messages for a specific user
 * @param {string} userId User ID to get messages for
 * @returns {Promise<Array>} List of messages
 */
export async function getMessages(userId) {
  try {
    if (!contractInstance) {
      await initNear();
    }
    
    if (!contractInstance) {
      console.error("Cannot get messages: Contract not initialized");
      return [];
    }
    
    console.log(`Getting messages for user: ${userId}`);
    const messages = await contractInstance.get_messages({ user: userId });
    console.log(`Retrieved ${messages?.length || 0} messages for ${userId}`);
    return messages || [];
  } catch (error) {
    console.error(`Error getting messages for ${userId}:`, error);
    return [];
  }
}

/**
 * Send a message to another user
 * @param {string} receiver Receiver account ID
 * @param {string} content Message content
 * @returns {Promise} Result of contract call
 */
export async function sendMessage(receiver, content) {
  try {
    if (!contractInstance) {
      console.log('Contract not initialized for sending message, attempting to initialize...');
      await initNear();
      
      if (!contractInstance) {
        throw new Error("Contract initialization failed");
      }
    }
    
    if (!walletConnection?.isSignedIn()) {
      throw new Error("You need to be signed in to send messages");
    }
    
    console.log(`Sending message to ${receiver}: "${content.substring(0, 20)}${content.length > 20 ? '...' : ''}"`);
    
    // Call the contract method with specific gas and attachedDeposit parameters
    return await contractInstance.send_message({
      receiver,
      content
    }, 
    // Add specific gas amount (optional, adjust as needed)
    "300000000000000", 
    // Add attachedDeposit if required (optional)
    "0");
  } catch (error) {
    console.error(`Error sending message to ${receiver}:`, error);
    
    // Provide more context for specific error types
    if (error.message.includes('Cannot find contract')) {
      throw new Error(`Contract ${nearConfig.contractName} not found. Please check your configuration.`);
    } else if (error.message.includes('Exceeded gas limit')) {
      throw new Error('Message sending failed: gas limit exceeded. Try a shorter message.');
    } else {
      throw error;
    }
  }
}

// Additional helper functions

/**
 * Check if NEAR wallet is available
 * @returns {Promise<boolean>}
 */
export async function isWalletAvailable() {
  try {
    if (!nearConnection) {
      await initNear();
    }
    // Simple check if wallet is accessible
    return !!walletConnection;
  } catch (error) {
    console.error("Wallet availability check failed:", error);
    return false;
  }
}

/**
 * Get current NEAR network (testnet/mainnet)
 * @returns {string}
 */
export function getCurrentNetwork() {
  return nearConfig.networkId;
}

/**
 * Reset the connection (useful for testing)
 */
export function resetConnection() {
  nearConnection = null;
  walletConnection = null;
  contractInstance = null;
}

/**
 * Handle wallet connection errors, including the specific deserialization error
 * @param {Error} error - The error to handle
 * @returns {Promise<boolean>} Success status
 */
export async function handleWalletError(error) {
  // Check for the specific deserialization error
  if (
    error.toString().includes('Deserialization') || 
    error.toString().includes('CompilationError') ||
    error.toString().includes('wasm execution failed')
  ) {
    console.log('Handling WASM deserialization error with reconnection strategy...');
    
    // Step 1: Clear local storage keys related to NEAR
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('near-api-js:keystore:') || key.includes('sociogram')) {
        console.log('Clearing localStorage key:', key);
        localStorage.removeItem(key);
      }
    }
    
    // Step 2: Reset our connection variables
    resetConnection();
    
    // Step 3: Wait a moment and reinitialize
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      await initNear();
      console.log('Successfully reinitialized after error');
      return true;
    } catch (reinitError) {
      console.error('Failed to reinitialize after error:', reinitError);
      return false;
    }
  }
  
  // For other errors, just log them
  console.error('Unhandled wallet error:', error);
  return false;
}