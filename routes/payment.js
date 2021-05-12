const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");
const createStripe = require("stripe");

/* clé stripe */
const stripe = createStripe(process.env.STRIPE_API_SECRET);

const app = express();
app.use(formidable());
app.use(cors());

app.post("/payment", async (req, res) => {
  try {
    // Envoyer le token à l'API Stripe
    let { status } = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement vinted pour : ${req.fields.title}`,
      source: req.fields.token,
    });
    // Recevoir une réponse de l'API Stripe
    // console.log(response);

    res.json({ status });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
