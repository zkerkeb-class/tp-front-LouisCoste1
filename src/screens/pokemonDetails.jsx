import { Link, useParams, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import './pokemonDetails.css';

const PokemonDetails = () => { 
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editedPokemon, setEditedPokemon] = useState(null);

    useEffect(() => {
        fetchPokemonDetails();
    }, [id]);

    const fetchPokemonDetails = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch pokemon details');
            }
            const data = await response.json();
            setPokemon(data);
            setEditedPokemon(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditedPokemon(pokemon);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('name.')) {
            const lang = name.split('.')[1];
            setEditedPokemon({
                ...editedPokemon,
                name: {
                    ...editedPokemon.name,
                    [lang]: value
                }
            });
        } else if (name.startsWith('base.')) {
            const stat = name.split('.')[1];
            setEditedPokemon({
                ...editedPokemon,
                base: {
                    ...editedPokemon.base,
                    [stat]: parseInt(value) || 0
                }
            });
        } else if (name === 'type') {
            setEditedPokemon({
                ...editedPokemon,
                type: value.split(',').map(t => t.trim())
            });
        } else {
            setEditedPokemon({
                ...editedPokemon,
                [name]: value
            });
        }
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editedPokemon)
            });

            if (!response.ok) {
                throw new Error('Failed to update pokemon');
            }

            const updatedPokemon = await response.json();
            setPokemon(updatedPokemon);
            setIsEditing(false);
            alert('Pokémon mis à jour avec succès !');
        } catch (err) {
            alert('Erreur lors de la mise à jour: ' + err.message);
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:3000/pokemons/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete pokemon');
            }

            alert('Pokémon supprimé avec succès !');
            navigate('/');
        } catch (err) {
            alert('Erreur lors de la suppression: ' + err.message);
        }
    };

    if (loading) {
        return <div className="loading">Chargement des détails du Pokémon...</div>;
    }

    if (error) {
        return <div className="error">Erreur: {error}</div>;
    }

    if (!pokemon) {
        return <div className="error">Pokémon non trouvé</div>;
    }

    return (
        <div className="pokemon-details-container">
            <div className="details-header">
                <Link to="/" className="back-link">← Retour à la liste</Link>
                <h1>Détails du Pokémon</h1>
            </div>

            <div className="details-content">
                <div className="details-image-section">
                    {isEditing ? (
                        <div className="edit-field">
                            <label>URL de l'image:</label>
                            <input
                                type="text"
                                name="image"
                                value={editedPokemon.image}
                                onChange={handleInputChange}
                            />
                        </div>
                    ) : null}
                    <img 
                        src={isEditing ? editedPokemon.image : pokemon.image} 
                        alt={pokemon.name?.french} 
                        className="details-image"
                    />
                </div>

                <div className="details-info-section">
                    <div className="info-card">
                        <h2>Informations générales</h2>
                        <div className="info-row">
                            <span className="info-label">ID:</span>
                            <span className="info-value">#{pokemon.id}</span>
                        </div>
                        
                        {isEditing ? (
                            <>
                                <div className="edit-field">
                                    <label>Nom (Français):</label>
                                    <input
                                        type="text"
                                        name="name.french"
                                        value={editedPokemon.name?.french || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Nom (Anglais):</label>
                                    <input
                                        type="text"
                                        name="name.english"
                                        value={editedPokemon.name?.english || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Nom (Japonais):</label>
                                    <input
                                        type="text"
                                        name="name.japanese"
                                        value={editedPokemon.name?.japanese || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Nom (Chinois):</label>
                                    <input
                                        type="text"
                                        name="name.chinese"
                                        value={editedPokemon.name?.chinese || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="info-row">
                                    <span className="info-label">Français:</span>
                                    <span className="info-value">{pokemon.name?.french}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Anglais:</span>
                                    <span className="info-value">{pokemon.name?.english}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Japonais:</span>
                                    <span className="info-value">{pokemon.name?.japanese}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Chinois:</span>
                                    <span className="info-value">{pokemon.name?.chinese}</span>
                                </div>
                            </>
                        )}

                        <div className="info-row">
                            <span className="info-label">Types:</span>
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="type"
                                    value={editedPokemon.type?.join(', ') || ''}
                                    onChange={handleInputChange}
                                    placeholder="Séparer par des virgules"
                                />
                            ) : (
                                <div className="types-container">
                                    {pokemon.type?.map((type, index) => (
                                        <span key={index} className={`type-badge poke-type-${type.toLowerCase()}`}>
                                            {type}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="info-card">
                        <h2>Statistiques de base</h2>
                        {isEditing ? (
                            <>
                                <div className="edit-field">
                                    <label>HP:</label>
                                    <input
                                        type="number"
                                        name="base.HP"
                                        value={editedPokemon.base?.HP || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Attaque:</label>
                                    <input
                                        type="number"
                                        name="base.Attack"
                                        value={editedPokemon.base?.Attack || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Défense:</label>
                                    <input
                                        type="number"
                                        name="base.Defense"
                                        value={editedPokemon.base?.Defense || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Attaque Spéciale:</label>
                                    <input
                                        type="number"
                                        name="base.SpecialAttack"
                                        value={editedPokemon.base?.SpecialAttack || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Défense Spéciale:</label>
                                    <input
                                        type="number"
                                        name="base.SpecialDefense"
                                        value={editedPokemon.base?.SpecialDefense || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="edit-field">
                                    <label>Vitesse:</label>
                                    <input
                                        type="number"
                                        name="base.Speed"
                                        value={editedPokemon.base?.Speed || 0}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="stat-bar">
                                    <span className="stat-label">HP</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.HP / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.HP}</span>
                                </div>
                                <div className="stat-bar">
                                    <span className="stat-label">Attaque</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.Attack / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.Attack}</span>
                                </div>
                                <div className="stat-bar">
                                    <span className="stat-label">Défense</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.Defense / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.Defense}</span>
                                </div>
                                <div className="stat-bar">
                                    <span className="stat-label">Att. Spé.</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.SpecialAttack / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.SpecialAttack}</span>
                                </div>
                                <div className="stat-bar">
                                    <span className="stat-label">Déf. Spé.</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.SpecialDefense / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.SpecialDefense}</span>
                                </div>
                                <div className="stat-bar">
                                    <span className="stat-label">Vitesse</span>
                                    <div className="stat-progress">
                                        <div className="stat-fill" style={{width: `${(pokemon.base?.Speed / 255) * 100}%`}}></div>
                                    </div>
                                    <span className="stat-value">{pokemon.base?.Speed}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="action-buttons">
                        {isEditing ? (
                            <>
                                <button className="save-button" onClick={handleSaveEdit}>
                                    💾 Enregistrer
                                </button>
                                <button className="cancel-button" onClick={handleCancelEdit}>
                                    ❌ Annuler
                                </button>
                            </>
                        ) : (
                            <>
                                <button className="edit-button" onClick={handleEdit}>
                                    ✏️ Modifier
                                </button>
                                <button className="delete-button" onClick={() => setShowDeleteModal(true)}>
                                    🗑️ Supprimer
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>⚠️ Confirmation de suppression</h2>
                        <p>Êtes-vous sûr de vouloir supprimer <strong>{pokemon.name?.french}</strong> ?</p>
                        <p className="modal-warning">Cette action est irréversible !</p>
                        <div className="modal-buttons">
                            <button className="confirm-delete-button" onClick={handleDelete}>
                                Oui, supprimer
                            </button>
                            <button className="cancel-delete-button" onClick={() => setShowDeleteModal(false)}>
                                Non, annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PokemonDetails;