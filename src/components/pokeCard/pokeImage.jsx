const PokeImage = ({ imageUrl }) => {
    const handleImageError = (e) => {
        e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png';
    };

    return (    
        <img 
            src={imageUrl} 
            alt="Pokémon" 
            className="poke-img-3d"
            onError={handleImageError}
        />
    );
};

export default PokeImage;