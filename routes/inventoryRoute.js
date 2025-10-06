const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities/")
const inventoryValidation = require("../utilities/inventory-validation")

// PUBLIC ROUTES (no middleware) - These MUST come first!
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInvId))
router.get('/cause-error', utilities.handleErrors(invController.causeError))

// ADMIN ROUTES (protected)
router.get("/", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildManagement))
router.get("/add-inventory", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddInventory))
router.get("/add-classification", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildAddClassification))
router.get("/getInventory/:classification_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.getInventoryJSON))
router.get("/edit/:inventory_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildEditInventory))
router.get("/delete/:inv_id", utilities.checkInventoryAccess, utilities.handleErrors(invController.buildDeleteInventory))

router.post(
    "/add-classification",
    utilities.checkInventoryAccess,
    utilities.classificationRules(),
    utilities.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

router.post(
    "/add-inventory",
    utilities.checkInventoryAccess,
    utilities.inventoryRules(),
    utilities.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

router.post(
    "/update",
    utilities.checkInventoryAccess,
    inventoryValidation.inventoryRules(),
    inventoryValidation.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

router.post(
    "/delete",
    utilities.checkInventoryAccess,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router;