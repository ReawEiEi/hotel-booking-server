/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - name
*         - email
*         - tel
*         - password
*       properties:
*         name:
*           type: string
*           description: Name of user
*         email:
*           type: string
*           description: Email of user
*         tel:
*           type: string
*           description: Telephone number of user
*         role:
*           type: string
*           description: Role of user (admin or user), default is user
*         password:
*           type: string
*           description: Password of user 
*         createdAt:
*           type: string
*           format: date
*           example: '2023-08-20'
*           description: Date of creation (default is current date-time)
*/

/**
* @swagger
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*/


/**
* @swagger
* tags:
*   name: User
*   description: The user API
*/

const express = require("express");
const { register, login, getMe, logout } = require("../controllers/auth");
const router = express.Router();
const { protect } = require("../middleware/auth");

/**
* @swagger
* /auth/register:
*   post:
*     summary: Create a new user
*     tags: [User]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       201:
*         description: The user was successfully created
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       500:
*         description: Some server error
*/
router.post("/register", register);

/**
* @swagger
* /auth/login:
*   post:
*     summary: Log-in to the system
*     tags: [User]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties: 
*               email: 
*                   type: string
*               password: 
*                   type: string
*     responses:
*       201:
*         description: Log-in Successfully
*       500:
*         description: Some server error
*/
router.post("/login", login);
router.get("/logout", logout);

/**
* @swagger
* /auth/me:
*   get:
*     security:
*       - bearerAuth: []
*     summary: Return information about me
*     tags: [User]
*     responses:
*       200:
*         description: My user profile
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/User'
*       500:
*         description: Some server error
*/
router.get("/me", protect, getMe);
module.exports = router;
