# Personalized Chess AI

A modern, interactive chess application built with React that allows users to play against multiple AI opponents with varying skill levels, receive coaching from an AI-powered chess coach, and track their progress through personalized training sessions.

## 🎯 Features

### Core Gameplay
- **Interactive Chess Board**: Play chess against AI opponents with a beautiful, responsive UI
- **Multiple AI Opponents**: Choose from 11 different bots with varying skill levels (500-2500 ELO)
- **Color Selection**: Play as either white or black (randomly assigned)
- **Real-time Game State**: Track moves, game status, and FEN notation

### AI Coaching System
- **AI-Powered Chess Coach**: Get real-time position analysis and advice using OpenAI's GPT-4o-mini
- **Position Analysis**: Request detailed analysis of the current board position
- **Interactive Chat**: Ask questions and receive personalized coaching tips
- **Context-Aware Responses**: Coach understands the current game state and provides relevant advice

### Training & Personalization
- **Adaptive Training Bot**: Play 5 games to determine your skill level
- **ELO Rating System**: Binary search algorithm adjusts bot strength based on your performance
- **Personalized Bot Creation**: After training, a custom bot matching your skill level is generated
- **Progress Tracking**: View your ELO rating and historical performance on your profile

### User Management
- **User Authentication**: Login and registration system
- **Profile Management**: Upload avatar, view ELO rating, and track progress
- **ELO History**: Visualize your rating progression with interactive charts

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1**: Modern UI framework
- **React Router DOM 6.26.2**: Client-side routing
- **Chess.js 1.0.0-beta.8**: Chess game logic and move validation
- **Chessboardjsx 2.4.7**: Interactive chess board component
- **Stockfish 16.0.0**: Powerful chess engine for high-level bots
- **OpenAI 4.73.1**: AI coaching and position analysis
- **Recharts 2.13.3**: Data visualization for ELO progression
- **React Icons 5.3.0**: Icon library

### Backend Integration
- **Express.js**: Production server for serving the React build
- **Python Flask Backend**: User authentication, profile management, and ELO tracking (see `/backend` directory)

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key (for coaching features)
- Python 3.x (for backend)

### Setup Steps

1. **Clone the repository**
   ```bash
   cd personalized-chess-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Download Stockfish files** (if not already present)
   The Stockfish engine files should be in `public/stockfish/`. If missing, run:
   ```bash
   node download-stockfish.js
   ```

5. **Set up the backend** (see `/backend` directory for instructions)
   - Install Python dependencies
   - Configure database
   - Start the Flask server on `http://127.0.0.1:5000`

6. **Start the development server**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Playing Chess

1. **Login/Register**: Create an account or login to access the game
2. **Select a Bot**: Choose from the list of available AI opponents:
   - **Training Bot**: Adaptive bot for skill assessment
   - **Rookinator**: Strategic bot with Sicilian Defense opening book (ELO ~1500)
   - **Pawnstar**: Random moves bot (for beginners)
   - **Knight Fury**: Stockfish 500 ELO
   - **Bishop Blitz**: Stockfish 1000 ELO
   - **Queen Quest**: Stockfish 1250 ELO
   - **King Crusher**: Stockfish 1500 ELO
   - **Castling Conqueror**: Stockfish 1750 ELO
   - **Pawnstorm**: Stockfish 2000 ELO
   - **Checkmate Champ**: Stockfish 2250 ELO
   - **Endgame Expert**: Stockfish 2500 ELO

3. **Make Moves**: Click and drag pieces to make moves
4. **Game Controls**: 
   - Reset the game at any time
   - View current FEN notation
   - See whose turn it is

### Using the AI Coach

1. **Ask Questions**: Type questions in the chat interface
   - "What's the best move here?"
   - "How can I improve my position?"
   - "What should I watch out for?"

2. **Analyze Position**: Click "Analyze Position" for instant position evaluation

3. **Get Advice**: The coach provides context-aware responses based on the current board state

### Training Mode

1. **Start Training**: Select "Training Bot" and click "Start Training"
2. **Play 5 Games**: The bot adjusts its strength based on your performance
3. **Get Your Bot**: After 5 games, a personalized bot matching your skill level is created
4. **Track Progress**: View your ELO rating and training results

## 🏗️ Project Structure

```
personalized-chess-ai/
├── public/
│   ├── stockfish/          # Stockfish engine files
│   │   ├── stockfish.js
│   │   └── stockfish.wasm
│   └── index.html
├── src/
│   ├── Pages/
│   │   ├── Board/
│   │   │   ├── BoardPage.jsx      # Main game interface
│   │   │   ├── BoardPage.css
│   │   │   ├── chess-logic1.js    # Sicilian Defense bot
│   │   │   ├── chess-logic2.js     # Random moves bot
│   │   │   └── chess-logic3.js     # Stockfish integration
│   │   ├── LoginForm/
│   │   │   ├── LoginForm.jsx       # Authentication UI
│   │   │   └── LoginForm.css
│   │   ├── Profile/
│   │   │   ├── Profile.jsx         # User profile & ELO tracking
│   │   │   └── Profile.css
│   │   └── Header/
│   │       ├── Header.js            # Navigation component
│   │       └── Header.css
│   ├── App.js                       # Main app component with routing
│   ├── App.css
│   └── index.js                     # React entry point
├── server.js                        # Express production server
├── download-stockfish.js            # Stockfish download script
├── package.json
└── README.md
```

## 🤖 Bot Implementations

### Chess Logic 1 (Rookinator)
- **Strategy**: Sicilian Defense opening book with advanced minimax search
- **Features**:
  - Opening book for Sicilian Defense variations
  - Negamax algorithm with alpha-beta pruning
  - Iterative deepening search (up to depth 8)
  - Quiescence search for tactical positions
  - Late move reduction optimization
  - Advanced position evaluation (material, mobility, pawn structure, king safety)

### Chess Logic 2 (Pawnstar)
- **Strategy**: Random legal moves
- **Use Case**: Beginner-friendly opponent for learning

### Chess Logic 3 (Stockfish Bots)
- **Strategy**: Stockfish engine with ELO-limited strength
- **Features**:
  - Configurable ELO ratings (500-2500)
  - Skill level adjustment based on ELO
  - Random move probability for lower-rated bots
  - Optimized think times per skill level
  - Web Worker implementation for non-blocking calculations

## 🔌 API Integration

### OpenAI Integration
- **Model**: GPT-4o-mini
- **Usage**: Chess coaching and position analysis
- **Configuration**: Requires `REACT_APP_OPENAI_API_KEY` environment variable

### Backend API Endpoints
The frontend communicates with a Flask backend (see `/backend` directory):
- `POST /create-account`: User registration
- `POST /login`: User authentication
- `GET /user-elo`: Fetch user's ELO rating
- Default backend URL: `http://127.0.0.1:5000`

## 🚀 Development

### Available Scripts

- `npm start`: Start development server (port 3000)
- `npm run build`: Create production build
- `npm test`: Run test suite
- `npm run eject`: Eject from Create React App (irreversible)

### Development Notes

- **Stockfish Setup**: Ensure Stockfish files are in `public/stockfish/`
- **CORS**: Backend must allow requests from `http://localhost:3000`
- **Environment Variables**: Never commit `.env` file with API keys
- **SharedArrayBuffer**: Server must set `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers (configured in `server.js`)

## 📦 Production Deployment

### Build for Production

1. **Create production build**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   node server.js
   ```
   Server runs on port 3000 (or PORT environment variable)

### Deployment Considerations

- **Environment Variables**: Set `REACT_APP_OPENAI_API_KEY` in production environment
- **Backend URL**: Update API endpoints for production backend URL
- **Stockfish Files**: Ensure `public/stockfish/` files are included in deployment
- **HTTPS**: Required for SharedArrayBuffer (used by Stockfish)
- **Headers**: Production server must set COOP/COEP headers (see `server.js`)

## 🎓 Training Algorithm

The training mode uses a binary search algorithm to determine player skill:

1. **Initial Range**: 0-3000 ELO
2. **Starting Rating**: 1500 ELO
3. **Adjustment Logic**:
   - **Win**: Increase rating (new rating = (current + max) / 2)
   - **Loss**: Decrease rating (new rating = (min + current) / 2)
   - **Draw**: Keep current rating
4. **Final Rating**: After 5 games, the final rating becomes the personalized bot's ELO

## 🐛 Troubleshooting

### Common Issues

1. **Stockfish not working**
   - Ensure files are in `public/stockfish/`
   - Check browser console for errors
   - Verify HTTPS or localhost (required for SharedArrayBuffer)

2. **OpenAI API errors**
   - Verify `REACT_APP_OPENAI_API_KEY` is set
   - Check API key validity and quota
   - Review browser console for error messages

3. **Backend connection errors**
   - Ensure Flask backend is running on port 5000
   - Check CORS settings in backend
   - Verify API endpoint URLs

4. **Build errors**
   - Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility

## 📝 License

This project is private and proprietary.

## 👥 Contributing

This is a personal project. For questions or suggestions, please contact the repository owner.

## 🙏 Acknowledgments

- **Stockfish**: Open-source chess engine
- **Chess.js**: Chess move generation and validation library
- **Chessboard.jsx**: React chess board component
- **OpenAI**: GPT-4o-mini for chess coaching
- **Create React App**: Project scaffolding

---

**Enjoy playing chess and improving your skills!** 🎯♟️
