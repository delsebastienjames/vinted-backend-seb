const express = require("express");
const cloudinary = require("cloudinary").v2;
const formidable = require("express-formidable");
const mongoose = require("mongoose");

const router = express.Router();

// Importer le/les model(s)
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");

// route en post
router.post("/offer/publish", isAuthenticated, async (req, res) => {
  //res.json("offer/publish");
  //console.log(req.user);
  //console.log(req.fields);
  //console.log(req.files.picture.path);

  try {
    // Initialiser la nouvelle annonce (newOffer)
    // Utilisation du destructuring (pas d'ordre dans un objet)
    const {
      title,
      description,
      price,
      condition,
      city,
      format,
      color,
      marque,
    } = req.fields;
    //console.log(req.fields);

    //res.json(user);

    // Création du nouveau user
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: marque,
        },
        {
          TAILLE: format,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      owner: req.user,
    });

    //console.log(newOffer);
    // Uploader l'image sur Cloudinary
    const result = await cloudinary.uploader.upload(req.files.picture.path, {
      folder: `/test-vinted/offer/${newOffer._id}`,
    });
    // console.log(result);
    // Ajouter le result de l'upload à newOffer
    newOffer.product_image = result;
    // Sauvegarder l'annonce dans la BDD (===> requête entre le serveur et la BDD)
    await newOffer.save();
    //console.log(newOffer);

    //Répondre au client
    res.status(200).json(newOffer);
  } catch (error) {
    res.status(400).json({ error: error.message }); // status(400) Bad request
  }
});

router.get("/offers", async (req, res) => {
  try {
    //const offers = await Offer.find();
    //const results = await Offer.find({
    //product_price: { $lte: 200, $gte: 20 }, // prix entre 200 et 20
    //})
    // .sort({ product_price: +1 })
    // .select("product_name product_price");

    // Déclarer un object vide

    let filters = {};
    // Alimenter  cet object en fonction des queries reçues
    if (req.query.title) {
      // ajouter un clé product_name à filters
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) }; // plus grand ou égal
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) }; // plus petit ou égal
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = -1;
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1;
    }

    // req.query.page
    const limit = Number(req.query.limit);
    let page;
    if (Number(req.query.page) > 0) {
      page = (Number(req.query.page) - 1) * limit;
    } else {
      page = 0;
    }

    // Passer cet object dans le .find
    const results = await Offer.find(filters)
      .sort(sort)
      // .populate("owner") // on voit presque tous les champs
      .populate("owner", "account") // populate owner, en selectionnant seulement la clé account
      //.populate({
      //   path:"owner",
      //   select: "account",
      // })// on voit presque tous les champs
      .skip(page)
      .limit(limit);
    //.select("product_name product_price");
    //   const results = await Offer.find(filters).select(
    //     "product_name product_price"
    //   );

    // Calcule nombre de documents
    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      results: results,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  //res.json(req.params);
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.status(200).json(offer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
