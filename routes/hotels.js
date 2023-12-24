/**
* @swagger
* components:
*   schemas:
*     Hotel:
*       type: object
*       required:
*         - name
*         - address
*         - district
*         - province
*         - postalcode
*         - picture
*       properties:
*         name:
*           type: string
*           description: Name of the hotel
*         address:
*           type: string
*           description: House No., Street, Road
*         district:
*           type: string
*           description: District
*         province:
*           type: string
*           description: province
*         postalcode:
*           type: string
*           description: 5-digit postal code 
*         tel:
*           type: string
*           description: telephone number
*         picture:
*           type: string
*           description: picture
*/

const express = require("express");
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
} = require("../controllers/hotels");

/**
* @swagger
* tags:
*   name: Hotels
*   description: The hotels managing API
*/

// Include other resource routers
const bookingRouter = require("./bookings");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");

// Re-route into other resource routers

/**
* @swagger
* /hotels:
*   post:
*     security:
*       - bearerAuth: []
*     summary: Create a new hotel
*     tags: [Hotels]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Hotel'
*     responses:
*       201:
*         description: The hotel was successfully created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Hotel'
*       500:
*         description: Some server error
*/

/**
* @swagger
* /hotels:
*   get:
*     summary: Returns the list of all the hotels
*     tags: [Hotels]
*     responses:
*       200:
*         description: The list of the hotels
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*               $ref: '#/components/schemas/Hotel'
*/
router.use("/:hotelId/bookings", bookingRouter);
router
  .route("/")
  .get(getHotels)
  .post(protect, authorize("admin"), createHotel);

/**
* @swagger
* /hotels/{id}:
*   get:
*     summary: Get the hotel by id
*     tags: [Hotels]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The hotel id
*     responses:
*       200:
*         description: The hotel description by id
*         contents:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Hotel'
*       404:
*         description: The hotel was not found
*/

/**
* @swagger
* /hotels/{id}:
*   put:
*     security:
*       - bearerAuth: []
*     summary: Update the hotel by id
*     tags: [Hotels]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The hotel id
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/Hotel'
*     responses:
*       200:
*         description: The hotel was successfully updated
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Hotel'
*       500:
*         description: Some server error
*/

/**
* @swagger
* /hotels/{id}:
*   delete:
*     security:
*       - bearerAuth: []
*     summary: Delete the hotel by id
*     tags: [Hotels]
*     parameters:
*       - in: path
*         name: id
*         schema:
*           type: string
*         required: true
*         description: The hotel id
*     responses:
*       200:
*         description: The hotel was successfully deleted
*         contents:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Hotel'
*       404:
*         description: The hotel was not found
*/
router
  .route("/:id")
  .get(getHotel)
  .put(protect, authorize("admin"), updateHotel)
  .delete(protect, authorize("admin"), deleteHotel);

module.exports = router;
