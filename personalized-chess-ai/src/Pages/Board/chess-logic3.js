// Using dynamic import for Stockfish
import { Chess } from 'chess.js';

let stockfish = null;
let engineReady = false;
let currentElo = null;

export async function initializeEngine(botName = 'Bot 3', customElo = null) {
    if (stockfish) {
        stockfish.terminate();
    }
    
    engineReady = false;
    try {
        // Load Stockfish from the public folder
        stockfish = new Worker('/stockfish/stockfish.js');
        
        stockfish.onmessage = (event) => {
            const line = event.data;
            console.log('Stockfish:', line);
            
            if (line === 'uciok') {
                engineReady = true;
                let elo;
                if (customElo !== null) {
                    elo = customElo;
                } else {
                    const eloRatings = {
                        'Training Bot': 1500,
                        'Knight Fury': 500,
                        'Bishop Blitz': 1000,
                        'Queen Quest': 1250,
                        'King Crusher': 1500,
                        'Castling Conqueror': 1750,
                        'Pawnstorm': 2000,
                        'Checkmate Champ': 2250,
                        'Endgame Expert': 2500
                    };
                    elo = eloRatings[botName] || 1500;
                }
                
                currentElo = elo;
                console.log("Setting ELO to:", currentElo);
                
                // Initialize engine with minimal memory settings
                stockfish.postMessage('ucinewgame');
                stockfish.postMessage('setoption name UCI_LimitStrength value true');
                stockfish.postMessage(`setoption name UCI_Elo value ${Math.min(elo, 1500)}`); // Cap ELO for consistency
                stockfish.postMessage('setoption name Hash value 1');  // Minimum hash size
                stockfish.postMessage('setoption name Threads value 1');
                stockfish.postMessage('setoption name MultiPV value 1');
                
                // Configure skill levels with minimal settings
                let skillLevel;
                if (elo <= 500) {
                    skillLevel = 0;  // Lowest possible skill
                    stockfish.postMessage('setoption name Contempt value -200');
                } else if (elo <= 1000) {
                    skillLevel = 2;  // Very low skill
                    stockfish.postMessage('setoption name Contempt value -100');
                } else if (elo <= 1500) {
                    skillLevel = 5;  // Moderate skill
                    stockfish.postMessage('setoption name Contempt value -50');
                } else {
                    skillLevel = Math.min(20, Math.floor((elo - 1500) / 100) + 10);
                }
                
                stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
                console.log(`Bot: ${botName}, ELO: ${elo}, Skill Level: ${skillLevel}`);
                
                stockfish.postMessage('isready');
            }
        };
        
        stockfish.postMessage('uci');
    } catch (error) {
        console.error('Error initializing Stockfish:', error);
    }
}

export function getBestMove(fen, callback) {
    // Always reinitialize engine to maintain consistent play
    initializeEngine().then(() => {
        const checkReady = setInterval(() => {
            if (engineReady) {
                clearInterval(checkReady);
                makeRandomMove();
            }
        }, 100);
    });

    function makeRandomMove() {
        const chess = new Chess(fen);
        const moves = chess.moves({ verbose: true });
        
        // Increased random move probability for lower ELOs
        const randomThreshold = 
            currentElo <= 500 ? 0.60 :   // 60% chance of random moves
            currentElo <= 1000 ? 0.35 :  // 35% chance of random moves
            currentElo <= 1500 ? 0.15 :  // 15% chance of random moves
            0;

        if (Math.random() < randomThreshold) {
            const randomMove = moves[Math.floor(Math.random() * moves.length)].san;
            console.log(`Making random move (${currentElo} ELO):`, randomMove);
            callback(randomMove);
            return;
        }

        // Simplified engine move logic
        const listener = (e) => {
            const line = e.data;
            if (line.startsWith('bestmove')) {
                const move = line.split(' ')[1];
                stockfish.removeEventListener('message', listener);
                callback(move);
            }
        };

        stockfish.addEventListener('message', listener);
        stockfish.postMessage('position fen ' + fen);
        
        // Reduced think times for lower ELOs
        const thinkTime = 
            currentElo <= 500 ? 100 :   // Very quick decisions
            currentElo <= 1000 ? 200 :  // Quick decisions
            currentElo <= 1500 ? 300 :  // Moderate thinking
            500;                        // Full thinking time
        
        stockfish.postMessage(`go movetime ${thinkTime}`);
    }
}

export function findBestMove(chess) {
    return new Promise((resolve) => {
        getBestMove(chess.fen(), (move) => {
            resolve(move);
        });
    });
}

export function stopEngine() {
    if (stockfish) {
        stockfish.postMessage('quit');
        stockfish.terminate();
        stockfish = null;
        engineReady = false;
    }
}

// Function to evaluate position (returns score in centipawns)
export function evaluatePosition(fen, callback) {
    if (!stockfish) {
        initializeEngine();
    }

    const listener = (e) => {
        const line = e.data;
        if (line.includes('score cp')) {
            const score = parseInt(line.split('score cp ')[1].split(' ')[0]);
            stockfish.removeEventListener('message', listener);
            callback(score);
        }
    };

    stockfish.addEventListener('message', listener);
    stockfish.postMessage('position fen ' + fen);
    stockfish.postMessage('go depth 5');
}

// Clean up when component unmounts
export function cleanup() {
    stopEngine();
}