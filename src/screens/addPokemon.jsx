import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import './addPokemon.css';

const AddPokemon = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        id: '',
        name: {
            french: '',
            english: '',
            japanese: '',
            chinese: ''
        },
        type: [],
        base: {
            HP: 45,
            Attack: 45,
            Defense: 45,
            SpecialAttack: 45,
            SpecialDefense: 45,
            Speed: 45
        },
        image: ''
    });

    const [typeInput, setTypeInput] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('name.')) {
            const lang = name.split('.')[1];
            setFormData({
                ...formData,
                name: {
                    ...formData.name,
                    [lang]: value
                }
            });
        } else if (name.startsWith('base.')) {
            const stat = name.split('.')[1];
            setFormData({
                ...formData,
                base: {
                    ...formData.base,
                    [stat]: parseInt(value) || 0
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleTypeChange = (e) => {
        setTypeInput(e.target.value);
    };

    const handleAddType = () => {
        if (typeInput.trim() && !formData.type.includes(typeInput.trim())) {
            setFormData({
                ...formData,
                type: [...formData.type, typeInput.trim()]
            });
            setTypeInput('');
        }
    };

    const handleRemoveType = (typeToRemove) => {
        setFormData({
            ...formData,
            type: formData.type.filter(t => t !== typeToRemove)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!formData.id || !formData.name.french || formData.type.length === 0 || !formData.image) {
            setError('Veuillez remplir tous les champs obligatoires (ID, nom français, au moins un type, et image)');
            setLoading(false);
            return;
        }

        try {
            console.log('📤 Envoi des données:', formData);
            
            const response = await fetch('http://localhost:3000/pokemons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    id: parseInt(formData.id)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ Erreur serveur:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to create pokemon');
            }

            const newPokemon = await response.json();
            console.log('✅ Pokémon créé avec succès!', newPokemon);
            alert('Pokémon créé avec succès !');
            navigate(`/pokemonDetails/${newPokemon.id}`);
        } catch (err) {
            console.error('❌ Erreur:', err);
            setError('Erreur lors de la création: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-pokemon-container">
            <div className="add-pokemon-header">
                <Link to="/" className="back-link">← Retour à la liste</Link>
                <h1>Ajouter un nouveau Pokémon</h1>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="add-pokemon-form">
                <div className="form-section">
                    <h2>Informations de base</h2>
                    
                    <div className="form-field">
                        <label htmlFor="id">ID du Pokémon *</label>
                        <input
                            type="number"
                            id="id"
                            name="id"
                            value={formData.id}
                            onChange={handleInputChange}
                            required
                            placeholder="Ex: 1001"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="image">URL de l'image *</label>
                        <input
                            type="text"
                            id="image"
                            name="image"
                            value={formData.image}
                            onChange={handleInputChange}
                            required
                            placeholder="https://example.com/image.png"
                        />
                        {formData.image && (
                            <div className="image-preview">
                                <img src={formData.image} alt="Preview" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Noms (dans différentes langues)</h2>
                    
                    <div className="form-field">
                        <label htmlFor="name.french">Nom Français *</label>
                        <input
                            type="text"
                            id="name.french"
                            name="name.french"
                            value={formData.name.french}
                            onChange={handleInputChange}
                            required
                            placeholder="Ex: Bulbizarre"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="name.english">Nom Anglais</label>
                        <input
                            type="text"
                            id="name.english"
                            name="name.english"
                            value={formData.name.english}
                            onChange={handleInputChange}
                            placeholder="Ex: Bulbasaur"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="name.japanese">Nom Japonais</label>
                        <input
                            type="text"
                            id="name.japanese"
                            name="name.japanese"
                            value={formData.name.japanese}
                            onChange={handleInputChange}
                            placeholder="Ex: フシギダネ"
                        />
                    </div>

                    <div className="form-field">
                        <label htmlFor="name.chinese">Nom Chinois</label>
                        <input
                            type="text"
                            id="name.chinese"
                            name="name.chinese"
                            value={formData.name.chinese}
                            onChange={handleInputChange}
                            placeholder="Ex: 妙蛙种子"
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Types *</h2>
                    
                    <div className="type-input-container">
                        <select 
                            value={typeInput}
                            onChange={handleTypeChange}
                            className="type-select"
                        >
                            <option value="">Sélectionner un type</option>
                            <option value="Normal">Normal</option>
                            <option value="Fire">Fire</option>
                            <option value="Water">Water</option>
                            <option value="Grass">Grass</option>
                            <option value="Electric">Electric</option>
                            <option value="Ice">Ice</option>
                            <option value="Fighting">Fighting</option>
                            <option value="Poison">Poison</option>
                            <option value="Ground">Ground</option>
                            <option value="Flying">Flying</option>
                            <option value="Psychic">Psychic</option>
                            <option value="Bug">Bug</option>
                            <option value="Rock">Rock</option>
                            <option value="Ghost">Ghost</option>
                            <option value="Dragon">Dragon</option>
                            <option value="Dark">Dark</option>
                            <option value="Steel">Steel</option>
                            <option value="Fairy">Fairy</option>
                        </select>
                        <button type="button" onClick={handleAddType} className="add-type-button">
                            Ajouter
                        </button>
                    </div>

                    <div className="types-display">
                        {formData.type.map((type, index) => (
                            <span key={index} className={`type-badge poke-type-${type.toLowerCase()}`}>
                                {type}
                                <button 
                                    type="button" 
                                    onClick={() => handleRemoveType(type)}
                                    className="remove-type"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Statistiques de base</h2>
                    
                    <div className="stats-grid">
                        <div className="form-field">
                            <label htmlFor="base.HP">HP</label>
                            <input
                                type="number"
                                id="base.HP"
                                name="base.HP"
                                value={formData.base.HP}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="base.Attack">Attaque</label>
                            <input
                                type="number"
                                id="base.Attack"
                                name="base.Attack"
                                value={formData.base.Attack}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="base.Defense">Défense</label>
                            <input
                                type="number"
                                id="base.Defense"
                                name="base.Defense"
                                value={formData.base.Defense}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="base.SpecialAttack">Attaque Spéciale</label>
                            <input
                                type="number"
                                id="base.SpecialAttack"
                                name="base.SpecialAttack"
                                value={formData.base.SpecialAttack}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="base.SpecialDefense">Défense Spéciale</label>
                            <input
                                type="number"
                                id="base.SpecialDefense"
                                name="base.SpecialDefense"
                                value={formData.base.SpecialDefense}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="base.Speed">Vitesse</label>
                            <input
                                type="number"
                                id="base.Speed"
                                name="base.Speed"
                                value={formData.base.Speed}
                                onChange={handleInputChange}
                                min="0"
                                max="255"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Création en cours...' : '✨ Créer le Pokémon'}
                    </button>
                    <Link to="/" className="cancel-link">
                        Annuler
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default AddPokemon;
