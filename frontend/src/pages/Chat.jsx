import { useState, useEffect, useRef } from 'react';
import { getUsers, getMessages, sendMessage, getAccountId, registerUser, login } from '../utils/near';
import { useNavigate } from 'react-router-dom';

export default function Chat() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [registering, setRegistering] = useState(false);
  const currentUser = getAccountId();
  const messagesEndRef = useRef(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!currentUser) {
      alert("Please login to continue");
      login();
      return;
    }
  }, [currentUser]);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    async function loadMessages() {
      if (selectedUser) {
        try {
          setLoading(true);
          setError(null);
          console.log("Loading messages for:", currentUser);
          const allMsgs = await getMessages(currentUser);
          console.log("Loaded messages:", allMsgs);
          
          // Filter messages to only show conversation with selected user
          const filteredMsgs = allMsgs.filter(msg => 
            (msg.sender === currentUser && msg.receiver === selectedUser.account_id) ||
            (msg.sender === selectedUser.account_id && msg.receiver === currentUser)
          );
          
          setMessages(filteredMsgs || []);
        } catch (err) {
          console.error("Failed to load messages:", err);
          setError("Could not load messages. Please try again later.");
          setMessages([]);
        } finally {
          setLoading(false);
        }
      }
    }
    
    loadMessages();
  }, [selectedUser, currentUser]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedUser) return;
    
    if (!currentUser) {
      alert("Please login to continue");
      login();
      return;
    }
    
    setSending(true);
    try {
      await sendMessage(selectedUser.account_id, newMessage);
      
      setMessages([
        ...messages,
        {
          sender: currentUser,
          receiver: selectedUser.account_id,
          content: newMessage,
          timestamp: Date.now() * 1000000
        }
      ]);
      
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.toString().includes("no matching key pair found")) {
        alert("Session expired. Please login again.");
        login();
      } else {
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSending(false);
    }
  };
  
  const handleRegister = async () => {
    try {
      if (!currentUser) {
        alert("Please login to continue");
        login();
        return;
      }

      // First check if user is already registered
      const userList = await getUsers();
      const isRegistered = userList.some(user => user[0] === currentUser);
      
      if (isRegistered) {
        alert("You are already registered!");
        await loadUsers();
        return;
      }

      const username = prompt("Enter your username:");
      if (!username) return;
      
      setRegistering(true);
      await registerUser(username);
      alert("User registered successfully!");
      await loadUsers();
    } catch (error) {
      console.error("Registration error:", error);
      if (error.toString().includes("no matching key pair found")) {
        alert("Session expired. Please login again.");
        login();
      } else if (error.toString().includes("User already registered")) {
        alert("You are already registered! Please refresh the page to see other users.");
        await loadUsers();
      } else {
        alert("Registration error: " + error.message);
      }
    } finally {
      setRegistering(false);
    }
  };
  
  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await getUsers();
      console.log("Raw user list from contract:", userList); // Debug log
      
      // Handle the data structure correctly - userList is an array of [AccountId, username] pairs
      const filteredUsers = userList
        .filter(([account_id, _]) => account_id !== currentUser)
        .map(([account_id, username]) => ({
          account_id,
          username: username || account_id.split('.')[0]
        }));
      
      console.log("Processed users:", filteredUsers); // Debug log
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4">
            <div className="md:col-span-1 bg-gray-50 border-r border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                    {currentUser ? currentUser.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">
                      {currentUser?.split('.')[0]}
                    </h3>
                    <p className="text-sm text-gray-500 break-all">
                      {currentUser}
                    </p>
                    <div className="mt-2 flex items-center justify-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        NEAR Testnet
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-b border-gray-200">
                <div className="p-4 flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-800">Contacts</h2>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
                  >
                    {registering ? "..." : "Register"}
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 330px)' }}>
                  <ul className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <li className="p-4 text-gray-500">No users found</li>
                    ) : (
                      users.map((user) => (
                        <li 
                          key={user.account_id}
                          className={`p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
                            selectedUser?.account_id === user.account_id ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.username ? user.username.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{user.username}</p>
                              <p className="text-xs text-gray-500 truncate">{user.account_id}</p>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="md:col-span-3 flex flex-col h-[calc(100vh-140px)]">
              {selectedUser ? (
                <>
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                        {selectedUser.username ? selectedUser.username.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{selectedUser.username}</p>
                        <p className="text-xs text-gray-500">{selectedUser.account_id}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                    {loading ? (
                      <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex justify-center items-center h-full text-gray-500">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((message, index) => (
                          <div 
                            key={index}
                            className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                                message.sender === currentUser 
                                  ? 'bg-blue-600 text-white rounded-br-none' 
                                  : 'bg-white text-gray-800 rounded-bl-none shadow'
                              }`}
                            >
                              <p>{message.content}</p>
                              <p className={`text-xs mt-1 ${message.sender === currentUser ? 'text-blue-200' : 'text-gray-500'}`}>
                                {message.timestamp 
                                  ? new Date(Number(message.timestamp) / 1000000).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })
                                  : new Date().toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit',
                                      hour12: true 
                                    })
                                }
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim() || sending}
                        className="bg-blue-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center disabled:opacity-50"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50 p-8">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to SocioGram Chat</h2>
                  <p className="text-gray-600 text-center max-w-md mb-8">
                    Select a contact from the list to start a conversation. Your messages are secure and stored on the NEAR blockchain.
                  </p>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <p className="text-sm text-gray-500 mb-3">
                      Logged in as: <span className="font-semibold text-blue-600">{currentUser}</span>
                    </p>
                    <button
                      onClick={handleRegister}
                      disabled={registering}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {registering ? "Registering..." : "Register Username"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}