// Needed Resources 
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);


// Intentional error route
router.get('/cause-error', utilities.handleErrors(invController.causeError))

// Route to build inventory management view
router.get("/", utilities.handleErrors(invController.buildManagement));
// Route to build add inventory view
router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));
// Route to build add classification view   
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Process the add classification data
router.post(
    "/add-classification",
    utilities.classificationRules(),
    utilities.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

// Process the add inventory data
router.post(
    "/add-inventory",
    utilities.inventoryRules(),
    utilities.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)





module.exports = router;