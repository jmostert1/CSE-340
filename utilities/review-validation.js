const { body, validationResult } = require("express-validator")
const utilities = require(".")
const reviewModel = require("../models/review-model")

const validate = {}

/* **********************************
 *  Review Data Validation Rules
 * ********************************* */
validate.reviewRules = () => {
  return [
    // rating is required and must be 1-5
    body("rating")
      .trim()
      .notEmpty()
      .withMessage("Please select a rating.")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5 stars."),

    // review_text is required
    body("review_text")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Review must be at least 10 characters long.")
      .isLength({ max: 500 })
      .withMessage("Review must not exceed 500 characters."),
  ]
}

/* ******************************
 * Check data and return errors or continue to add review
 * ***************************** */
validate.checkReviewData = async (req, res, next) => {
  const { inv_id, rating, review_text } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    const invModel = require("../models/inventory-model")
    const vehicle = await invModel.getVehicleById(inv_id)
    const vehicleHtml = utilities.buildVehicleDetail(vehicle)
    
    // Get existing reviews and rating
    const reviews = await reviewModel.getReviewsByVehicle(inv_id)
    const ratingData = await reviewModel.getAverageRating(inv_id)
    const reviewsHtml = utilities.buildReviewsHtml(reviews, ratingData)
    
    res.render("inventory/detail", {
      errors,
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHtml,
      reviewsHtml,
      rating,
      review_text
    })
    return
  }
  next()
}

module.exports = validate
