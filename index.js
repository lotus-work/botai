const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const port = process.env.PORT || 9000;
require('dotenv').config();
// Database connection
const url = 'mongodb+srv://lotusbiswas:lotusbiswas@cluster0.1zfsoap.mongodb.net/botai';
mongoose.set('strictQuery', false);
mongoose.connect(url, { useNewUrlParser: true });

const con = mongoose.connection;
con.on('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const conversationRouter = require('./routes/conversation');
app.use('/user', userRouter);
app.use('/admin', adminRouter);
app.use('/conversation', conversationRouter);

app.get('/embed.js', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'embed.js'));
});

// Root endpoint
app.get('/', (req, res) => {
    res.send({ status: "running" });
});

// Start the server
app.listen(port, () => {
    console.log(`App listening at ${port}`);
});
