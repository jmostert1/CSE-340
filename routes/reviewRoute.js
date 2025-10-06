const express = require("express")
const router = new express.Router()
const reviewController = require("../controllers/reviewController")
const utilities = require("../utilities/")
const reviewValidation = require("../utilities/review-validation")

// All review routes require login
router.post(
  "/add",
  utilities.checkLogin,
  reviewValidation.reviewRules(),
  reviewValidation.checkReviewData,
  utilities.handleErrors(reviewController.submitReview)
)

// User's review management
router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildUserReviews)
)

router.get(
  "/edit/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.buildEditReview)
)

router.post(
  "/update",
  utilities.checkLogin,
  reviewValidation.reviewRules(),
  utilities.handleErrors(reviewController.updateReview)
)

router.get(
  "/delete/:review_id",
  utilities.checkLogin,
  utilities.handleErrors(reviewController.deleteReview)
)

module.exports = router
