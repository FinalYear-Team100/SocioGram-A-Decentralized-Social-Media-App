import { useState } from 'react';
import { FaLinkedin } from 'react-icons/fa';

import inderImage from '../assets/inder.jpg';
import shantanuImage from '../assets/shantanu.jpg';
import subodhImage from '../assets/subhodh.jpg';
import swapnilImage from '../assets/swapnil.jpg';

export default function About() {
  const teamMembers = [
    {
      id: 1,
      name: "INDER SHEKHAR SINGH",
      usn: "ENG21CS0159",
      image: inderImage,
      linkedin: "https://www.linkedin.com/in/inder-shekhar-singh/"
    },
    {
      id: 2,
      name: "SHANTANU SHARMA",
      usn: "ENG21CS0372",
      image: shantanuImage,
      linkedin: "https://www.linkedin.com/in/shantanu-sharma/"
    },
    {
      id: 3,
      name: "SUBHODH SATISH BIJJUR",
      usn: "ENG21CS0419",
      image: subodhImage,
      linkedin: "https://www.linkedin.com/in/subodh-bijjur/"
    },
    {
      id: 4,
      name: "SWAPNIL PARICHA",
      usn: "ENG21CS0432",
      image: swapnilImage,
      linkedin: "https://www.linkedin.com/in/swapnil-paricha/"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="transition-all duration-300">
        <h1 className="text-3xl font-bold mb-6 text-blue-600">Meet Team 100</h1>
        <p className="text-lg mb-8 text-gray-700">
          We are a group of passionate developers committed to building the next generation of 
          decentralized social applications. Our diverse skills and shared vision drive us to 
          create innovative solutions on the blockchain.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member) => (
            <div 
              key={member.id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="flex justify-center pt-8 pb-4">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 p-1 bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover rounded-full transition-transform duration-500 transform hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${member.name.replace(' ', '+')}&background=random&color=fff&size=256`;
                    }}
                  />
                </div>
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{member.usn}</p>
                
                <div className="flex justify-center mt-4">
                  <a 
                    href={member.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 transition-colors transform hover:scale-125"
                  >
                    <FaLinkedin size={28} />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg mt-12 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Join Us on This Journey</h2>
          <p className="text-lg mb-6">
            We're building the future of social networking, and we'd love your feedback and support.
            Connect with us on LinkedIn to learn more about our work.
          </p>
          <div className="text-center">
            <span className="inline-block bg-white text-blue-600 font-bold py-2 px-6 rounded-full text-lg shadow-md transform transition-transform hover:scale-105">
              Team 100 - Building the Decentralized Future
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}