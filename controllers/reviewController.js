const reviewModel = require("../models/review-model")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const reviewCont = {}

/* ***************************
 *  Submit a new review
 * ************************** */
reviewCont.submitReview = async function (req, res, next) {
  const { inv_id, review_text, rating } = req.body
  const account_id = res.locals.accountData.account_id

  try {
    // Check if user already reviewed this vehicle
    const existingReview = await reviewModel.checkExistingReview(inv_id, account_id)
    
    if (existingReview) {
      req.flash("notice", "You have already reviewed this vehicle.")
      return res.redirect(`/inv/detail/${inv_id}`)
    }

    // Check if vehicle exists
    const vehicle = await invModel.getVehicleById(inv_id)
    if (!vehicle) {
      req.flash("notice", "Vehicle not found.")
      return res.redirect("/")
    }

    // Add the review
    const result = await reviewModel.addReview(inv_id, account_id, review_text, rating)
    
    if (result && result.review_id) {
      req.flash("notice", "Thank you for your review!")
      res.redirect(`/inv/detail/${inv_id}`)
    } else {
      req.flash("notice", "Sorry, there was an error submitting your review.")
      res.redirect(`/inv/detail/${inv_id}`)
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error submitting your review.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

/* ***************************
 *  Build user's review management view
 * ************************** */
reviewCont.buildUserReviews = async function (req, res, next) {
  let nav = await utilities.getNav()
  const account_id = res.locals.accountData.account_id
  
  try {
    const reviews = await reviewModel.getReviewsByUser(account_id)
    const reviewsHtml = utilities.buildUserReviewsHtml(reviews)
    
    res.render("account/my-reviews", {
      title: "My Reviews",
      nav,
      reviewsHtml,
      errors: null,
    })
  } catch (error) {
    req.flash("notice", "Sorry, there was an error loading your reviews.")
    res.redirect("/account/")
  }
}

/* ***************************
 *  Build edit review view
 * ************************** */
reviewCont.buildEditReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  let nav = await utilities.getNav()
  
  try {
    const reviews = await reviewModel.getReviewsByUser(res.locals.accountData.account_id)
    const review = reviews.find(r => r.review_id === review_id)
    
    if (!review) {
      req.flash("notice", "Review not found.")
      return res.redirect("/account/reviews")
    }
    
    res.render("account/edit-review", {
      title: "Edit Review",
      nav,
      review,
      errors: null,
    })
  } catch (error) {
    req.flash("notice", "Sorry, there was an error loading the review.")
    res.redirect("/account/reviews")
  }
}

/* ***************************
 *  Update a review
 * ************************** */
reviewCont.updateReview = async function (req, res, next) {
  const { review_id, review_text, rating } = req.body
  
  try {
    const result = await reviewModel.updateReview(review_id, review_text, rating)
    
    if (result && result.review_id) {
      req.flash("notice", "Review updated successfully!")
      res.redirect("/account/reviews")
    } else {
      req.flash("notice", "Sorry, there was an error updating your review.")
      res.redirect(`/account/reviews/edit/${review_id}`)
    }
  } catch (error) {
    req.flash("notice", "Sorry, there was an error updating your review.")
    res.redirect(`/account/reviews/edit/${review_id}`)
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
reviewCont.deleteReview = async function (req, res, next) {
  const review_id = parseInt(req.params.review_id)
  
  try {
    const result = await reviewModel.deleteReview(review_id)
    
    if (result > 0) {
      req.flash("notice", "Review deleted successfully.")
    } else {
      req.flash("notice", "Sorry, there was an error deleting your review.")
    }
    res.redirect("/account/reviews")
  } catch (error) {
    req.flash("notice", "Sorry, there was an error deleting your review.")
    res.redirect("/account/reviews")
  }
}

module.exports = reviewCont
