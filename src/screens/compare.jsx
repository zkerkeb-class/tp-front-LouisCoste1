import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './compare.css';

const Compare = () => {
    const [allPokemons, setAllPokemons] = useState([]);
    const [pokemon1, setPokemon1] = useState(null);
    const [pokemon2, setPokemon2] = useState(null);
    const [search1, setSearch1] = useState('');
    const [search2, setSearch2] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllPokemons();
    }, []);

    const fetchAllPokemons = async () => {
        try {
            const response = await fetch('http://localhost:3000/pokemons?page=1');
            const data = await response.json();
            const totalPages = data.totalPages;
            
            let allPokes = [...data.pokemons];
            
            for (let page = 2; page <= totalPages; page++) {
                const res = await fetch(`http://localhost:3000/pokemons?page=${page}`);
                const pageData = await res.json();
                allPokes = [...allPokes, ...pageData.pokemons];
            }
            
            setAllPokemons(allPokes);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const filteredPokemons1 = allPokemons.filter(p => 
        (p.name?.french?.toLowerCase().includes(search1.toLowerCase()) ||
         p.name?.english?.toLowerCase().includes(search1.toLowerCase()))
    ).slice(0, 5);

    const filteredPokemons2 = allPokemons.filter(p => 
        (p.name?.french?.toLowerCase().includes(search2.toLowerCase()) ||
         p.name?.english?.toLowerCase().includes(search2.toLowerCase()))
    ).slice(0, 5);

    const getTotal = (pokemon) => {
        return Object.values(pokemon?.base || {}).reduce((sum, val) => sum + val, 0);
    };

    const getWinner = (stat) => {
        if (!pokemon1 || !pokemon2) return null;
        const val1 = pokemon1.base?.[stat] || 0;
        const val2 = pokemon2.base?.[stat] || 0;
        if (val1 > val2) return 1;
        if (val2 > val1) return 2;
        return 0;
    };

    if (loading) {
        return <div className="loading">⚔️ Chargement du comparateur...</div>;
    }

    return (
        <div className="compare-container">
            <div className="compare-header">
                <Link to="/" className="back-link">← Retour</Link>
                <h1>⚔️ Comparateur de Pokémon</h1>
                <p className="subtitle">Qui est le plus fort ?</p>
            </div>

            <div className="compare-selectors">
                {/* Sélecteur 1 */}
                <div className="selector-box">
                    <h2>Pokémon 1</h2>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Rechercher un Pokémon..."
                            value={search1}
                            onChange={(e) => setSearch1(e.target.value)}
                            className="search-input"
                        />
                        {search1 && filteredPokemons1.length > 0 && (
                            <div className="search-results">
                                {filteredPokemons1.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="search-result-item"
                                        onClick={() => {
                                            setPokemon1(p);
                                            setSearch1('');
                                        }}
                                    >
                                        <img src={p.image} alt={p.name?.french} />
                                        <span>{p.name?.french}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {pokemon1 && (
                        <div className="selected-pokemon">
                            <img src={pokemon1.image} alt={pokemon1.name?.french} />
                            <h3>{pokemon1.name?.french}</h3>
                            <div className="pokemon-types">
                                {pokemon1.type?.map((t, i) => (
                                    <span key={i} className="type-badge">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="vs-divider">
                    <div className="vs-text">VS</div>
                </div>

                {/* Sélecteur 2 */}
                <div className="selector-box">
                    <h2>Pokémon 2</h2>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            placeholder="Rechercher un Pokémon..."
                            value={search2}
                            onChange={(e) => setSearch2(e.target.value)}
                            className="search-input"
                        />
                        {search2 && filteredPokemons2.length > 0 && (
                            <div className="search-results">
                                {filteredPokemons2.map(p => (
                                    <div 
                                        key={p.id} 
                                        className="search-result-item"
                                        onClick={() => {
                                            setPokemon2(p);
                                            setSearch2('');
                                        }}
                                    >
                                        <img src={p.image} alt={p.name?.french} />
                                        <span>{p.name?.french}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {pokemon2 && (
                        <div className="selected-pokemon">
                            <img src={pokemon2.image} alt={pokemon2.name?.french} />
                            <h3>{pokemon2.name?.french}</h3>
                            <div className="pokemon-types">
                                {pokemon2.type?.map((t, i) => (
                                    <span key={i} className="type-badge">{t}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {pokemon1 && pokemon2 && (
                <div className="comparison-results">
                    <h2>📊 Comparaison des statistiques</h2>
                    
                    {/* Total */}
                    <div className="stat-comparison total-comparison">
                        <div className={`stat-value ${getWinner('total') === 1 ? 'winner' : ''}`}>
                            {getTotal(pokemon1)}
                        </div>
                        <div className="stat-name">TOTAL</div>
                        <div className={`stat-value ${getWinner('total') === 2 ? 'winner' : ''}`}>
                            {getTotal(pokemon2)}
                        </div>
                    </div>

                    {/* Stats individuelles */}
                    {['HP', 'Attack', 'Defense', 'SpecialAttack', 'SpecialDefense', 'Speed'].map(stat => {
                        const val1 = pokemon1.base?.[stat] || 0;
                        const val2 = pokemon2.base?.[stat] || 0;
                        const maxVal = Math.max(val1, val2);
                        const winner = getWinner(stat);

                        return (
                            <div key={stat} className="stat-comparison">
                                <div className={`stat-bar-wrapper left ${winner === 1 ? 'winner' : ''}`}>
                                    <span className="stat-value">{val1}</span>
                                    <div className="stat-bar">
                                        <div 
                                            className="stat-bar-fill"
                                            style={{width: `${(val1 / maxVal) * 100}%`}}
                                        ></div>
                                    </div>
                                </div>

                                <div className="stat-name">{stat}</div>

                                <div className={`stat-bar-wrapper right ${winner === 2 ? 'winner' : ''}`}>
                                    <div className="stat-bar">
                                        <div 
                                            className="stat-bar-fill"
                                            style={{width: `${(val2 / maxVal) * 100}%`}}
                                        ></div>
                                    </div>
                                    <span className="stat-value">{val2}</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Gagnant global */}
                    <div className="overall-winner">
                        {getTotal(pokemon1) > getTotal(pokemon2) ? (
                            <>
                                <div className="trophy">🏆</div>
                                <h3>{pokemon1.name?.french} gagne !</h3>
                                <p>Total: {getTotal(pokemon1)} vs {getTotal(pokemon2)}</p>
                            </>
                        ) : getTotal(pokemon2) > getTotal(pokemon1) ? (
                            <>
                                <div className="trophy">🏆</div>
                                <h3>{pokemon2.name?.french} gagne !</h3>
                                <p>Total: {getTotal(pokemon2)} vs {getTotal(pokemon1)}</p>
                            </>
                        ) : (
                            <>
                                <div className="trophy">🤝</div>
                                <h3>Égalité parfaite !</h3>
                                <p>Total: {getTotal(pokemon1)}</p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compare;
