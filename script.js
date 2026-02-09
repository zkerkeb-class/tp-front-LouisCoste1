const API_URL = "http://localhost:3000/pokemons";
let currentPage = 1;


if (document.getElementById('pokemon-list')) {
    loadPokemons(currentPage);
}

async function loadPokemons(page) {
    try {
        const res = await fetch(`${API_URL}?page=${page}`);
        const data = await res.json();
        
        const container = document.getElementById('pokemon-list');
        container.innerHTML = ""; 

        data.pokemons.forEach(poke => {
            const div = document.createElement('div');
            div.className = 'card';
    
            const name = poke.name.french || poke.name.english || "Sans nom";
            div.innerHTML = `
                <img src="${poke.image}" alt="${name}" style="width: 120px; height: 120px; object-fit: contain;">
                <h3>#${poke.id} ${name}</h3>
                <p>${poke.type.join(', ')}</p>
            `;
            
           
            div.onclick = () => window.location.href = `details.html?id=${poke.id}`;
            container.appendChild(div);
        });

        
        currentPage = data.currentPage;
        document.getElementById('pageIndicator').innerText = `Page ${currentPage} / ${data.totalPages}`;
        
    } catch (err) {
        console.error("Erreur chargement", err);
    }
}

function changePage(dir) {
    if (currentPage + dir > 0) loadPokemons(currentPage + dir);
}

async function searchPokemon() {
    const name = document.getElementById('searchInput').value;
    if (!name) return loadPokemons(1); 

    try {
        const res = await fetch(`${API_URL}/search?name=${name}`);
        if (res.ok) {
            const poke = await res.json();
           
            window.location.href = `details.html?id=${poke.id}`;
        } else {
            alert("Pokémon introuvable !");
        }
    } catch (err) {
        console.error(err);
    }
}

// --- FONCTIONS DETAILS / EDIT / DELETE ---

async function loadDetails(id) {
    const res = await fetch(`${API_URL}/${id}`);
    const poke = await res.json();

    document.getElementById('id').value = poke.id;
    document.getElementById('id').disabled = true;
    document.getElementById('nameFr').value = poke.name.french || "";
    document.getElementById('nameEn').value = poke.name.english || "";
    document.getElementById('type1').value = poke.type[0] || "";
    document.getElementById('type2').value = poke.type[1] || "";
}

async function savePokemon() {
    const isCreate = new URLSearchParams(window.location.search).get('create');
    

    const data = {
        id: parseInt(document.getElementById('id').value),
        name: {
            french: document.getElementById('nameFr').value,
            english: document.getElementById('nameEn').value
        },
        type: [
            document.getElementById('type1').value,
            document.getElementById('type2').value
        ].filter(t => t !== "") 
    };

    let url = API_URL;
    let method = "POST";


    if (!isCreate) {
        url = `${API_URL}/${data.id}`;
        method = "PUT";
    }

    const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Sauvegarde réussie !");
        window.location.href = "index.html";
    } else {
        alert("Erreur lors de la sauvegarde (Vérifiez si l'ID existe déjà)");
    }
}


function openModal() { document.getElementById('modal').style.display = 'flex'; }
function closeModal() { document.getElementById('modal').style.display = 'none'; }

async function confirmDelete() {
    const id = document.getElementById('id').value;
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    
    if (res.ok) {
        alert("Pokémon supprimé !");
        window.location.href = "index.html";
    } else {
        alert("Erreur lors de la suppression");
    }
}