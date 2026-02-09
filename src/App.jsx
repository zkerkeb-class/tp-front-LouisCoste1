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
    </div>
  )
}

export default App
