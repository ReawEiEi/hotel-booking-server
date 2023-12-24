const Booking = require("../models/Booking");
const Hotel = require("../models/Hotel");
const User = require("../models/User");
const { validateBookingAndCheckoutDate } = require("../utils/date");
const { sendMail } = require("./mails");

//@desc     Get all bookings
//@route    GET /api/v1/bookings
//@access   Private
exports.getBookings = async (req, res, next) => {
  let query;
  //let hotelId = req.params.hotelId;
  let hotelId = req.query["hotelId"];
  if (req.user.role !== "admin") 
  {
    if (hotelId) {
      query = Booking.find({
        user: req.user.id,
        hotel: hotelId,
      }).populate({
        path: "hotel",
        select: "name address tel",
      });
    } else {
      query = Booking.find({
        user: req.user.id,
      }).populate({
        path: "hotel",
        select: "name address tel",
      });
    }
  } 
  else 
  {
    if (hotelId) {
      query = Booking.find({ hotel: hotelId }).populate({
        path: "hotel",
        select: "name address tel",
      }).populate({
        path: "user",
        select: "name email tel",
      });
    } else {
      query = Booking.find().populate({
        path: "hotel",
        select: "name address tel",
      }).populate({
        path: "user",
        select: "name email tel",
      });
    }
  }
  try {
    const bookings = await query;
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Get single booking
//@route    GET /api/v1/bookings/:id
//@access   Private
exports.getBooking = async (req, res, next) => {
  let booking;
  try 
  {
    booking = await Booking.findById(req.params.id).populate({
      path: "hotel",
      select: "name address tel",
    }).populate({
      path: "user",
      select: "name email tel",
    });
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }

    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to view this booking`,
      });
    }

    res.status(200).json({ success: true, data: booking });
  } 
  catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Booking" });
  }
};

//@desc     Add booking
//@route    POST /api/v1/hotels/:hotelId/bookings
//@access   Private
exports.addBooking = async (req, res, next) => {
  try {
    req.body.hotel = req.params.hotelId;
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: `No hotel with the id of ${req.params.hotelId}`,
      });
    }
    req.body.user = req.user.id;

    // only allow the registered user to book up to 3 nights
    const bookingDate = new Date(req.body.bookingDate);
    const checkoutDate = new Date(req.body.checkoutDate);
    const isValidDate = validateBookingAndCheckoutDate(
      bookingDate,
      checkoutDate
    );
    if (!isValidDate.bookBeforeCheckout) {
      return res.status(400).json({
        success: false,
        message: `The checkout date should be after the booking date.`,
      });
    } else if (!isValidDate.notMoreThanThreeNights) {
      return res.status(400).json({
        success: false,
        message: `Sorry, You can only book up to 3 nights.`,
      });
    } else {
      const booking = await Booking.create(req.body);
      res.status(200).json({
        success: true,
        data: booking,
      });

      User.findById(req.user.id, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          sendMail(user, booking);
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot create Booking",
    });
  }
};

//@desc     Update booking
//@route    PUT /api/v1/bookings/:id
//@access   Private
exports.updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this booking`,
      });
    }

    // check the booking period not exceed 3 nights
    if (req.body.bookingDate) {
      const bookingDate = new Date(req.body.bookingDate);
      if (req.body.checkoutDate) {
        const checkoutDate = new Date(req.body.checkoutDate);
        const isValidDate = validateBookingAndCheckoutDate(
          bookingDate,
          checkoutDate
        );
        if (!isValidDate.bookBeforeCheckout) {
          return res.status(400).json({
            success: false,
            message: `The checkout date should be after the booking date.`,
          });
        } else if (!isValidDate.notMoreThanThreeNights) {
          return res.status(400).json({
            success: false,
            message: `Sorry, You can only book up to 3 nights.`,
          });
        }
      } else {
        const isValidDate = validateBookingAndCheckoutDate(
          bookingDate,
          booking.checkoutDate
        );
        if (!isValidDate.bookBeforeCheckout) {
          return res.status(400).json({
            success: false,
            message: `Cannot change booking date to be after or same ascheckout date.`,
          });
        } else if (!isValidDate.notMoreThanThreeNights) {
          return res.status(400).json({
            success: false,
            message: `Sorry, You can only book up to 3 nights.`,
          });
        }
      }
    } else if (req.body.checkoutDate) {
      const checkoutDate = new Date(req.body.checkoutDate);
      const isValidDate = validateBookingAndCheckoutDate(booking.bookingDate, checkoutDate);
      if (!isValidDate.bookBeforeCheckout) {
        return res.status(400).json({
          success: false,
          message: `Cannot change checkout date to be before or same as booking date.`,
        });
      } else if (!isValidDate.notMoreThanThreeNights) {
        return res.status(400).json({
          success: false,
          message: `Sorry, You can only book up to 3 nights.`,
        });
      }
    }
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot update Booking",
    });
  }
};

//@desc     Delete booking
//@route    DELETE /api/v1/bookings/:id
//@access   Private
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: `No booking with the id of ${req.params.id}`,
      });
    }
    if (booking.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this booking`,
      });
    }
    await booking.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete Booking",
    });
  }
};
