// Importer les models
//const Offer = require("../models/Offer");
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace("Bearer ", "");
      //   console.log(token);
      const user = await User.findOne({ token: token }).select("account_id");
      if (user) {
        // ajouter à req l'objet user
        req.user = user;
        next();
      } else {
        // Sinon ====> unauthorized
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      // Sinon ====> unauthorized
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
