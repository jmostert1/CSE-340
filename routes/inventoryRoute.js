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

// Route to get inventory by classification as JSON
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit inventory view
// Presents a view to allow editing of an inventory item's information
router.get("/edit/:inventory_id", utilities.handleErrors(invController.buildEditInventory))


const inventoryValidation = require("../utilities/inventory-validation")

// Route to handle inventory update form submission with validation
router.post(
    "/update",
    inventoryValidation.inventoryRules(),
    inventoryValidation.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)


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

// Route to build delete confirmation view
router.get(
    "/delete/:inv_id",
    utilities.handleErrors(invController.buildDeleteInventory)
);

// Route to handle inventory delete form submission
router.post(
    "/delete",
    utilities.handleErrors(invController.deleteInventory)
);

module.exports = router;