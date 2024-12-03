import React, { useState, useEffect, useCallback, useRef } from "react";
import "./BoardPage.css";
import Chessboard from "chessboardjsx";
import { Chess } from "chess.js";
import * as chessLogic1 from "./chess-logic1.js";
import * as chessLogic2 from "./chess-logic2.js";
import * as chessLogic3 from "./chess-logic3.js";
import Header from "../Header/Header";
import OpenAI from 'openai';

const bots = [
  { name: 'Training Bot', photo: require('./bot_pics/test.png'), logic: chessLogic3, label: 'The training ground' },
  { name: 'Rookinator', photo: require('./bot_pics/bot1.png'), logic: chessLogic1, label: 'Strategic Bot (Sicilian)' },
  { name: 'Pawnstar', photo: require('./bot_pics/bot2.png'), logic: chessLogic2, label: 'Random Moves Bot' },
  { name: 'Knight Fury', photo: require('./bot_pics/bot3.png'), logic: chessLogic3, label: 'Stockfish 500' },
  { name: 'Bishop Blitz', photo: require('./bot_pics/bot4.png'), logic: chessLogic3, label: 'Stockfish 1000' },
  { name: 'Queen Quest', photo: require('./bot_pics/bot5.png'), logic: chessLogic3, label: 'Stockfish 1250' },
  { name: 'King Crusher', photo: require('./bot_pics/bot6.png'), logic: chessLogic3, label: 'Stockfish 1500' },
  { name: 'Castling Conqueror', photo: require('./bot_pics/bot7.png'), logic: chessLogic3, label: 'Stockfish 1750' },
  { name: 'Pawnstorm', photo: require('./bot_pics/bot8.png'), logic: chessLogic3, label: 'Stockfish 2000' },
  { name: 'Checkmate Champ', photo: require('./bot_pics/bot9.png'), logic: chessLogic3, label: 'Stockfish 2250' },
  { name: 'Endgame Expert', photo: require('./bot_pics/bot10.png'), logic: chessLogic3, label: 'Stockfish 2500' },
];

const BoardPage = () => {
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [moveHistory, setMoveHistory] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [selectedBot, setSelectedBot] = useState(bots[0]?.name);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [playerColor, setPlayerColor] = useState(Math.random() < 0.5 ? 'white' : 'black');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingGames, setTrainingGames] = useState([]);
  const [trainingResults, setTrainingResults] = useState([]);
  const [currentRating, setCurrentRating] = useState(1500);
  const [ratingMin, setRatingMin] = useState(0);
  const [ratingMax, setRatingMax] = useState(3000);
  const [botsList, setBotsList] = useState(bots);

  // Initialize OpenAI with configuration
  const openai = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true // Required for client-side usage
  });

  const generateCoachResponse = async (userMessage, isAnalysis = false) => {
    if (isAnalysis) {
      setIsAnalyzing(true);
    } else {
      setIsSendingMessage(true);
      // Immediately show the user's message
      setMessages(prev => [...prev, { sender: "User", text: userMessage }]);
    }

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a chess coach. Analyze positions and provide helpful advice. Be very concise and specific."
          },
          {
            role: "user",
            content: `Current chess position (FEN): ${chess.fen()}\nUser message: ${userMessage}`
          }
        ],
        max_tokens: 500
      });

      // Testing
      
      const coachResponse = response.choices[0].message.content;
      setMessages(prev => [
        ...prev,
        ...(isAnalysis ? [{ sender: "User", text: "Please analyze the current position. Be very concise and specific." }] : []),
        { sender: "Coach", text: coachResponse }
      ]);
    } catch (error) {
      console.error("Error getting coach response:", error);
      setMessages(prev => [...prev,
        { sender: "Coach", text: "Sorry, I'm having trouble responding right now. Please try again." }
      ]);
    } finally {
      if (isAnalysis) {
        setIsAnalyzing(false);
      } else {
        setIsSendingMessage(false);
      }
    }
  };

  const handleAnalyzePosition = async () => {
    await generateCoachResponse("Please analyze the current position.", true);
  };

  const makeBotMove = useCallback(async () => {
    console.log("Bot is thinking...");
    const startTime = performance.now();
    const newChess = new Chess(chess.fen());
    console.log("Current FEN:", newChess.fen());
    console.log("Valid moves:", newChess.moves({ verbose: true }));

    // Get the selected bot's logic
    const selectedBotLogic = botsList.find(bot => bot.name === selectedBot)?.logic || chessLogic1;

    try {
      let bestMove;
      
      if (selectedBotLogic.getSicilianBookMove) {
        bestMove = selectedBotLogic.getSicilianBookMove(newChess);
      }
      
      if (!bestMove) {
        console.log("Calculating best move...");
        bestMove = await selectedBotLogic.findBestMove(newChess);
      }

      if (bestMove) {
        const result = newChess.move(bestMove);
        if (result) {
          setChess(newChess);
          setFen(newChess.fen());
          setMoveHistory((prev) => [...prev, newChess.fen()]);
          console.log("Bot moved:", bestMove);

          // Check for game over after bot's move
          if (newChess.isGameOver()) {
            setGameOver(true);
            if (newChess.isCheckmate()) {
              setWinner('bot');
            } else {
              setWinner('draw');
            }
            return;
          }

          setIsPlayerTurn(true);
        } else {
          console.error("Move returned null:", bestMove);
          throw new Error("Invalid move");
        }
      }
    } catch (error) {
      console.error("Error making bot move:", error);
      // Fallback to random move only for non-Stockfish bots
      if (selectedBotLogic !== chessLogic3) {
        const randomMove = selectedBotLogic.makeRandomMove?.(newChess);
        if (randomMove) {
          newChess.move(randomMove);
          setChess(newChess);
          setFen(newChess.fen());
          setMoveHistory((prev) => [...prev, newChess.fen()]);
          console.log("Bot made random move:", randomMove);
          setIsPlayerTurn(true);
        }
      }
    }
    const endTime = performance.now();
    console.log(`Bot thinking time: ${endTime - startTime} ms`);
  }, [chess, moveHistory, selectedBot, botsList]);

  useEffect(() => {
    if (!isPlayerTurn) {
      const timerId = setTimeout(() => {
        makeBotMove();
      }, 500);
      return () => clearTimeout(timerId);
    }
  }, [isPlayerTurn, makeBotMove]);

  useEffect(() => {
    // Initialize Stockfish when component mounts
    if (selectedBot === 'Bot 3') {
      const initEngine = async () => {
        await chessLogic3.initializeEngine();
      };
      initEngine();
    }
    return () => {
      // Cleanup Stockfish when component unmounts
      chessLogic3.cleanup();
    };
  }, [selectedBot]);

  useEffect(() => {
    // If player is black, bot (white) makes the first move
    if (playerColor === 'black' && !gameOver) {
      makeBotMove();
    }
  }, []);  // Run once when component mounts

  const startTraining = async () => {
    if (isTraining) return;
    
    // Initialize training session
    setIsTraining(true);
    setTrainingGames([]);
    setTrainingResults([]);
    setCurrentRating(1500);
    setRatingMin(0);
    setRatingMax(3000);
    
    // Start first training game
    await startNewTrainingGame(1500);
  };

  const startNewTrainingGame = async (rating) => {
    try {
      // Initialize engine with specified rating
      await chessLogic3.initializeEngine('Training Bot', rating);
      
      // Reset the game state
      const newGame = new Chess();
      setChess(newGame);
      setFen(newGame.fen());
      setGameOver(false);
      setWinner(null);
      setMoveHistory([]);
      
      // Randomly assign colors
      const newPlayerColor = Math.random() < 0.5 ? 'white' : 'black';
      setPlayerColor(newPlayerColor);
      setIsPlayerTurn(newPlayerColor === 'white');

      // If bot plays first, make its move
      if (newPlayerColor === 'black') {
        setTimeout(makeBotMove, 500);
      }
    } catch (error) {
      console.error('Error starting new training game:', error);
      setIsTraining(false);
      alert('There was an error during training. Please try again.');
    }
  };

  // Effect to handle game completion during training
  useEffect(() => {
    const handleTrainingGameEnd = async () => {
      if (!isTraining || !gameOver) return;

      try {
        // Calculate result
        const result = winner === 'player' ? 'win' : winner === 'draw' ? 'draw' : 'loss';
        const newResults = [...trainingResults, result];
        setTrainingResults(newResults);
        
        const newGameCount = trainingGames.length + 1;
        setTrainingGames([...trainingGames, result]);

        if (newGameCount >= 5) {
          // Use the final currentRating as the bot's ELO
          const finalElo = currentRating;
          
          // Generate a personalized bot with the final ELO
          let botPhoto;
          try {
            botPhoto = require('./bot_pics/new_bot.png');
          } catch (err) {
            console.error('Failed to load new bot image:', err);
            // Fallback to a default bot image from the existing bots
            botPhoto = bots[0].photo;
          }

          const personalizedBot = {
            name: 'Your Bot',
            photo: botPhoto,
            logic: chessLogic3,
            label: `Personalized Bot (${finalElo.toFixed(0)})`,
            elo: finalElo
          };
          setBotsList([...botsList, personalizedBot]);
          
          // Notify user
          setMessages(prev => [...prev, { 
            sender: "Coach", 
            text: `Training complete! Your personalized bot has been created with an ELO of ${finalElo.toFixed(0)}, matching your current skill level.`
          }]);
          
          // End training mode
          setIsTraining(false);
        } else {
          // Calculate new rating for next game
          let newRating;
          if (result === 'win') { // Player won - increase rating
            setRatingMin(currentRating);
            newRating = Math.round((currentRating + ratingMax) / 2);
          } else if (result === 'loss') { // Player lost - decrease rating
            setRatingMax(currentRating);
            newRating = Math.round((ratingMin + currentRating) / 2);
          } else { // Draw - keep rating the same
            newRating = currentRating;
          }
          setCurrentRating(newRating);
          
          // Start next game after a delay
          setTimeout(() => startNewTrainingGame(newRating), 1500);
        }
      } catch (error) {
        console.error('Error handling training game end:', error);
        setIsTraining(false);
        alert('There was an error during training. Please try again.');
      }
    };

    handleTrainingGameEnd();
  }, [gameOver, isTraining]);

  const exitTraining = () => {
    setIsTraining(false);
    // Reset the game state
    const newGame = new Chess();
    setChess(newGame);
    setFen(newGame.fen());
    setGameOver(false);
    setWinner(null);
    setMoveHistory([]);
    setPlayerColor('white');
    setIsPlayerTurn(true);
  };

  const handleMove = (move) => {
    const newChess = new Chess(chess.fen());
    
    // Only allow moves if it's the player's turn and the piece color matches player's color
    const piece = newChess.get(move.from);
    if (!piece || piece.color !== playerColor.charAt(0) || !isPlayerTurn) {
      return;
    }

    try {
      const result = newChess.move(move);
      if (result) {
        setChess(newChess);
        setFen(newChess.fen());
        setMoveHistory((prev) => [...prev, newChess.fen()]);
        console.log("Player moved:", move);

        // Check for game over after player's move
        if (newChess.isGameOver()) {
          setGameOver(true);
          if (newChess.isCheckmate()) {
            setWinner('player');
          } else {
            setWinner('draw');
          }
          return;
        }

        setIsPlayerTurn(false);
      }
    } catch (error) {
      console.error("Invalid player move:", error);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      await generateCoachResponse(input);
      setInput("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = async (bot) => {
    setSelectedBot(bot.name);
    // Reset the game
    const newGame = new Chess();
    setChess(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    setMessages([]);
    
    // If it's the Sicilian bot (Rookinator), player is always white, otherwise random
    const newPlayerColor = bot.name === 'Rookinator' ? 'white' : (Math.random() < 0.5 ? 'white' : 'black');
    setPlayerColor(newPlayerColor);
    // Set isPlayerTurn based on player color - true if white, false if black
    setIsPlayerTurn(newPlayerColor === 'white');

    // Initialize Stockfish with correct rating for Stockfish-based bots
    if (bot.logic === chessLogic3) {
      await chessLogic3.initializeEngine(bot.name);
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setChess(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setGameOver(false);
    setWinner(null);
    // Set isPlayerTurn based on current player color
    setIsPlayerTurn(playerColor === 'white');
  };

  return (
    <div>
      <Header />

      <div className="page-container">
        <div className="chess-game">
          <div className="board-container">
            <div className="player-name opponent">
              <span>Bot ({playerColor === 'white' ? 'black' : 'white'})</span>
            </div>
            <div className="board">
              <Chessboard
                position={fen}
                orientation={playerColor}
                onDrop={(move) =>
                  handleMove({
                    from: move.sourceSquare,
                    to: move.targetSquare,
                    promotion: "q",
                  })
                }
              />
              {gameOver && (
                <div className="game-over-overlay">
                  <div className="game-over-message">
                    {winner === 'player' && <h2>You Win! 🎉</h2>}
                    {winner === 'bot' && <h2>Bot Wins! 🤖</h2>}
                    {winner === 'draw' && <h2>Game Draw! 🤝</h2>}
                  </div>
                </div>
              )}
            </div>
            <div className="player-name player">
              <span>You ({playerColor})</span>
            </div>
          </div>
        </div>

        <div className="rightside-parts">
          <div className="bot-list">
            {botsList.map((bot, index) => (
                <div
                  key={index}
                  className={`bot-item ${selectedBot === bot.name ? 'selected' : ''}`}
                  onClick={() => handleSelect(bot)}
                >
                  <div className="bot-info">
                    <img src={bot.photo} alt={bot.name} className="bot-image" />
                    <div>
                      <p>{bot.name}</p>
                      <p className="bot-label">{bot.label}</p>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          <div className="chatbot">
            <div className="chatbot-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender.toLowerCase()}`}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
              {isSendingMessage && (
                <div className="message coach typing">
                  <span className="typing-indicator">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-controls">
              <form
                onSubmit={handleSendMessage}
                className="message-form"
              >
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="message-input"
                  disabled={isSendingMessage}
                />
                <button
                  type="submit"
                  className={`send-button ${isSendingMessage ? 'disabled' : ''}`}
                  disabled={isSendingMessage}
                >
                  Send
                </button>
              </form>
              <button
                onClick={handleAnalyzePosition}
                className={`analyze-button ${isAnalyzing ? 'disabled' : ''}`}
                disabled={isAnalyzing || isSendingMessage}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Position...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    Analyze Position
                  </span>
                )}
              </button>
              {selectedBot === 'Training Bot' && (
                <button
                  onClick={startTraining}
                  className="train-button"
                >
                  Start Training
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <p>Current turn: {isPlayerTurn ? `Your turn (${playerColor})` : `Bot's turn (${playerColor === 'white' ? 'black' : 'white'})`}</p>
        <p>FEN: {fen}</p>
        {isTraining && (
          <div className="training-status">
            <div className="training-info">
              <h3>Training in Progress</h3>
              <p>Play against the bot to determine your rating. The bot's strength will adjust based on your performance.</p>
              <div className="training-stats">
                <p>Games completed: {trainingGames.length}/5</p>
                <p>Current bot rating: {currentRating}</p>
                <p>Rating range: {ratingMin} - {ratingMax}</p>
                <p>Results: {trainingResults.map((r, i) => 
                  r === 'win' ? "Win" : r === 'draw' ? "Draw" : "Loss").join(", ")
                }</p>
                <div className="debug-buttons" style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => {
                      setWinner('player');
                      setGameOver(true);
                    }}
                    style={{ marginRight: '10px', backgroundColor: 'green', color: 'white' }}
                  >
                    Debug: Win
                  </button>
                  <button
                    onClick={() => {
                      setWinner('bot');
                      setGameOver(true);
                    }}
                    style={{ backgroundColor: 'red', color: 'white' }}
                  >
                    Debug: Lose
                  </button>
                </div>
                <button
                  onClick={exitTraining}
                  className="exit-training-button"
                  style={{
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    marginTop: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Exit Training
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardPage;