const utilities = require(".")
const { body, validationResult } = require("express-validator")

const validate = {}

/* ******************************
* Inventory Data Validation Rules
* ***************************** */
validate.inventoryRules = () => [
  body("classification_id")
    .trim()
    .isInt({ min: 1 })
    .withMessage("Please select a valid classification."),
  body("inv_make")
    .trim()
    .notEmpty()
    .withMessage("Make is required."),
  body("inv_model")
    .trim()
    .notEmpty()
    .withMessage("Model is required."),
  body("inv_year")
    .trim()
    .isInt({ min: 1900, max: 2099 })
    .withMessage("Year must be a valid 4-digit year."),
  body("inv_description")
    .trim()
    .notEmpty()
    .withMessage("Description is required."),
  body("inv_image")
    .trim()
    .notEmpty()
    .withMessage("Image path is required."),
  body("inv_thumbnail")
    .trim()
    .notEmpty()
    .withMessage("Thumbnail path is required."),
  body("inv_price")
    .trim()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number."),
  body("inv_miles")
    .trim()
    .isInt({ min: 0 })
    .withMessage("Miles must be a positive number."),
  body("inv_color")
    .trim()
    .notEmpty()
    .withMessage("Color is required.")
]

/* ******************************
* Check inventory data and return errors or continue
* ***************************** */
validate.checkInventoryData = async (req, res, next) => {
  const { classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationList = await utilities.buildClassificationList(classification_id)
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}


/* ******************************
* Check update inventory data and return errors to edit view
* ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  const { inv_id, classification_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    let classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    res.render("inventory/edit-inventory", {
      errors,
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      inv_id,
      classification_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color
    })
    return
  }
  next()
}

module.exports = validate