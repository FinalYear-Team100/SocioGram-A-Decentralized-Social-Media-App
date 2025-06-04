import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext'; // Make sure this import exists

const Chat = () => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { walletConnection, contract } = useWallet(); // Get wallet connection from context

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors

      if (!walletConnection?.isSignedIn()) {
        throw new Error('Please connect your wallet first');
      }

      const accountId = walletConnection.getAccountId();

      const messageObj = {
        sender: accountId,
        text: message,
        timestamp: Date.now(),
      };

      // Add more detailed logging
      console.log('Sending message with account:', accountId);
      console.log('Message object:', messageObj);

      await contract.addMessage({
        args: { message: messageObj },
        gas: '300000000000000',
      });

      setMessage('');
      await loadMessages();
      
    } catch (error) {
      console.error('Error sending message:', error);
      setError(`Failed to send message: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isLoading}
          placeholder="Type your message..."
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default Chat; 