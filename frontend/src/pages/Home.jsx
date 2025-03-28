import { Link } from 'react-router-dom';
import { login } from '../utils/near';
import { useState, useEffect } from 'react';

export default function Home({ isSignedIn }) {
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setAnimate(true);
  }, []);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 z-0"></div>
      
      {/* Animated circles */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      {/* Content */}
      <div className={`z-10 text-center px-6 transition-all duration-1000 transform ${animate ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Welcome to SocioGram
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl">
          A decentralized social platform built on NEAR Protocol, where you own your data and connections
        </p>
        
        <div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center">
          {!isSignedIn ? (
            <button
              onClick={login}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Login with NEAR Wallet
            </button>
          ) : (
            <Link
              to="/chat"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-lg font-semibold shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1 hover:scale-105"
            >
              Go to Chat
            </Link>
          )}
          
          <Link
            to="/about"
            className="px-8 py-4 rounded-full bg-white text-gray-800 border border-gray-200 text-lg font-semibold shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-1"
          >
            Learn More
          </Link>
        </div>
        
        <div className="mt-16 p-6 bg-white bg-opacity-80 backdrop-filter backdrop-blur-sm rounded-xl shadow-lg max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Why Choose SocioGram?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">Decentralized</h3>
              <p className="text-gray-600">Your data lives on the blockchain, not on corporate servers</p>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-purple-600 mb-2">Secure</h3>
              <p className="text-gray-600">End-to-end encryption keeps your conversations private</p>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-pink-600 mb-2">User-Owned</h3>
              <p className="text-gray-600">You control your data, connections, and digital identity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}