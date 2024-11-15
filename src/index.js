import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import connectDB from './db/index.js';
import { User, Game, Score } from './models/games.js'

dotenv.config({ path: './.env' });

const app = express();
app.use(bodyParser.json());


connectDB();


app.post('/api/score', async (req, res) => {
    const { userid, gameid, score, username, email, title, description } = req.body;

    if (!userid || !gameid || score === undefined) {
        return res.status(400).json({ message: 'userid, gameid, and score are required.' });
    }

    try {
        let user = await User.findById(userid);
        let game = await Game.findById(gameid);


        if (!user && username && email) {
            user = new User({
                name: username,
                email: email
            });
            await user.save();
            console.log('New user created:', user);
        } else if (!user) {
            return res.status(404).json({ message: 'User not found, and no data provided to create one.' });
        }

       
        if (!game && title && description) {
            game = new Game({
                title: title,
                description: description
            });
            await game.save();
            console.log('New game created:', game);
        } else if (!game) {
            return res.status(404).json({ message: 'Game not found, and no data provided to create one.' });
        }

        let scoreEntry = await Score.findOne({ userid, gameid });

        if (scoreEntry) {
            
            if (score > scoreEntry.score) {
                scoreEntry.score = score;
                scoreEntry.recordedAt = new Date();
                await scoreEntry.save();
                return res.status(200).json({ message: 'Score updated successfully', score: scoreEntry });
            } else {
                return res.status(200).json({ message: 'New score is not higher than the existing score' });
            }
        } else {
        
            scoreEntry = new Score({
                userid,
                gameid,
                score,
                recordedAt: new Date()
            });
            await scoreEntry.save();
            return res.status(201).json({ message: 'Score saved successfully', score: scoreEntry });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));