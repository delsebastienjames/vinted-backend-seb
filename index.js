const express = require("express");
const formidable = require("express-formidable");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(formidable());
app.use(cors());

//const isAuthenticated = require("./middlewares/isAuthenticated");

// Connexion du serveur et de la base de données (BDD)
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // unique : true du model User
  //useFindAndModify: false,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Importer les routes
const userRoutes = require("./routes/user"); // fichier routes user.js
const offerRoutes = require("./routes/offer"); // fichier routes offer.js
const paymentRoutes = require("./routes/payment"); // fichier routes payment.js
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Cette route n'existe pas." });
});

app.listen(process.env.PORT, () => {
  console.log("Server Started");
});
