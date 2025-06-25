import express from 'express'
import userRoute from './routes/user.route.js';
import { errorHandler } from './middleware/errorHandler.middleware.js';
import cors from 'cors'
import { rateLimit } from 'express-rate-limit'
import { milkRouter } from './routes/milk.route.js';
import { validator } from './middleware/validator.js'
const app = express();

app.use(validator)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
    origin: ['*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
app.use(cors(corsOptions))

app.set('trust proxy', 1);
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
app.get("/try", (req, res) => {
    res.send("Hello This is trying route for the sonarqube added new line")
})
app.use('/api/v1/user', userRoute)
app.use('/api/v1/milk', milkRouter)
app.use(errorHandler);
export { app }