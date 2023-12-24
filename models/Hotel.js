const mongoose = require("mongoose");
const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    postalcode: {
      type: String,
      required: [true, "Please add a postalcode"],
      maxlength: [5, "Postalcode cannot be more than 5 digits"],
    },
    tel: {
      type: String,
    },
    picture: {
      type: String,
      required: [true, "Please add URL to hotel picture"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Cascade delete bookings when a hotel is deleted
HotelSchema.pre("remove", async function (next) {
  console.log(`Booking being removed from hotel ${this._id}`);
  await this.model("Booking").deleteMany({ hotel: this._id });
  next();
});
// Reverse populate with virtuals
HotelSchema.virtual("bookings", {
  ref: "Booking",
  localField: "_id",
  foreignField: "hotel",
  justOne: false,
});
module.exports = mongoose.model("Hotel", HotelSchema);
