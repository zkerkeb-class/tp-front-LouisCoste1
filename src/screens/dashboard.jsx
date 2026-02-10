import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import './dashboard.css';

const Dashboard = () => {
    const [allPokemons, setAllPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchAllPokemons();
    }, []);

    const fetchAllPokemons = async () => {
        try {
            // Récupérer tous les Pokémon (on va chercher toutes les pages)
            const response = await fetch('http://localhost:3000/pokemons?page=1');
            const data = await response.json();
            const totalPages = data.totalPages;
            
            let allPokes = [...data.pokemons];
            
            // Récupérer toutes les autres pages
            for (let page = 2; page <= totalPages; page++) {
                const res = await fetch(`http://localhost:3000/pokemons?page=${page}`);
                const pageData = await res.json();
                allPokes = [...allPokes, ...pageData.pokemons];
            }
            
            setAllPokemons(allPokes);
            calculateStats(allPokes);
            setLoading(false);
        } catch (error) {
            console.error('Erreur:', error);
            setLoading(false);
        }
    };

    const calculateStats = (pokemons) => {
        // Stats par type
        const typeCount = {};
        pokemons.forEach(p => {
            p.type?.forEach(t => {
                typeCount[t] = (typeCount[t] || 0) + 1;
            });
        });

        // Pokémon le plus fort (total des stats)
        const strongest = pokemons.reduce((max, p) => {
            const total = Object.values(p.base || {}).reduce((sum, val) => sum + val, 0);
            const maxTotal = Object.values(max.base || {}).reduce((sum, val) => sum + val, 0);
            return total > maxTotal ? p : max;
        }, pokemons[0]);

        // Moyennes des stats
        const avgStats = {
            HP: 0, Attack: 0, Defense: 0, SpecialAttack: 0, SpecialDefense: 0, Speed: 0
        };
        
        pokemons.forEach(p => {
            Object.keys(avgStats).forEach(stat => {
                avgStats[stat] += (p.base?.[stat] || 0);
            });
        });
        
        Object.keys(avgStats).forEach(stat => {
            avgStats[stat] = Math.round(avgStats[stat] / pokemons.length);
        });

        // Top 5 par stat
        const topHP = [...pokemons].sort((a, b) => (b.base?.HP || 0) - (a.base?.HP || 0)).slice(0, 5);
        const topAttack = [...pokemons].sort((a, b) => (b.base?.Attack || 0) - (a.base?.Attack || 0)).slice(0, 5);
        const topSpeed = [...pokemons].sort((a, b) => (b.base?.Speed || 0) - (a.base?.Speed || 0)).slice(0, 5);

        setStats({
            total: pokemons.length,
            typeCount,
            strongest,
            avgStats,
            topHP,
            topAttack,
            topSpeed
        });
    };

    if (loading) {
        return <div className="loading">📊 Analyse des données du Pokédex...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <Link to="/" className="back-link">← Retour</Link>
                <h1>📊 Dashboard Pokédex</h1>
                <p className="subtitle">Analyse complète de {stats?.total} Pokémon</p>
            </div>

            <div className="stats-grid">
                {/* Total Pokémon */}
                <div className="stat-card total-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-number">{stats?.total}</div>
                    <div className="stat-label">Pokémon Total</div>
                </div>

                {/* Pokémon le plus fort */}
                <div className="stat-card strongest-card">
                    <div className="stat-icon">💪</div>
                    <div className="stat-content">
                        <img src={stats?.strongest?.image} alt={stats?.strongest?.name?.french} className="strongest-img" />
                        <div className="strongest-info">
                            <h3>{stats?.strongest?.name?.french}</h3>
                            <p>Total: {Object.values(stats?.strongest?.base || {}).reduce((sum, val) => sum + val, 0)}</p>
                        </div>
                    </div>
                    <div className="stat-label">Le Plus Puissant</div>
                </div>

                {/* Moyennes */}
                <div className="stat-card avg-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-label">Statistiques Moyennes</div>
                    <div className="avg-stats">
                        {Object.entries(stats?.avgStats || {}).map(([stat, value]) => (
                            <div key={stat} className="avg-stat-row">
                                <span className="avg-stat-name">{stat}</span>
                                <div className="avg-stat-bar">
                                    <div className="avg-stat-fill" style={{width: `${(value / 255) * 100}%`}}></div>
                                </div>
                                <span className="avg-stat-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Distribution par type */}
            <div className="type-distribution">
                <h2>🎨 Distribution par Type</h2>
                <div className="type-bars">
                    {Object.entries(stats?.typeCount || {}).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                        <div key={type} className="type-bar-container">
                            <span className="type-bar-label">{type}</span>
                            <div className="type-bar">
                                <div 
                                    className="type-bar-fill" 
                                    style={{
                                        width: `${(count / stats.total) * 100}%`,
                                        background: getTypeGradient(type)
                                    }}
                                >
                                    <span className="type-bar-count">{count}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top 5 */}
            <div className="top-rankings">
                <div className="top-section">
                    <h2>❤️ Top 5 HP</h2>
                    <div className="top-list">
                        {stats?.topHP?.map((p, index) => (
                            <Link key={p.id} to={`/pokemonDetails/${p.id}`} className="top-item">
                                <span className="top-rank">#{index + 1}</span>
                                <img src={p.image} alt={p.name?.french} className="top-img" />
                                <span className="top-name">{p.name?.french}</span>
                                <span className="top-value">{p.base?.HP}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="top-section">
                    <h2>⚔️ Top 5 Attaque</h2>
                    <div className="top-list">
                        {stats?.topAttack?.map((p, index) => (
                            <Link key={p.id} to={`/pokemonDetails/${p.id}`} className="top-item">
                                <span className="top-rank">#{index + 1}</span>
                                <img src={p.image} alt={p.name?.french} className="top-img" />
                                <span className="top-name">{p.name?.french}</span>
                                <span className="top-value">{p.base?.Attack}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="top-section">
                    <h2>⚡ Top 5 Vitesse</h2>
                    <div className="top-list">
                        {stats?.topSpeed?.map((p, index) => (
                            <Link key={p.id} to={`/pokemonDetails/${p.id}`} className="top-item">
                                <span className="top-rank">#{index + 1}</span>
                                <img src={p.image} alt={p.name?.french} className="top-img" />
                                <span className="top-name">{p.name?.french}</span>
                                <span className="top-value">{p.base?.Speed}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getTypeGradient = (type) => {
    const gradients = {
        Grass: 'linear-gradient(135deg, #56ab2f, #a8e063)',
        Fire: 'linear-gradient(135deg, #f12711, #f5af19)',
        Water: 'linear-gradient(135deg, #00c6ff, #0072ff)',
        Bug: 'linear-gradient(135deg, #a8ff78, #78ffd6)',
        Normal: 'linear-gradient(135deg, #D3CCE3, #E9E4F0)',
        Poison: 'linear-gradient(135deg, #834d9b, #d04ed6)',
        Electric: 'linear-gradient(135deg, #FDC830, #F37335)',
        Ground: 'linear-gradient(135deg, #ba8b02, #181818)',
        Fairy: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
        Fighting: 'linear-gradient(135deg, #c0392b, #8e44ad)',
        Psychic: 'linear-gradient(135deg, #ec008c, #fc6767)',
        Rock: 'linear-gradient(135deg, #808080, #3fada8)',
        Ghost: 'linear-gradient(135deg, #4b6cb7, #182848)',
        Ice: 'linear-gradient(135deg, #7F7FD5, #91EAE4)',
        Dragon: 'linear-gradient(135deg, #333399, #ff00cc)',
        Steel: 'linear-gradient(135deg, #B8B8D0, #585858)',
        Dark: 'linear-gradient(135deg, #705848, #2c1e14)',
        Flying: 'linear-gradient(135deg, #A890F0, #6d5acd)',
    };
    return gradients[type] || 'linear-gradient(135deg, #2c3e50, #bdc3c7)';
};

export default Dashboard;
