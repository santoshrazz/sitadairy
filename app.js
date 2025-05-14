import express from 'express'
import userRoute from './src/routes/user.route.js';
import { errorHandler } from './src/middleware/errorHandler.middleware.js';
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
const app = express();

app.use(express.json({ limit: "16kb" }))

const corsOptions = {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions))

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
})
app.use(limiter)
app.get("/", (req, res) => {
    res.send("Hello From Santosh's Api")
})
app.use('/api/v1/user', userRoute)
app.use(errorHandler);
export { app }