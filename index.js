const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const authRouter = require("./routes/auth.routes");

const app = express();
const PORT=process.env.PORT || 4000;
const corsMiddleWare = require("./middleware/cors.middleware");
app.use(corsMiddleWare);
app.use(express.json());
app.use("/api/auth",authRouter);
const start = async () => {
    try {
        await mongoose.connect(config.get("dbUrl"))
        .then((res)=>console.log("Connected to DB"))
        .catch((error)=>console.log(error))
        app.listen(PORT,()=>{
            console.log("server Started");
        })
    } catch(e) {

    }
}

start();