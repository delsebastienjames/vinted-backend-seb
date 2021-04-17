const mongoose = require("mongoose");

// Déclarer un model de User
const User = mongoose.model("User", {
    email: {
        unique: true,
        type: String,
    },
    account: {
        username: {
            type: String,
        },
        phone: String,
        avatar: Object,
    },
    token: String,
    hash: String,
    salt: String,
});

module.exports = User;