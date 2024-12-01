import { Game, Score } from '../models/games.js';

// Create a new game
export const createGame = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Game title is required' });
        }
        const newGame = new Game({ title });
        const savedGame = await newGame.save();
        res.status(201).json(savedGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Fetch all games
export const getGames = async (req, res) => {
    try {
        const games = await Game.find();
        res.status(200).json(games);
    } catch (error) {
        console.error('Error fetching games:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Fetch all scores for a specific game
export const getGameScores = async (req, res) => {
    try {
        const { gameid } = req.params;
        const game = await Game.findById(gameid);
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }
        const scores = await Score.find({ gameid }).sort({ score: -1 }).populate('userid', 'name email').select('score recordedAt');
        res.status(200).json({ game: game.title, scores });
    } catch (error) {
        console.error('Error fetching game scores:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
