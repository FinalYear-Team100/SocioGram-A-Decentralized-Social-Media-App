import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Chat />
    </WalletProvider>
  );
}

export default App; 