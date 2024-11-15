import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './db/index.js';
import { User, Game, Score } from './models/games.js'

dotenv.config({ path: './.env' });

const app = express();
app.use(bodyParser.json());


connectDB();


app.post('/users/:userId?/scores', async (req, res) => {
    try {
        const { userId } = req.params;  
        const { name, email, gameTitle, score } = req.body;  

        if (!gameTitle || score === undefined) {
            return res.status(400).json({ message: 'Game title and score are required' });
        }

        let user;

        // Step 1: Handle the case where userId is provided or not
        if (userId) {
            user = await User.findById(userId);
            if (!user) {
                // If user is not found, create a new user
                user = new User({ name, email });
                await user.save();  
            }
        } else {
            // If userId is not provided, check if user exists with the same email
            user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }

            // If no existing user, create a new user from the body
            user = new User({ name, email });
            await user.save();  
        }

        // Step 2: Check if the game exists, if not, create a new game
        let game = await Game.findOne({ title: gameTitle });
        if (!game) {
            game = new Game({ title: gameTitle });
            await game.save(); 
        }

        // Step 3: Create and save the score
        const newScore = new Score({
            userid: user._id, 
            gameid: game._id, 
            score: score
        });

        const savedScore = await newScore.save(); 

        // Send the created score as response
        res.status(201).json(savedScore);
    } catch (error) {
        console.error('Error saving game and score:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});






app.get('/api/leaderboard/:gameid', async (req, res) => {
    const { gameid } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const game = await Game.findById(gameid);
        if (!game) {
            return res.status(404).json({ message: 'Game not found.' });
        }

        const leaderboard = await Score.find({ gameid })
            .sort({ score: -1 })
            .limit(limit)
            .populate('userid', 'name email')
            .select('score recordedAt');

        return res.status(200).json({
            game: game.title,
            leaderboard: leaderboard
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); 
        res.status(200).json(users); 
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// API Endpoint to Create a New User
app.post('/users', async (req, res) => {
    try {
        const { name, email } = req.body; // Extract name and email from the request body

        // Check if name and email are provided
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }

        // Create a new user document
        const newUser = new User({ name, email });
        const savedUser = await newUser.save(); 

        res.status(201).json(savedUser); 
    } catch (error) {
        console.error('Error creating user:', error);

        // Handle duplicate email errors
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email must be unique' });
        }

        res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/users/:userId/scores', async (req, res) => {
    try {
        const { userId } = req.params; 

        // Fetch scores for the user
        const scores = await Score.find({ userid: userId }); 

        if (!scores.length) {
            return res.status(404).json({ message: 'No scores found for this user' });
        }

        // Fetch game details for each score
        const gameIds = scores.map(score => score.gameid); 
        const games = await Game.find({ _id: { $in: gameIds } }); 

        // Combine scores and game information
        const result = scores.map(score => {
            const game = games.find(game => game._id.toString() === score.gameid.toString());
            return {
                game: game ? game.title : 'Unknown Game',
                score: score.score,
                recordedAt: score.recordedAt
            };
        });

        res.status(200).json(result); 
    } catch (error) {
        console.error('Error fetching user scores:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
