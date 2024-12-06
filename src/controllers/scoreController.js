import { User, Game, Score } from '../models/games.js';

// Save user and score
export const saveScore = async (req, res) => {
    try {
        const { name, email, gameId, score } = req.body;

        if (!name || !email || !gameId || score === undefined) {
            return res.status(400).json({ message: 'Name, email, game ID, and score are required.' });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ name, email });
            await user.save();
        }

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        const newScore = new Score({
            userid: user._id,
            gameid: gameId,
            score,
        });
        const savedScore = await newScore.save();

        res.status(201).json({ message: 'Score saved successfully', score: savedScore });
    } catch (error) {
        console.error('Error saving score:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get scores for all users for a specific game
export const getGameScores = async (req, res) => {
    try {
        const { gameId } = req.params;

        const scores = await Score.find({ gameid: gameId }).populate('userid', 'name email');
        res.status(200).json(scores);
    } catch (error) {
        console.error('Error fetching game scores:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Get scores for a specific user for a specific game
export const getUserGameScores = async (req, res) => {
    try {
        const { gameId, userId } = req.params;

        const scores = await Score.find({ gameid: gameId, userid: userId });
        res.status(200).json(scores);
    } catch (error) {
        console.error('Error fetching user scores for game:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
