import { Link } from 'react-router-dom';
import { logout } from '../utils/near';

export default function Header({ isSignedIn, onLogin }) {
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          SocioGram
        </Link>
        
        <div className="flex items-center space-x-6">
          {!isSignedIn && (
            <Link to="/about" className="text-gray-600 hover:text-gray-900">
              About
            </Link>
          )}
          
          {!isSignedIn ? (
            <button
              onClick={onLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login with NEAR
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </nav>
    </header>
  );
}