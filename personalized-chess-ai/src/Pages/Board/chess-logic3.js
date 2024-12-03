// Using dynamic import for Stockfish
let stockfish = null;
let engineReady = false;

export async function initializeEngine(botName = 'Bot 3', customElo = null) {
    if (stockfish) {
        stockfish.terminate();
    }
    try {
        // Load Stockfish from the public folder
        stockfish = new Worker('/stockfish/stockfish.js');
        
        stockfish.onmessage = (event) => {
            const line = event.data;
            console.log('Stockfish:', line); // Log all Stockfish messages
            
            if (line === 'uciok') {
                engineReady = true;
                // Configure Stockfish based on bot name or custom ELO
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
                
                // Ensure proper initialization sequence
                stockfish.postMessage('ucinewgame');
                stockfish.postMessage('setoption name UCI_LimitStrength value true');
                stockfish.postMessage(`setoption name UCI_Elo value ${elo}`);
                
                // Set very low skill level for low rated bots
                let skillLevel;
                if (elo < 500) {
                    skillLevel = 0;
                } else if (elo < 1000) {
                    skillLevel = Math.floor((elo - 500) / 250); // Even more gradual increase
                } else if (elo < 1500) {
                    skillLevel = Math.floor((elo - 1000) / 150) + 2;
                } else {
                    skillLevel = Math.min(20, Math.floor((elo - 1500) / 100) + 5);
                }
                
                stockfish.postMessage(`setoption name Skill Level value ${skillLevel}`);
                
                // Log the settings being applied
                console.log(`Bot: ${botName}, ELO: ${elo}, Skill Level: ${skillLevel}`);
                
                // Additional settings for weaker play
                if (elo < 1000) {
                    stockfish.postMessage('setoption name Contempt value 0');
                    stockfish.postMessage('setoption name MultiPV value 1');
                    stockfish.postMessage('setoption name Slow Mover value 10');
                }
                
                // Set a time constraint for lower-rated bots
                if (elo <= 500) {
                    stockfish.postMessage('setoption name Move Overhead value 1000'); // 1 second overhead
                    stockfish.postMessage('setoption name Minimum Thinking Time value 500'); // Minimum 0.5 second thinking time
                }
                
                stockfish.postMessage('isready');
            }
        };
        
        stockfish.postMessage('uci');
    } catch (error) {
        console.error('Error initializing Stockfish:', error);
    }
}

export function getBestMove(fen, callback) {
    if (!stockfish) {
        initializeEngine();
    }

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
    stockfish.postMessage('go movetime 2000'); // 2 seconds think time
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
    stockfish.postMessage('go depth 10');
}

// Function to match the interface expected by BoardPage.jsx
export function findBestMove(chess) {
    return new Promise((resolve) => {
        getBestMove(chess.fen(), (move) => {
            resolve(move);
        });
    });
}

// Clean up when component unmounts
export function cleanup() {
    stopEngine();
}