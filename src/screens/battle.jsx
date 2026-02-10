import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router';
import './battle.css';
import './battle-additions.css';

const API_URL = 'http://localhost:3000';

function Battle() {
  const location = useLocation();
  const navigate = useNavigate();
  const { pokemon1, pokemon2, isAI, playerTeam, enemyTeam } = location.state || {};
  
  const [battleState, setBattleState] = useState(null);
  const [selectedMove, setSelectedMove] = useState(null);
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [showEvolution, setShowEvolution] = useState(false);
  const [evolutionData, setEvolutionData] = useState(null);
  const [particles, setParticles] = useState([]);
  const [playerTeamState, setPlayerTeamState] = useState(playerTeam || [pokemon1]);
  const [enemyTeamState, setEnemyTeamState] = useState(enemyTeam || [pokemon2]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [showMovePreview, setShowMovePreview] = useState(null);
  const [showSwitch, setShowSwitch] = useState(false);
  const [battleFinished, setBattleFinished] = useState(false);
  const logRef = useRef(null);

  useEffect(() => {
    if ((!pokemon1 || !pokemon2) && (!playerTeam || !enemyTeam)) {
      navigate('/');
      return;
    }
    initBattle();
  }, []);

  useEffect(() => {
    // Quand un Pokémon meurt, passer au suivant
    if (battleState && battleState.winner) {
      handlePokemonFainted();
    }
  }, [battleState]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [log]);

  const initBattle = async () => {
    try {
      const currentPlayer = playerTeamState[currentPlayerIndex];
      const currentEnemy = enemyTeamState[currentEnemyIndex];
      
      const res = await fetch(`${API_URL}/battle/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pokemon1Id: currentPlayer.id, 
          pokemon2Id: currentEnemy.id 
        })
      });
      const data = await res.json();
      setBattleState(data);
      addLog(`⚔️ ${currentPlayer.name.french} VS ${currentEnemy.name.french} !`, 'system');
      
      if (playerTeamState.length > 1) {
        addLog(`Votre équipe : ${playerTeamState.map(p => p.name.french).join(', ')}`, 'info');
      }
      if (enemyTeamState.length > 1) {
        addLog(`Équipe adverse : ${enemyTeamState.map(p => p.name.french).join(', ')}`, 'info');
      }
    } catch (error) {
      console.error('Error initializing battle:', error);
    }
  };

  const handlePokemonFainted = () => {
    if (!battleState || !battleState.winner) return;

    const playerFainted = battleState.winner === 2;
    const enemyFainted = battleState.winner === 1;

    if (playerFainted) {
      // Marquer le Pokémon du joueur comme KO
      setPlayerTeamState(prev => {
        const newTeam = [...prev];
        newTeam[currentPlayerIndex] = {
          ...newTeam[currentPlayerIndex],
          currentHP: 0,
          maxHP: battleState.pokemon1.maxHP
        };
        return newTeam;
      });

      // Le Pokémon du joueur est KO
      // Trouver le prochain Pokémon vivant
      let nextIndex = -1;
      for (let i = 0; i < playerTeamState.length; i++) {
        const pokemon = playerTeamState[i];
        const isAlive = pokemon.currentHP === undefined || pokemon.currentHP > 0;
        if (i !== currentPlayerIndex && isAlive) {
          nextIndex = i;
          break;
        }
      }
      
      if (nextIndex !== -1) {
        addLog(`${playerTeamState[currentPlayerIndex].name.french} est K.O. !`, 'defeat');
        addLog(`${playerTeamState[nextIndex].name.french}, à toi de jouer !`, 'system');
        setCurrentPlayerIndex(nextIndex);
        setTimeout(() => {
          initNewRound(nextIndex, currentEnemyIndex);
        }, 2000);
      } else {
        // Toute l'équipe du joueur est KO
        addLog(`Toute votre équipe est K.O. Vous avez perdu...`, 'defeat');
        setBattleFinished(true);
      }
    } else if (enemyFainted) {
      // Marquer le Pokémon ennemi comme KO
      setEnemyTeamState(prev => {
        const newTeam = [...prev];
        newTeam[currentEnemyIndex] = {
          ...newTeam[currentEnemyIndex],
          currentHP: 0,
          maxHP: battleState.pokemon2.maxHP
        };
        return newTeam;
      });

      // Le Pokémon ennemi est KO
      // Trouver le prochain Pokémon ennemi vivant
      let nextIndex = -1;
      for (let i = 0; i < enemyTeamState.length; i++) {
        const pokemon = enemyTeamState[i];
        const isAlive = pokemon.currentHP === undefined || pokemon.currentHP > 0;
        if (i !== currentEnemyIndex && isAlive) {
          nextIndex = i;
          break;
        }
      }
      
      if (nextIndex !== -1) {
        addLog(`${enemyTeamState[currentEnemyIndex].name.french} adverse est K.O. !`, 'victory');
        addLog(`L'adversaire envoie ${enemyTeamState[nextIndex].name.french} !`, 'system');
        setCurrentEnemyIndex(nextIndex);
        setTimeout(() => {
          initNewRound(currentPlayerIndex, nextIndex);
        }, 2000);
      } else {
        // Toute l'équipe ennemie est KO
        addLog(`🏆 VICTOIRE ! Vous avez vaincu toute l'équipe adverse !`, 'victory');
        createParticles(100, '#00ff00', 50, 50);
        setBattleFinished(true);
      }
    }
  };

  const initNewRound = async (playerIdx, enemyIdx) => {
    try {
      const currentPlayer = playerTeamState[playerIdx];
      const currentEnemy = enemyTeamState[enemyIdx];
      
      // Vérification de sécurité : ne jamais lancer un combat avec un Pokémon mort
      if (currentPlayer.currentHP !== undefined && currentPlayer.currentHP <= 0) {
        console.error('Erreur: tentative de combat avec un Pokémon joueur K.O.');
        addLog('Erreur: Pokémon K.O. sélectionné!', 'defeat');
        return;
      }
      if (currentEnemy.currentHP !== undefined && currentEnemy.currentHP <= 0) {
        console.error('Erreur: tentative de combat avec un Pokémon ennemi K.O.');
        return;
      }
      
      const res = await fetch(`${API_URL}/battle/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          pokemon1Id: currentPlayer.id, 
          pokemon2Id: currentEnemy.id 
        })
      });
      const data = await res.json();
      
      // Restaurer les HP ET moves sauvegardés si le Pokémon a déjà combattu
      if (currentPlayer.currentHP !== undefined) {
        data.pokemon1.currentHP = currentPlayer.currentHP;
        data.pokemon1.maxHP = currentPlayer.maxHP;
      }
      if (currentPlayer.moves) {
        data.pokemon1.moves = currentPlayer.moves;
      }
      if (currentEnemy.currentHP !== undefined) {
        data.pokemon2.currentHP = currentEnemy.currentHP;
        data.pokemon2.maxHP = currentEnemy.maxHP;
      }
      if (currentEnemy.moves) {
        data.pokemon2.moves = currentEnemy.moves;
      }
      
      setBattleState(data);
      setIsPlayerTurn(true);
    } catch (error) {
      console.error('Error starting new round:', error);
    }
  };

  const switchPokemon = (newIndex) => {
    if (newIndex === currentPlayerIndex) {
      addLog(`${playerTeamState[newIndex].name.french} est déjà au combat !`, 'info');
      setShowSwitch(false);
      return;
    }

    // Vérifier que le Pokémon sélectionné est vivant
    const selectedPokemon = playerTeamState[newIndex];
    if (selectedPokemon.currentHP !== undefined && selectedPokemon.currentHP <= 0) {
      addLog(`${selectedPokemon.name.french} est K.O. ! Choisissez un autre Pokémon.`, 'defeat');
      return;
    }

    // Sauvegarder les HP du Pokémon actuel avant de le retirer
    if (battleState) {
      setPlayerTeamState(prev => {
        const newTeam = [...prev];
        newTeam[currentPlayerIndex] = {
          ...newTeam[currentPlayerIndex],
          currentHP: battleState.pokemon1.currentHP,
          maxHP: battleState.pokemon1.maxHP
        };
        return newTeam;
      });
    }

    const oldPokemon = playerTeamState[currentPlayerIndex];
    const newPokemon = playerTeamState[newIndex];
    
    addLog(`Reviens, ${oldPokemon.name.french} !`, 'info');
    addLog(`${newPokemon.name.french}, à toi de jouer !`, 'system');
    
    setCurrentPlayerIndex(newIndex);
    setShowSwitch(false);
    
    setTimeout(() => {
      initNewRound(newIndex, currentEnemyIndex);
    }, 1000);
  };

  const addLog = (message, type = 'info') => {
    setLog(prev => {
      const newLog = [...prev, { message, type, timestamp: Date.now() }];
      // Garder seulement les 10 derniers messages pour éviter le débordement
      return newLog.slice(-10);
    });
  };

  const createParticles = (count, color, x, y) => {
    const newParticles = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: Math.random(),
        x: x || Math.random() * 100,
        y: y || Math.random() * 100,
        color,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1000);
  };

  const executeTurn = async (moveKey) => {
    if (!isPlayerTurn || !battleState || battleState.winner) return;

    setSelectedMove(moveKey);
    setIsPlayerTurn(false);
    setShowMovePreview(null);

    try {
      const endpoint = isAI ? '/battle/ai-turn' : '/battle/turn';
      const body = isAI 
        ? { battleState, playerMove: moveKey }
        : { battleState, move1: moveKey, move2: battleState.pokemon2.moves[0] };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      // Afficher les logs de combat avec plus de détails
      const newLogs = data.log.slice(battleState.log.length);
      newLogs.forEach(logEntry => {
        let message = `${logEntry.attacker} utilise ${logEntry.move} !`;
        
        if (logEntry.missed) {
          message += ' ❌ Mais ça rate !';
          addLog(message, 'miss');
        } else {
          let effectMsg = '';
          if (logEntry.critical) {
            effectMsg += ' 💥 Coup critique !';
          }
          if (logEntry.effectiveness > 1) {
            effectMsg += ' ⚡ C\'est super efficace !';
          } else if (logEntry.effectiveness < 1 && logEntry.effectiveness > 0) {
            effectMsg += ' 💨 Ce n\'est pas très efficace...';
          } else if (logEntry.effectiveness === 0) {
            effectMsg += ' 🚫 Ça n\'a aucun effet...';
          }
          
          message += effectMsg + ` (💔 ${logEntry.damage} dégâts)`;
          addLog(message, logEntry.effectiveness > 1 ? 'superEffective' : 'normal');
          
          // Particules selon l'efficacité
          const color = logEntry.critical ? '#ff0000' : logEntry.effectiveness > 1 ? '#ff4444' : '#ffaa00';
          createParticles(logEntry.critical ? 30 : 20, color, 50, 50);
        }
      });

      // Sauvegarder les HP actuels dans les états d'équipe
      if (data.pokemon1.currentHP >= 0) {
        setPlayerTeamState(prev => {
          const newTeam = [...prev];
          newTeam[currentPlayerIndex] = {
            ...newTeam[currentPlayerIndex],
            currentHP: data.pokemon1.currentHP,
            maxHP: data.pokemon1.maxHP,
            moves: data.pokemon1.moves // Sauvegarder aussi les moves
          };
          return newTeam;
        });
      }
      if (data.pokemon2.currentHP >= 0) {
        setEnemyTeamState(prev => {
          const newTeam = [...prev];
          newTeam[currentEnemyIndex] = {
            ...newTeam[currentEnemyIndex],
            currentHP: data.pokemon2.currentHP,
            maxHP: data.pokemon2.maxHP,
            moves: data.pokemon2.moves // Sauvegarder aussi les moves
          };
          return newTeam;
        });
      }

      setBattleState(data);

      // Vérifier la fin du combat uniquement si vraiment terminé
      if (data.winner && (data.pokemon1.currentHP === 0 || data.pokemon2.currentHP === 0)) {
        const winner = data.winner === 1 ? playerTeamState[currentPlayerIndex] : enemyTeamState[currentEnemyIndex];
        const loser = data.winner === 1 ? enemyTeamState[currentEnemyIndex] : playerTeamState[currentPlayerIndex];
        
        // Gagner de l'XP et enregistrer seulement si le combat global est fini
        if (data.winner === 1 && currentEnemyIndex === enemyTeamState.length - 1) {
          const expGained = Math.floor(loser.level * 100);
          addLog(`${winner.name.french} gagne ${expGained} points d'expérience !`, 'exp');
          
          await fetch(`${API_URL}/pokemon/${winner.id}/gain-exp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expGained })
          });

          await fetch(`${API_URL}/pokemon/${winner.id}/battle-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ won: true })
          });

          checkEvolution(winner.id);
        }

        if (currentPlayerIndex === playerTeamState.length - 1 && data.winner === 2) {
          await fetch(`${API_URL}/pokemon/${loser.id}/battle-result`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ won: false })
          });
        }
      } else {
        setTimeout(() => setIsPlayerTurn(true), 1500);
      }
    } catch (error) {
      console.error('Error executing turn:', error);
      setIsPlayerTurn(true);
    }
  };

  const calculateDamagePreview = (moveKey) => {
    if (!battleState) return null;
    
    // Estimation simple des dégâts
    const move = battleState.pokemon1.moves?.includes(moveKey);
    if (!move) return null;

    // Retourner une estimation basique
    return {
      min: Math.floor(battleState.pokemon1.base.Attack * 0.3),
      max: Math.floor(battleState.pokemon1.base.Attack * 0.7),
    };
  };

  const checkEvolution = async (pokemonId) => {
    try {
      const res = await fetch(`${API_URL}/pokemon/${pokemonId}/can-evolve`);
      const data = await res.json();
      
      if (data.canEvolve) {
        const currentPokemon = playerTeamState[currentPlayerIndex];
        setEvolutionData({ pokemonId, evolution: data.evolution });
        setShowEvolution(true);
        addLog(`Quoi ? ${currentPokemon.name.french} évolue !`, 'evolution');
      }
    } catch (error) {
      console.error('Error checking evolution:', error);
    }
  };

  const evolve = async () => {
    if (!evolutionData) return;
    
    try {
      await fetch(`${API_URL}/pokemon/${evolutionData.pokemonId}/evolve`, {
        method: 'POST'
      });
      
      const currentPokemon = playerTeamState[currentPlayerIndex];
      addLog(`Félicitations ! Votre ${currentPokemon.name.french} a évolué en ${evolutionData.evolution.name.french} !`, 'evolution');
      setShowEvolution(false);
      createParticles(100, '#ffff00', 50, 50);
    } catch (error) {
      console.error('Error evolving:', error);
    }
  };

  if (!battleState) {
    return (
      <div className="battle-loading">
        <div className="pokeball-loader"></div>
        <p>Chargement du combat...</p>
      </div>
    );
  }

  const { pokemon1: p1, pokemon2: p2, winner } = battleState;
  const hpPercent1 = (p1.currentHP / p1.maxHP) * 100;
  const hpPercent2 = (p2.currentHP / p2.maxHP) * 100;

  return (
    <div className="battle-arena">
      {/* Fond animé */}
      <div className="battle-background">
        <div className="bg-layer layer1"></div>
        <div className="bg-layer layer2"></div>
        <div className="bg-layer layer3"></div>
      </div>

      {/* Particules */}
      {particles.map(p => (
        <div 
          key={p.id}
          className="particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            '--vx': p.vx,
            '--vy': p.vy,
          }}
        />
      ))}

      {/* Pokemon du joueur */}
      <div className="pokemon-container player-side">
        <div className={`pokemon-sprite ${p1.currentHP === 0 ? 'fainted' : ''} ${isPlayerTurn ? 'active' : ''}`}>
          <img 
            src={p1.image} 
            alt={p1.name.french}
            className="pokemon-image"
          />
          {p1.shiny && <div className="shiny-sparkle">✨</div>}
        </div>
        <div className="pokemon-status">
          <div className="pokemon-name">{p1.name.french}</div>
          <div className="level-badge">Niv. {p1.level}</div>
          <div className="hp-bar-container">
            <div className="hp-label">HP</div>
            <div className="hp-bar-outer">
              <div 
                className={`hp-bar-inner ${hpPercent1 <= 20 ? 'critical' : hpPercent1 <= 50 ? 'warning' : ''}`}
                style={{ width: `${hpPercent1}%` }}
              >
                <div className="hp-shine"></div>
              </div>
            </div>
            <div className="hp-text">{p1.currentHP} / {p1.maxHP}</div>
          </div>
          {/* Indicateur d'équipe */}
          {playerTeamState.length > 1 && (
            <div className="team-indicator">
              {playerTeamState.map((poke, idx) => {
                const isActive = idx === currentPlayerIndex;
                const isFainted = poke.currentHP !== undefined && poke.currentHP <= 0;
                return (
                  <div 
                    key={idx} 
                    className={`team-ball ${isActive ? 'active' : ''} ${isFainted ? 'fainted' : ''}`}
                    title={poke.name.french}
                  >
                    {isFainted ? '💀' : '●'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pokemon ennemi */}
      <div className="pokemon-container enemy-side">
        <div className={`pokemon-sprite ${p2.currentHP === 0 ? 'fainted' : ''} ${!isPlayerTurn && !winner ? 'active' : ''}`}>
          <img 
            src={p2.image} 
            alt={p2.name.french}
            className="pokemon-image"
          />
          {p2.shiny && <div className="shiny-sparkle">✨</div>}
        </div>
        <div className="pokemon-status">
          <div className="pokemon-name">{p2.name.french}</div>
          <div className="level-badge">Niv. {p2.level}</div>
          <div className="hp-bar-container">
            <div className="hp-label">HP</div>
            <div className="hp-bar-outer">
              <div 
                className={`hp-bar-inner ${hpPercent2 <= 20 ? 'critical' : hpPercent2 <= 50 ? 'warning' : ''}`}
                style={{ width: `${hpPercent2}%` }}
              >
                <div className="hp-shine"></div>
              </div>
            </div>
            <div className="hp-text">{p2.currentHP} / {p2.maxHP}</div>
          </div>
          {/* Indicateur d'équipe ennemie */}
          {enemyTeamState.length > 1 && (
            <div className="team-indicator">
              {enemyTeamState.map((poke, idx) => {
                const isActive = idx === currentEnemyIndex;
                const isFainted = poke.currentHP !== undefined && poke.currentHP <= 0;
                return (
                  <div 
                    key={idx} 
                    className={`team-ball ${isActive ? 'active' : ''} ${isFainted ? 'fainted' : ''}`}
                    title={poke.name.french}
                  >
                    {isFainted ? '💀' : '●'}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Interface de combat */}
      <div className="battle-ui">
        {/* Log de combat */}
        <div className="battle-log" ref={logRef}>
          {log.map((entry, index) => (
            <div key={index} className={`log-entry ${entry.type}`}>
              {entry.message}
            </div>
          ))}
        </div>

        {/* Actions */}
        {!battleFinished ? (
          <div className="battle-actions">
            <div className="action-buttons-row">
              <h3>Que doit faire {p1.name.french} ?</h3>
              {playerTeamState.length > 1 && (
                <button 
                  className="switch-button"
                  onClick={() => setShowSwitch(!showSwitch)}
                  disabled={!isPlayerTurn}
                >
                  🔄 Changer
                </button>
              )}
            </div>

            {showSwitch ? (
              <div className="switch-menu">
                <h4>Choisir un Pokémon :</h4>
                <div className="switch-grid">
                  {playerTeamState.map((poke, idx) => {
                    const isCurrent = idx === currentPlayerIndex;
                    const isFainted = poke.currentHP !== undefined && poke.currentHP <= 0;
                    return (
                      <button
                        key={idx}
                        className={`switch-card ${isCurrent ? 'current' : ''} ${isFainted ? 'fainted' : ''}`}
                        onClick={() => !isCurrent && !isFainted && switchPokemon(idx)}
                        disabled={isCurrent || isFainted}
                      >
                        <img src={poke.image} alt={poke.name.french} />
                        <div className="switch-name">{poke.name.french}</div>
                        <div className="switch-level">Niv. {poke.level}</div>
                        {poke.currentHP !== undefined && (
                          <div className="switch-hp">{poke.currentHP}/{poke.maxHP} HP</div>
                        )}
                        {isCurrent && <div className="current-badge">En combat</div>}
                        {isFainted && <div className="ko-badge">K.O.</div>}
                      </button>
                    );
                  })}
                </div>
                <button className="cancel-switch" onClick={() => setShowSwitch(false)}>
                  ← Retour
                </button>
              </div>
            ) : (
              <>
                <div className="moves-grid">
                  {p1.moves?.map((moveKey, index) => (
                    <button
                      key={index}
                      className={`move-button ${selectedMove === moveKey ? 'selected' : ''}`}
                      onClick={() => executeTurn(moveKey)}
                      onMouseEnter={() => setShowMovePreview(moveKey)}
                      onMouseLeave={() => setShowMovePreview(null)}
                      disabled={!isPlayerTurn}
                    >
                      <div className="move-name">{moveKey}</div>
                      {showMovePreview === moveKey && (
                        <div className="move-tooltip">
                          Attaque de type {moveKey.includes('fire') || moveKey.includes('flame') ? '🔥' : 
                                         moveKey.includes('water') || moveKey.includes('hydro') ? '💧' :
                                         moveKey.includes('thunder') || moveKey.includes('electric') ? '⚡' :
                                         moveKey.includes('vine') || moveKey.includes('razor') || moveKey.includes('solar') ? '🌿' : '⭐'}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {!isPlayerTurn && <div className="turn-indicator">⏳ Tour de l'adversaire...</div>}
              </>
            )}
          </div>
        ) : (
          <div className="battle-end">
            <h2 className="victory-text">
              {battleState && battleState.winner === 1 ? '🏆 VICTOIRE !' : '💀 DÉFAITE...'}
            </h2>
            <Link to="/" className="return-button">
              Retour au Pokédex
            </Link>
          </div>
        )}
      </div>

      {/* Popup d'évolution */}
      {showEvolution && evolutionData && (
        <div className="evolution-popup">
          <div className="evolution-content">
            <h2>✨ ÉVOLUTION ! ✨</h2>
            <p>Votre {playerTeamState[currentPlayerIndex].name.french} peut évoluer en {evolutionData.evolution.name.french} !</p>
            <div className="evolution-preview">
              <img src={playerTeamState[currentPlayerIndex].image} alt={playerTeamState[currentPlayerIndex].name.french} />
              <div className="evolution-arrow">→</div>
              <img src={evolutionData.evolution.image} alt={evolutionData.evolution.name.french} />
            </div>
            <div className="evolution-buttons">
              <button className="evolve-button" onClick={evolve}>
                Faire évoluer !
              </button>
              <button className="cancel-button" onClick={() => setShowEvolution(false)}>
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Battle;
