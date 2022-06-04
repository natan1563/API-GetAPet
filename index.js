require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Config JSON response
app.use(express.json())

// Solves CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Public folder for images

app.use(express.static('public'))

const UserRouter = require('./routes/UserRoutes')
// Routes
app.use('/users', UserRouter)

app.listen(5000)