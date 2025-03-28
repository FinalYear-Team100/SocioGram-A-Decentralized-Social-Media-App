import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Chat from './pages/Chat';
import { initNear, login, isSignedIn } from './utils/near';

function App() {
  const [nearLoaded, setNearLoaded] = useState(false);
  const [userSignedIn, setUserSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Check login status whenever the component mounts or window gains focus
  const checkLoginStatus = async () => {
    if (nearLoaded) {
      setUserSignedIn(isSignedIn());
    }
  };
  
  useEffect(() => {
    // Initialize NEAR connection
    async function initializeNear() {
      setLoading(true);
      try {
        await initNear();
        setNearLoaded(true);
        setUserSignedIn(isSignedIn());
      } catch (error) {
        console.error("Failed to initialize NEAR:", error);
      } finally {
        setLoading(false);
      }
    }
    
    initializeNear();
    
    // Check login status when window gains focus
    window.addEventListener('focus', checkLoginStatus);
    return () => window.removeEventListener('focus', checkLoginStatus);
  }, []);
  
  // Handle login
  const handleLogin = () => {
    login();
  };

  // Show loading screen while initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading SocioGram...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header 
          onLogin={handleLogin}
          isSignedIn={userSignedIn} 
        />
        
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={userSignedIn ? <Navigate to="/chat" replace /> : <Home isSignedIn={userSignedIn} />} 
            />
            <Route path="/about" element={<About />} />
            <Route 
              path="/chat" 
              element={userSignedIn ? <Chat /> : <Navigate to="/" replace />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;