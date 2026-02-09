import { useState, useEffect } from "react";
import PokeCard from "../pokeCard";

import './index.css';

const PokeList = ({ searchQuery = "" }) => {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalPokemons, setTotalPokemons] = useState(0);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");

    const types = ["all", "grass", "fire", "water", "bug", "normal", "poison", "electric", "ground", "fairy", "dragon", "psychic", "rock", "ghost", "ice", "fighting"];

    const typeGradients = {
        all: "linear-gradient(145deg, #ffffff, #dcdcdc)",
        grass: "linear-gradient(145deg, #78C850, #5ca83e)",
        fire: "linear-gradient(145deg, #F08030, #d66818)",
        water: "linear-gradient(145deg, #6890F0, #4d72cc)",
        bug: "linear-gradient(145deg, #A8B820, #8d9a16)",
        normal: "linear-gradient(145deg, #A8A878, #8d8d64)",
        poison: "linear-gradient(145deg, #A040A0, #803080)",
        electric: "linear-gradient(145deg, #F8D030, #d6b11c)",
        ground: "linear-gradient(145deg, #E0C068, #c4a44d)",
        fairy: "linear-gradient(145deg, #EE99AC, #d67a91)",
        dragon: "linear-gradient(145deg, #7038F8, #5523cc)",
        psychic: "linear-gradient(145deg, #F85888, #d63666)",
        rock: "linear-gradient(145deg, #B8A038, #988020)",
        ghost: "linear-gradient(145deg, #705898, #554078)",
        ice: "linear-gradient(145deg, #98D8D8, #78b8b8)",
        fighting: "linear-gradient(145deg, #C03028, #9d241d)"
    };

    useEffect(() => {
        fetchPokemons();
    }, [currentPage, searchQuery]);

    const fetchPokemons = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let url = `http://localhost:3000/pokemons?page=${currentPage}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch pokemons');
            }
            
            const data = await response.json();
            console.log("Données reçues:", data);
            setPokemons(data.pokemons);
            setTotalPages(data.totalPages);
            setTotalPokemons(data.totalPokemons);
            setLoading(false);
        } catch (error) {
            console.error("Erreur:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Filtrage local par recherche et type
    const filteredPokemons = pokemons.filter((pokemon) => {
        const pokemonName = pokemon.name?.french || pokemon.name?.english || pokemon.name || '';
        const matchesSearch = pokemonName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === "all" || (pokemon.type && pokemon.type.some(t => t.toLowerCase() === selectedType.toLowerCase()));
        return matchesSearch && matchesType;
    }).sort((a, b) => a.id - b.id); // Tri par ID croissant

    if (loading) {
        return <div className="loading">🔄 Chargement...</div>
    }

    if (error) {
        return (
            <div className="error">
                <p>❌ Erreur: {error}</p>
                <p>Assurez-vous que le backend est lancé sur http://localhost:3000</p>
            </div>
        );
    }

    return (
        <div className="poke-list-container" style={{width: '100%', minHeight: '100vh', padding: '20px 0'}}>
            
            {/* SEARCH BAR */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '50px' }}>
                <input 
                    type="text" 
                    placeholder="Recherche système..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '15px 30px', 
                        width: '50%', 
                        minWidth:'300px', 
                        borderRadius: '50px',
                        border: 'none', 
                        fontSize: '1.2rem', 
                        outline: 'none',
                        background: 'rgba(255,255,255,0.05)', 
                        color: 'white', 
                        backdropFilter: 'blur(15px)',
                        boxShadow: 'inset 2px 2px 5px rgba(255,255,255,0.1), inset -2px -2px 5px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.5)',
                    }}
                />
            </div>

            {/* TYPE FILTERING BUTTONS */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '15px', 
                flexWrap: 'wrap', 
                marginBottom: '60px', 
                padding: '0 40px' 
            }}>
                {types.map((type) => (
                    <button
                        key={type} 
                        onClick={() => setSelectedType(type)}
                        style={{
                            padding: '12px 25px', 
                            borderRadius: '15px', 
                            border: 'none', 
                            cursor: 'pointer', 
                            fontWeight: '900', 
                            textTransform: 'uppercase',
                            fontSize: '0.85rem', 
                            letterSpacing: '1px', 
                            color: type === 'all' && selectedType !== 'all' ? '#333' : 'white',
                            background: selectedType === type ? typeGradients[type] : 'rgba(255,255,255,0.05)',
                            boxShadow: selectedType === type ? `0 0 20px ${typeGradients[type]}` : 'none',
                            transform: selectedType === type ? 'scale(1.15) translateY(-5px)' : 'scale(1)',
                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}
                    >
                        {type}
                    </button>
                ))}
            </div>

            <div className="list-header">
                <p className="pokemon-count">Affichage: {filteredPokemons.length} / {pokemons.length} Pokémon (Page {currentPage}/{totalPages})</p>
            </div>
            
            <div className="pagination-controls">
                <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    ← Précédent
                </button>
                <span className="page-indicator">
                    Page {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Suivant →
                </button>
            </div>

            <ul className="poke-list">
                {filteredPokemons.length > 0 ? (
                    filteredPokemons.map((pokemon) => (
                        <PokeCard key={pokemon.id} pokemon={pokemon} />
                    ))
                ) : (
                    <p className="no-pokemon">Aucun Pokémon trouvé</p>
                )}
            </ul>

            <div className="pagination-controls">
                <button 
                    onClick={handlePreviousPage} 
                    disabled={currentPage === 1}
                    className="pagination-button"
                >
                    ← Précédent
                </button>
                <span className="page-indicator">
                    Page {currentPage} / {totalPages}
                </span>
                <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-button"
                >
                    Suivant →
                </button>
            </div>
        </div>
    );
};

export default PokeList;
