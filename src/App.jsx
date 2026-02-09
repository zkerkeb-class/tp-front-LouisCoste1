import { useState } from 'react';
import './App.css'
import Pokelist from './components/pokelist'
import { Link } from 'react-router'

function App() {
  return (
    <div className="app-container">
      <h1 className="main-title">
        Pokedex<span className="ultra">Ultra</span>
      </h1>
      
      <main>
        <Pokelist />
      </main>

      {/* Bouton flottant pour ajouter un Pokémon */}
      <Link 
        to="/add" 
        style={{
          position: 'fixed',
          bottom: '40px',
          right: '40px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: 'linear-gradient(145deg, #00c6ff, #0072ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          color: 'white',
          textDecoration: 'none',
          boxShadow: '0 0 30px rgba(0, 114, 255, 0.8), 0 10px 25px rgba(0, 0, 0, 0.5)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          fontWeight: 'bold'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15) rotate(90deg)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 114, 255, 1), 0 15px 30px rgba(0, 0, 0, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 114, 255, 0.8), 0 10px 25px rgba(0, 0, 0, 0.5)';
        }}
      >
        +
      </Link>
    </div>
  )
}

export default App
