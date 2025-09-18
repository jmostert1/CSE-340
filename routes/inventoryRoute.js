// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Intentional error route
router.get('/cause-error', utilities.handleErrors(invController.causeError))


module.exports = router;