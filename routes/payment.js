const express = require("express");
const formidable = require("express-formidable");
const cors = require("cors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(formidable());
app.use(cors());

app.post("/payment", async (req, res) => {
  try {
    // Recevoir un stripeToken
    // console.log(req.fields.stripeToken);
    // Envoyer le token à l'API Stripe
    // Pour sécuriser au max les choses : chercher en BDD le prix du produit acheté
    const response = await stripe.charges.create({
      amount: 2000, // req.fields.price * 100
      currency: "eur",
      description: "La description du produit acheté",
      source: req.fields.stripeToken,
    });
    // Recevoir une réponse de l'API Stripe
    // console.log(response);
    if (response.status === "succeeded") {
      res.status(200).json({ message: "Paiement validé" });
    } else {
      res.status(400).json({ message: "An error occured" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(3001, () => {
  console.log("Server Started");
});
