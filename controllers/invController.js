const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* Build vehicle detail view */
async function buildDetailView(req, res, next) {
  const inv_id = req.params.inv_id
  const nav = await utilities.getNav()
  const vehicle = await invModel.getVehicleById(inv_id)
  if (!vehicle) {
    return next({ status: 404, message: "Vehicle not found." })
  }
  const vehicleHtml = utilities.buildVehicleDetail(vehicle)
  res.render("inventory/detail", {
    title: `${vehicle.inv_make} ${vehicle.inv_model}`,
    nav,
    vehicleHtml
  })
}

/* Intentional error generator */
function causeError(req, res, next) {
  // This will trigger the error middleware
  throw new Error("Intentional server error for testing purposes.")
}

/* ***************************
 *  Build inventory management view
 * ************************** */
async function buildManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    messages: req.flash()
  })
}

async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    messages: req.flash()
  })
}

async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    messages: req.flash()
  })
}

// Add classification to database
async function addClassification(req, res, next) {
  let nav = await utilities.getNav()
  const { classification_name } = req.body
  try {
    const result = await invModel.addClassification(classification_name)
    if (result && result.rowCount > 0) {
      req.flash("notice", "Classification added successfully!")
      nav = await utilities.getNav() 
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash()
      })
    } else {
      req.flash("error", "Failed to add classification.")
      return res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        messages: req.flash(),
        classification_name
      })
    }
  } catch (error) {
    req.flash("error", "An error occurred.")
    return res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      messages: req.flash(),
      classification_name
    })
  }
}

// Add inventory item to database
async function addInventory(req, res, next) {
  let nav = await utilities.getNav()
  let classificationList = await utilities.buildClassificationList(req.body.classification_id)
  const {
    classification_id, inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
  } = req.body

  try {
    const result = await invModel.addInventory(
      classification_id, inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles, inv_color
    )
    if (result && result.rowCount > 0) {
      req.flash("notice", "Inventory item added successfully!")
      nav = await utilities.getNav()
      return res.status(201).render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash()
      })
    } else {
      req.flash("error", "Failed to add inventory item.")
      return res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        classificationList,
        messages: req.flash(),
        ...req.body 
      })
    }
  } catch (error) {
    req.flash("error", "An error occurred.")
    return res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash(),
      ...req.body
    })
  }
}



module.exports = {
  ...invCont,
  buildDetailView,
  causeError,
  buildManagement,
  buildAddInventory,
  buildAddClassification,
  addClassification,
  addInventory
}
  