import { Game } from '../models/games.js';

// Example placeholder for game-related logic
export const createGame = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Game title is required' });
        }

        const newGame = new Game({ title, description });
        await newGame.save();

        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
