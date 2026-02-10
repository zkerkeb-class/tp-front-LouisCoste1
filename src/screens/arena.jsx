import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import './arena.css';

const API_URL = 'http://localhost:3000';

// Champions de l'arène avec leurs teams
const CHAMPIONS = [
  {
    id: 1,
    name: 'Ondine',
    title: 'Champion Eau',
    type: 'Water',
    badge: '💧',
    team: [7, 8, 9, 54, 55], // Squirtle line + Psyduck line
    difficulty: 1,
    reward: 1000,
  },
  {
    id: 2,
    name: 'Pierre',
    title: 'Champion Roche',
    type: 'Rock',
    badge: '🪨',
    team: [74, 75, 76, 95], // Geodude line + Onix
    difficulty: 1,
    reward: 1200,
  },
  {
    id: 3,
    name: 'Major Bob',
    title: 'Champion Électrique',
    type: 'Electric',
    badge: '⚡',
    team: [25, 26, 100, 101], // Pikachu line + Voltorb line
    difficulty: 2,
    reward: 1500,
  },
  {
    id: 4,
    name: 'Erika',
    title: 'Champion Plante',
    type: 'Grass',
    badge: '🌿',
    team: [1, 2, 3, 43, 44, 45], // Bulbasaur line + Oddish line
    difficulty: 2,
    reward: 1800,
  },
  {
    id: 5,
    name: 'Auguste',
    title: 'Champion Poison',
    type: 'Poison',
    badge: '☠️',
    team: [89, 109, 110], // Muk + Koffing line
    difficulty: 3,
    reward: 2000,
  },
  {
    id: 6,
    name: 'Koga',
    title: 'Maître Poison/Psy',
    type: 'Psychic',
    badge: '🔮',
    team: [63, 64, 65, 93, 94], // Abra line + Gastly line
    difficulty: 3,
    reward: 2500,
  },
  {
    id: 7,
    name: 'Auguste',
    title: 'Champion Feu',
    type: 'Fire',
    badge: '🔥',
    team: [4, 5, 6, 37, 38, 58, 59], // Charmander + Vulpix + Growlithe
    difficulty: 4,
    reward: 3000,
  },
  {
    id: 8,
    name: 'Peter',
    title: 'Maître Pokémon',
    type: 'Dragon',
    badge: '🐉',
    team: [3, 6, 9, 130, 131, 149], // Starters evolved + Dragonite line
    difficulty: 5,
    reward: 10000,
  },
];

function Arena() {
  const navigate = useNavigate();
  const [myTeam, setMyTeam] = useState([]);
  const [allPokemons, setAllPokemons] = useState([]);
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [currentBattle, setCurrentBattle] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);

  useEffect(() => {
    loadPokemons();
    loadLeaderboard();
  }, []);

  const loadPokemons = async () => {
    try {
      const res = await fetch(`${API_URL}/pokemons?page=1`);
      const data = await res.json();
      setAllPokemons(data.pokemons || []);
    } catch (error) {
      console.error('Error loading pokemons:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const res = await fetch(`${API_URL}/leaderboard`);
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const togglePokemonInTeam = (pokemon) => {
    if (myTeam.find(p => p.id === pokemon.id)) {
      setMyTeam(myTeam.filter(p => p.id !== pokemon.id));
    } else {
      if (myTeam.length < 6) {
        setMyTeam([...myTeam, pokemon]);
      } else {
        alert('Vous ne pouvez avoir que 6 Pokémon maximum dans votre équipe !');
      }
    }
  };

  const startChampionChallenge = async (champion) => {
    if (myTeam.length === 0) {
      alert('Construisez d\'abord votre équipe !');
      setShowTeamBuilder(true);
      return;
    }

    setSelectedChampion(champion);
    setCurrentBattle(0);
    
    // Charger tous les Pokémon du champion
    const championTeam = [];
    for (const pokemonId of champion.team) {
      const res = await fetch(`${API_URL}/pokemons/${pokemonId}`);
      const pokemon = await res.json();
      championTeam.push(pokemon);
    }
    
    // Lancer le combat avec les équipes complètes
    navigate('/battle', {
      state: {
        pokemon1: myTeam[0],
        pokemon2: championTeam[0],
        isAI: true,
        isChampionBattle: true,
        champion,
        playerTeam: myTeam,
        enemyTeam: championTeam,
      }
    });
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <div className="arena-container">
      {/* Bouton Quitter */}
      <Link to="/" className="quit-arena-button">
        ← Quitter l'arène
      </Link>
      
      {/* Header */}
      <div className="arena-header">
        <h1 className="arena-title">
          <span className="arena-icon">🏟️</span>
          Arène Pokémon
          <span className="arena-icon">🏆</span>
        </h1>
        <p className="arena-subtitle">Affrontez les Champions et devenez le Maître Pokémon !</p>
      </div>

      {/* Team Builder Toggle */}
      <div className="team-section">
        <button 
          className="team-toggle-button"
          onClick={() => setShowTeamBuilder(!showTeamBuilder)}
        >
          {showTeamBuilder ? '🔽 Masquer' : '🔼 Construire'} Mon Équipe ({myTeam.length}/6)
        </button>
        
        {showTeamBuilder && (
          <div className="team-builder">
            <h2>Construisez votre équipe</h2>
            
            {/* Mon équipe */}
            <div className="my-team">
              <h3>Mon Équipe ({myTeam.length}/6)</h3>
              <div className="team-slots">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className={`team-slot ${myTeam[index] ? 'filled' : 'empty'}`}>
                    {myTeam[index] ? (
                      <>
                        <img src={myTeam[index].image} alt={myTeam[index].name.french} />
                        <div className="slot-name">{myTeam[index].name.french}</div>
                        <div className="slot-level">Niv. {myTeam[index].level || 5}</div>
                        <button 
                          className="remove-btn"
                          onClick={() => togglePokemonInTeam(myTeam[index])}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <div className="empty-slot-text">Vide</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tous les Pokémon */}
            <div className="pokemon-selector">
              <h3>Sélectionnez vos Pokémon</h3>
              <div className="pokemon-grid">
                {allPokemons.map(pokemon => {
                  const inTeam = myTeam.find(p => p.id === pokemon.id);
                  return (
                    <div 
                      key={pokemon.id}
                      className={`pokemon-card-mini ${inTeam ? 'in-team' : ''}`}
                      onClick={() => togglePokemonInTeam(pokemon)}
                    >
                      <img src={pokemon.image} alt={pokemon.name.french} />
                      <div className="card-name">{pokemon.name.french}</div>
                      <div className="card-level">Niv. {pokemon.level || 5}</div>
                      {inTeam && <div className="checkmark">✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Champions Grid */}
      <div className="champions-section">
        <h2 className="section-title">Choisissez votre adversaire</h2>
        <div className="champions-grid">
          {CHAMPIONS.map(champion => (
            <div 
              key={champion.id}
              className={`champion-card difficulty-${champion.difficulty}`}
            >
              <div className="champion-badge">{champion.badge}</div>
              <h3 className="champion-name">{champion.name}</h3>
              <p className="champion-title">{champion.title}</p>
              <div className="champion-difficulty">
                Difficulté: {getDifficultyStars(champion.difficulty)}
              </div>
              <div className="champion-reward">
                Récompense: {champion.reward} XP
              </div>
              <div className="champion-team-count">
                {champion.team.length} Pokémon
              </div>
              <button 
                className="challenge-button"
                onClick={() => startChampionChallenge(champion)}
              >
                Défier !
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="leaderboard-section">
        <h2 className="section-title">🏆 Classement des Champions</h2>
        <div className="leaderboard">
          {leaderboard.map((pokemon, index) => (
            <div key={pokemon.id} className="leaderboard-entry">
              <div className="rank">#{index + 1}</div>
              <img src={pokemon.image} alt={pokemon.name.french} className="leader-image" />
              <div className="leader-info">
                <div className="leader-name">{pokemon.name.french}</div>
                <div className="leader-stats">
                  <span className="wins">✅ {pokemon.wins || 0}</span>
                  <span className="losses">❌ {pokemon.losses || 0}</span>
                  <span className="ratio">
                    Ratio: {pokemon.wins && pokemon.losses 
                      ? (pokemon.wins / (pokemon.wins + pokemon.losses) * 100).toFixed(1)
                      : pokemon.wins ? '100' : '0'}%
                  </span>
                </div>
              </div>
              {index === 0 && <div className="crown">👑</div>}
              {index === 1 && <div className="medal">🥈</div>}
              {index === 2 && <div className="medal">🥉</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Retour */}
      <div className="arena-footer">
        <button 
          className="back-button"
          onClick={() => navigate('/')}
        >
          ← Retour au Pokédex
        </button>
      </div>
    </div>
  );
}

export default Arena;
