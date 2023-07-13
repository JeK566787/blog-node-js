const express = require("express");
const { getContacts } = require("../controllers/contact-controller");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/contacts", authMiddleware, getContacts);

module.exports = router;
