import dotenv from 'dotenv'
import { app } from './app.js'
import { connectToDb } from './src/db/connectToDb.js'

dotenv.config({ path: "/.env" })

connectToDb().then(() => {
    app.listen(process.env.PORT || 8080, () => {
        console.log("Server listening at port", process.env.PORT);
    });
}).catch((error) => {
    console.log("Error starting the server", error);
});