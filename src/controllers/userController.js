import { User, Score, Game } from '../models/games.js';

// Create a new user
export const createUser = async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        const newUser = new User({ name, email });
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email must be unique' });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get all users
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get scores for a specific user
export const getUserScores = async (req, res) => {
    try {
        const { userId } = req.params;
        const scores = await Score.find({ userid: userId });
        if (!scores.length) {
            return res.status(404).json({ message: 'No scores found for this user' });
        }
        const gameIds = scores.map(score => score.gameid);
        const games = await Game.find({ _id: { $in: gameIds } });
        const result = scores.map(score => {
            const game = games.find(game => game._id.toString() === score.gameid.toString());
            return {
                game: game ? game.title : 'Unknown Game',
                score: score.score,
                recordedAt: score.recordedAt,
            };
        });
        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const { userId } = req.params;
        const scores = await Score.find({ userid: userId }).populate('gameid', 'title');
        if (!scores.length) {
            return res.status(404).json({ message: 'No stats found for this user' });
        }
        const stats = scores.map(score => ({
            game: score.gameid.title,
            score: score.score,
            recordedAt: score.recordedAt,
        }));
        res.status(200).json({ userId, stats });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
