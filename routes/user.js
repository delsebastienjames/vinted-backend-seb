const express = require("express");
const formidable = require("express-formidable");

const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256"); //
const encBase64 = require("crypto-js/enc-base64");

const router = express.Router();

// Importer le model
const User = require("../models/User");

// 1ère route
router.post("/user/signup", async (req, res) => {
  //res.json("user/signup");
  try {
    const { email, username, phone, password } = req.fields; // Utilisation du destructuring (pas d'odre dans un objet)
    //res.json(user);
    // Vérifier qu'il n'y a pas déja un user qui possède déja cet email avec le findOne
    const user = await User.findOne({ email: email });
    if (!user) {
      if (username && password) {
        // encrypter le mot de passe (uid2 et crypto-js)

        // générer un salt
        const salt = uid2(16); // nombre de caractères aléatoires
        //console.log("le salt: ", salt);

        // générer le token
        const token = uid2(64); // nombre de caractères aléatoires
        //console.log("le token : ", token);

        // générer un hash
        const hash = SHA256(salt + password).toString(encBase64);
        //console.log("le hash :", hash);
        // Création du nouveau user
        const newUser = new User({
          email: email,
          account: {
            username: username,
            phone: phone,
            //avatar: [{}]
          },
          token: token,
          salt: salt,
          hash: hash,
        });

        // Sauvegarder l'évènement' dans la BDD (===> requête entre le serveur et la BDD)
        await newUser.save();

        // Répondre au client
        res.status(200).json({
          // résultat attendu
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
        });
      } else {
        res.status(400).json({ message: "missing parameters" });
      }
    } else {
      res.status(409).json({ message: "this emeil already has an account" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // status(400) Bad request
  }
});

// 2ème route
router.post("/user/login", async (req, res) => {
  //res.json("user/login");
  try {
    const { email, password } = req.fields;
    // Vérifier qu'il n'y a pas déjà un user(utilisateur) qui possède déja cet email avec le findOne
    const user = await User.findOne({ email: email });
    if (user) {
      // Vérification du bon mot de passe
      const newHash = SHA256(user.salt + password).toString(encBase64);

      if (newHash === user.hash) {
        // Répondre au client
        res.status(200).json({
          // résultat attendu
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message }); // status(400) Bad request
  }
});

module.exports = router;
