import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function Footer() {
    return (
      <footer className="bg-gradient-to-r from-blue-900 to-purple-900 text-white py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">SocioGram</h3>
              <p className="text-gray-300">Connect with NEAR</p>
            </div>
            
            <div className="flex space-x-6">
              <a 
                href="https://github.com/swapnilparicha/SocioGram" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors transform hover:scale-110"
              >
                <FaGithub size={24} />
              </a>
              <a 
                href="https://www.linkedin.com/in/swapnil-paricha/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition-colors transform hover:scale-110"
              >
                <FaLinkedin size={24} />
              </a>
            </div>
          </div>
          
          <div className="mt-8 text-center text-gray-300 text-sm">
            © {new Date().getFullYear()} SocioGram. All rights reserved.
            <p className="mt-2">Built by Team 100</p>
          </div>
        </div>
      </footer>
    );
  }