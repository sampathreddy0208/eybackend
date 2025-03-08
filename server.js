const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Recipe = require('./models/Recipe'); // Ensure Recipe model is imported
const bcrypt = require('bcryptjs');

const cors = require('cors'); // Import CORS
const app = express();

app.use(cors()); // Use CORS middleware


const PORT = 3000;
app.use(express.json());

app.get('/', (req, res) => {
    res.send("<h1 align=\"center\">welcome to the mern stack session</h1>");
});

// Recipe endpoints
app.post('/api/recipes', async (req, res) => {
    const { title, ingredients, instructions, category, image, time } = req.body; // Updated to include time

    try {
        const recipe = new Recipe({ title, ingredients, instructions, category, image, time }); // Removed createdBy

        await recipe.save();
        res.status(201).json(recipe);
    } catch (err) {
        console.error("Error adding recipe:", err); // Log the complete error object
        res.status(500).send('Internal Server Error');
    }
});

// Fetch all recipes
app.get('/api/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find();
        res.json(recipes);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Fetch a specific recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.json(recipe);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Update a specific recipe by ID
app.put('/api/recipes/:id', async (req, res) => {
    const { title, ingredients, instructions, category, image } = req.body;
    try {
        const recipe = await Recipe.findByIdAndUpdate(req.params.id, { title, ingredients, instructions, category, image }, { new: true });
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.json(recipe);
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Delete a specific recipe by ID
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.json({ message: 'Recipe deleted successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Registration page API
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword });
        await user.save();
        res.send('User registered successfully');
    } catch (err) {
        console.log(err);
    }
});

// Login page
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send('Invalid credentials');
        }
        res.json('User logged in successfully');
    } catch (err) {
        console.log(err);
    }
});

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.log(err);
});

app.listen(PORT, (err) => {
    if (err) {
        console.log(err);
    }
    console.log(`Server is running on port ${PORT}`);
});
