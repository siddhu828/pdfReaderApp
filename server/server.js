const express=require("express");
const cors=require("cors");

const app=express();
app.use(cors({
    origin:"*",
    methods:["GET","POST"],
    allowHeaders:["Content-Type"]
}));
app.use(express.json());

app.get('/api/hello',(req,res)=>{
    res.json({message:"hello from the backend"})
});

const outlineRoute = require("./routes/extract-outline");
app.use("/api/extract-outline", outlineRoute);

const personaExtractRoute = require("./routes/persona-extract");
app.use("/api/persona-extract", personaExtractRoute);

const PORT=process.env.PORT || 5001;
app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
});