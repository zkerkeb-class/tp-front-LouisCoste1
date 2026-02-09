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
        <div className="poke-list-container">
            <div className="list-header">
                <h2>Liste des Pokémon</h2>
                <p className="pokemon-count">Total: {totalPokemons} Pokémon</p>
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
                {pokemons.length > 0 ? (
                    pokemons.map((pokemon) => (
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
