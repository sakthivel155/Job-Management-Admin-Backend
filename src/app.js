import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();

// 1. Basic Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS Middleware
app.use(cors({
    origin:'*', // Add any other development origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 3. Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 4. Routes
app.use('/api', routes);

// 5. Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'hello backend connect succesfully' });
});

export default app;