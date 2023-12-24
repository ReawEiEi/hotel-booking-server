const Hotel = require("../models/Hotel");

//@desc     Get all hotels
//@route    GET /api/v1/hotels
//@access   Public
exports.getHotels = async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);
  let queryStr = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  // Finding resource
  let query = Hotel.find(JSON.parse(queryStr));
  // Select
  if (req.query.select) {
    query = query.select(req.query.select.split(",").join(" "));
  }
  // Sort
  query = req.query.sort
    ? query.sort(req.query.sort.split(",").join(" "))
    : query.sort("-createdAt");
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;
  const total = await Hotel.countDocuments();
  query = query.skip(startIdx).limit(limit);
  try {
    // Executing query
    const hotels = await query;
    // Pagination result
    const pagination = {};
    if (endIdx < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIdx > 0) {
      pagination.prev = { page: page - 1, limit };
    }
    res.status(200).json({
      success: true,
      count: hotels.length,
      pagination,
      data: hotels,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single hotel
//@route    GET /api/v1/hotels/:id
//@access   Public
exports.getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create single hotel
//@route    POST /api/v1/hotels
//@access   Private
exports.createHotel = async (req, res, next) => {
  console.log(req.body);
  try {
    const hotel = await Hotel.create(req.body);
    res.status(201).json({ success: true, data: hotel });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

//@desc     Update single hotel
//@route    PUT /api/v1/hotels/:id
//@access   Private
exports.updateHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!hotel) {
      res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: hotel });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single hotel
//@route    DELETE /api/v1/hotels/:id
//@access   Private
exports.deleteHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      res.status(400).json({ success: false });
    }
    hotel.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false });
  }
};
