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


 module.exports = {
  ...invCont,
  buildDetailView,
  causeError
}

  