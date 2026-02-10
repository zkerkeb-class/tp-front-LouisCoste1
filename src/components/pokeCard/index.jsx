import { useRef } from "react";
import { Link, useNavigate } from "react-router";

import './index.css';
import PokeTitle from "./pokeTitle";
import PokeImage from "./pokeImage";

// Les couleurs HEX officielles
const typeColors = {
    Normal: '#A8A878', Fire: '#F08030', Water: '#6890F0', Grass: '#78C850', Electric: '#F8D030',
    Ice: '#98D8D8', Fighting: '#C03028', Poison: '#A040A0', Ground: '#E0C068', Flying: '#A890F0',
    Psychic: '#F85888', Bug: '#A8B820', Rock: '#B8A038', Ghost: '#705898', Dragon: '#7038F8',
    Steel: '#B8B8D0', Dark: '#705848', Fairy: '#EE99AC'
};

// Les dégradés pour les types uniques
const singleTypeGradients = {
    Grass: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
    Fire: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)',
    Water: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
    Bug: 'linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)',
    Normal: 'linear-gradient(135deg, #D3CCE3 0%, #E9E4F0 100%)',
    Poison: 'linear-gradient(135deg, #834d9b 0%, #d04ed6 100%)',
    Electric: 'linear-gradient(135deg, #FDC830 0%, #F37335 100%)',
    Ground: 'linear-gradient(135deg, #ba8b02 0%, #181818 100%)',
    Fairy: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    Fighting: 'linear-gradient(135deg, #c0392b 0%, #8e44ad 100%)',
    Psychic: 'linear-gradient(135deg, #ec008c 0%, #fc6767 100%)',
    Rock: 'linear-gradient(135deg, #808080 0%, #3fada8 100%)',
    Ghost: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    Ice: 'linear-gradient(135deg, #7F7FD5 0%, #86A8E7 50%, #91EAE4 100%)',
    Dragon: 'linear-gradient(135deg, #333399 0%, #ff00cc 100%)',
    default: 'linear-gradient(135deg, #2c3e50 0%, #bdc3c7 100%)'
};

const PokeCard = ({ pokemon }) => {
    const cardRef = useRef(null);
    const navigate = useNavigate();

    // Logique du fond de carte (Double gradient ou Simple)
    let backgroundStyle;
    if (pokemon.type.length > 1) {
        const color1 = typeColors[pokemon.type[0]] || '#333';
        const color2 = typeColors[pokemon.type[1]] || '#333';
        backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    } else {
        const mainType = pokemon.type[0] || 'default';
        backgroundStyle = singleTypeGradients[mainType] || singleTypeGradients.default;
    }

    // Gestion 3D
    const handleMouseMove = (e) => {
        const card = cardRef.current;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -15; 
        const rotateY = ((x - centerX) / centerX) * 15;

        card.style.setProperty('--rx', `${rotateX}deg`);
        card.style.setProperty('--ry', `${rotateY}deg`);
        
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        card.style.setProperty('--mx', `${percentX}%`);
        card.style.setProperty('--my', `${percentY}%`);
    };

    const handleMouseLeave = () => {
        const card = cardRef.current;
        if (!card) return;
        card.style.setProperty('--rx', `0deg`);
        card.style.setProperty('--ry', `0deg`);
        card.style.setProperty('--mx', `50%`);
        card.style.setProperty('--my', `50%`);
    };

    const handleBattleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Choisir un adversaire aléatoire
        try {
            const res = await fetch('http://localhost:3000/pokemons?page=1');
            const data = await res.json();
            const randomPokemon = data.pokemons[Math.floor(Math.random() * data.pokemons.length)];
            
            navigate('/battle', {
                state: {
                    pokemon1: pokemon,
                    pokemon2: randomPokemon,
                    isAI: true,
                    playerTeam: [pokemon],
                    enemyTeam: [randomPokemon]
                }
            });
        } catch (error) {
            console.error('Error starting battle:', error);
        }
    };

    return (
        <Link to={`/pokemonDetails/${pokemon.id}`} className="card-wrapper">
            <div 
                ref={cardRef}
                className="poke-card-3d"
                style={{ background: backgroundStyle }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className="glare-overlay"></div>


                {/* Stats de combat */}
                <div className="battle-stats">
                    <div className="stat-badge level">
                        Niv. {pokemon.level || 5}
                    </div>
                    {pokemon.wins > 0 && (
                        <div className="stat-badge wins">
                            ✅ {pokemon.wins}
                        </div>
                    )}
                    {pokemon.shiny && (
                        <div className="stat-badge shiny">
                            ✨ SHINY
                        </div>
                    )}
                </div>

                {/* Bouton de combat rapide */}
                <button 
                    className="quick-battle-btn"
                    onClick={handleBattleClick}
                    title="Combat rapide !"
                >
                    ⚔️
                </button>
                <div className="img-container-3d">
                    <PokeImage imageUrl={pokemon.image} />
                </div>

                <div className="card-info">
                    <PokeTitle name={pokemon.name?.french || pokemon.name?.english || 'Unknown'} />
                    <span className="poke-id">#{pokemon.id.toString().padStart(3, '0')}</span>
                </div>

                <div className="types-container">
                    {pokemon.type?.map((type, index) => {
                        const bgColor = typeColors[type] || '#888';
                        return (
                            <span 
                                key={index} 
                                className="type-badge-glass"
                                style={{ background: bgColor }}
                            >
                                {type}
                            </span>
                        );
                    })}
                </div>
            </div>
        </Link>
    );
}

export default PokeCard;