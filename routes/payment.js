const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_API_SECRET);
const router = express.Router();
const app = express();
app.use(formidable());
app.use(cors());

router.post("/payment", async (req, res) => {
  try {
    // Réception du token créer via l'API Stripe depuis le Frontend
    //const stripeToken = req.fields.stripeToken;

    // Créer la transaction
    // Envoyer le token à l'API Stripe
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement vinted pour : ${req.fields.title}`,
      source: req.fields.token,
    });
    // Recevoir une réponse de l'API Stripe

    console.log(response);

    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
