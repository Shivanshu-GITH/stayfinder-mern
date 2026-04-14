const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const plm = require("passport-local-mongoose");
const passportLocalMongoose = plm.default || plm;

const UserSchema = new Schema({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ["email", "google"],
    default: "email",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },

  // Wishlist feature
  wishlist: [
    {
      type: Schema.Types.ObjectId,
      ref: "Listing",
    },
  ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);