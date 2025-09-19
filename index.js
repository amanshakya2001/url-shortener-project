const express = require("express");
const mongoose = require('mongoose');
const Url = require("./models/urls");
const User = require("./models/users");
const generateUniqueId = require('generate-unique-id');
const { createJWTToken } = require("./utils/auth");
const cookieParser = require('cookie-parser')
const { checkAuthentication } = require("./middleware/auth");

const app = express();
const PORT = 8000;


mongoose.connect('mongodb://127.0.0.1:27017/urlshortner').then(()=>{
    console.log("Database connected successfully!");
});

// setting ejs engine for templating
app.set("view engine","ejs");
// Middlerware
app.use(express.json());
app.use(cookieParser())
app.use(checkAuthentication());

app.get("/", async (req, res) => {
    try {
        const urls = await Url.find();
        return res.status(200).render("home", {
            urls
        });
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
});

app.post("/", async (req, res) => {
    try {
        let { redirecturl } = req.body;
        if (!redirecturl) {
            return res.status(400).json({ error: "The redirection URL must not be empty." });
        }
        let shortid = generateUniqueId({ length: 8 });

        await Url.create({
            redirecturl,
            shortid,
        });

        return res.status(201).json({
            message: "The short URL has been created successfully.",
            url: `http://localhost:8000/${shortid}`
        });
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
});

app.get("/signup", async (req, res) => {
    try {
        if(req.email){
            res.redirect("/");
        }
        return res.status(200).render("signup");
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
})

app.post("/signup", async (req, res) => {
    try{
        const { fullname, email, password } = req.body;
        if(!fullname || !email || !password){
            return res.status(400).json({ error: "fullname,email and password is mandatory." });
        }
        let user = await User.create({
            fullname,
            email,
            password
        })
        let token = createJWTToken(email);
        return res.cookie("sessionid",token).status(201).json({ message: `Successfully Created`});
    }
    catch(error){
        return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
})

app.get("/:shortid", async (req, res) => {
    try {
        let { shortid } = req.params;
        let url = await Url.findOne({ shortid });
        if (!url) {
            return res.status(404).json({ error: "The provided short ID is invalid." });
        }

        url.clicks = url.clicks + 1;
        await url.save();

        return res.redirect(url.redirecturl);
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred: ${error.message}` });
    }
});

app.listen(PORT , () => {
    console.log("Url Shortner Application is Running on 8000 Port!!")
})