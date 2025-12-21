require("dotenv").config();
const express = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const session = require("express-session");
const cors = require("cors");
const path = require("path");

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "https://fabulous-dolphin-0b06c9.netlify.app";

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret123",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24*60*60*1000, sameSite: "none", secure: true },
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://novastore-production.up.railway.app/auth/google/callback"
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

/* ---------- PRODUCTS ---------- */
const products = [
  { id: 1, name: "macbook pro m4", price: 4000, img: "/images/macbook-pro-m4.jpg" },
  { id: 2, name: "samsung z fold 7", price: 2000, img: "/images/z-fold-7.jpg" },
  { id: 3, name: "gaming pc", price: 600, img: "/images/gaming-pc.png" },
  { id: 4, name: "i watch", price: 150, img: "/images/iwatch.jfif" },
  { id: 5, name: "xiaomi 17 pro", price: 1100, img: "/images/xiaomi-17-pro.jpg" },
  { id: 6, name: "iphone 17", price: 1300, img: "/images/iphone-17.webp" },
  { id: 7, name: "bluetooth speaker", price: 300, img: "/images/speaker.png" },
  { id: 8, name: "wireless headphones", price: 200, img: "/images/headphones.png" },
  { id: 9, name: "ipad pro 5th gen", price: 1600, img: "/images/ipad-pro-5th-gen.avif" },
  { id: 10, name: "playstation 5", price: 500, img: "/images/playstation-5.jpg" },
  { id: 11, name: "xbox series x", price: 400, img: "/images/xbox-series-x.png" },
  { id: 12, name: "samsung 40' tv", price: 300, img: "/images/samsung-40-tv.webp" },
  { id: 13, name: "ugreen powerbank", price: 700, img: "/images/ugreen-powerbank.webp" }
];

app.get("/api/products", (req, res) => res.json(products));

/* ---------- AUTH ROUTES ---------- */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/shop.html` }),
  (req, res) => res.redirect(`${FRONTEND_URL}/shop.html`)
);

app.get("/logout", (req, res) => {
  req.logout();
  req.session.destroy(() => res.redirect(`${FRONTEND_URL}/shop.html`));
});

app.get("/api/auth/status", (req, res) => {
  res.json(req.user ? { loggedIn: true, user: req.user } : { loggedIn: false });
});

/* ---------- SERVE FRONTEND ---------- */
app.use(express.static(path.join(__dirname, "../frontend")));
app.use("/images", express.static(path.join(__dirname, "../frontend/images")));

/* ---------- START SERVER ---------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
