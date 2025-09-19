const express = require("express");
const mongoose = require('mongoose');
const Url = require("./models/urls");
const User = require("./models/users");
const generateUniqueId = require('generate-unique-id');
const { createJWTToken } = require("./utils/auth");
const cookieParser = require('cookie-parser')
const { checkAuthentication } = require("./middleware/auth");
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = 8000;
const DOMAIN = process.env.DOMAIN;


mongoose.connect(process.env.MONGODB).then(()=>{
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
        const urls = await Url.find({ userid: req.id });
        return res.status(200).render("home", {
            urls,
            "email": req.email
        });
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
});

app.post("/", async (req, res) => {
    try {
        let { redirecturl } = req.body;
        if (!redirecturl) {
            return res.status(400).json({ error: "Please provide a destination URL." });
        }
        let shortid = generateUniqueId({ length: 8 });

        if (!req.id) {
            return res.status(400).json({ error: "Please log in to create short URLs." });
        }

        await Url.create({
            redirecturl,
            shortid,
            "userid": req.id
        });

        return res.status(201).json({
            message: "Short URL created successfully.",
            url: `${DOMAIN}/${shortid}`
        });
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
});

app.get("/login", async (req, res) => {
    try {
        if (req.email) {
            return res.redirect("/");
        }
        return res.status(200).render("login");
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
})

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        let user = await User.findOne({
            email
        })
        if (!user) {
            return res.status(400).json({ error: "No account found with that email address." });
        }
        if (user.password !== password) {
            return res.status(400).json({ error: "Incorrect email or password." });
        }
        let payload = {
            email,
            id: user.id
        }
        let token = createJWTToken(payload);
        return res.cookie("sessionid", token).status(201).json({ message: `Logged in successfully.` });
    }
    catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
})

app.get("/signup", async (req, res) => {
    try {
        if (req.email) {
            return res.redirect("/");
        }
        return res.status(200).render("signup");
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
})

app.post("/signup", async (req, res) => {
    try {
        const { fullname, email, password } = req.body;
        if (!fullname || !email || !password) {
            return res.status(400).json({ error: "Full name, email and password are required." });
        }
        let user = await User.create({
            fullname,
            email,
            password
        })
        let payload = {
            email,
            id: user.id
        }
        let token = createJWTToken(payload);
        return res.cookie("sessionid", token).status(201).json({ message: `Account created successfully.` });
    }
    catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
})

app.get("/logout", async (req, res) => {
    try {
        res.clearCookie("sessionid");
        return res.redirect("/");
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
})

app.get("/:shortid", async (req, res) => {
    try {
        let { shortid } = req.params;
        let url = await Url.findOne({ shortid });
        if (!url) {
            return res.status(404).json({ error: "Short link not found." });
        }

        url.clicks = url.clicks + 1;
        await url.save();

        return res.redirect(url.redirecturl);
    } catch (error) {
        return res.status(500).json({ error: `An unexpected error occurred. Please try again later.` });
    }
});

app.listen(PORT , () => {
    console.log("Url Shortner Application is Running on 8000 Port!!")
})