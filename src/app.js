import express from 'express'
import userRoute from './routes/user.route.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import { milkRouter } from './routes/milk.route.js';
import helmet from 'helmet'
import productRoute from './routes/product.route.js';

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
app.use(helmet());
app.get("/", (req, res) => {
    res.send("Hello From Santosh's Api")
})
app.use('/api/v1/user', userRoute)
app.use('/api/v1/milk', milkRouter)
app.use('/api/v1/product', productRoute)
app.use(errorHandler);
export { app }