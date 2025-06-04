import React, { createContext, useContext, useState, useEffect } from 'react';
import { connect, keyStores, WalletConnection, Contract } from 'near-api-js';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletConnection, setWalletConnection] = useState(null);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const initNear = async () => {
      const nearConfig = {
        networkId: 'testnet',
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
      };

      const near = await connect(nearConfig);
      const wallet = new WalletConnection(near, 'your-app-name');
      
      setWalletConnection(wallet);

      if (wallet.isSignedIn()) {
        const contract = new Contract(
          wallet.account(),
          'swapnilparicha.testnet',
          {
            viewMethods: ['getMessages'],
            changeMethods: ['addMessage'],
            sender: wallet.account(),
          }
        );
        setContract(contract);
      }
    };

    initNear();
  }, []);

  return (
    <WalletContext.Provider value={{ walletConnection, contract }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext); 