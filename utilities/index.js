// Server-side validation for classification name
const { body, validationResult } = require("express-validator")

const jwt = require("jsonwebtoken")
require("dotenv").config()


function classificationRules() {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage("No spaces or special characters allowed.")
  ]
}

async function checkClassificationData(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await getNav()
    return res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors,
      classification_name: req.body.classification_name,
      messages: req.flash()
    })
  }
  next()
}
const invModel = require("../models/inventory-model")

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
async function getNav() {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* ****************************************
 * Middleware For Handling Errors
 **************************************** */
function handleErrors(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/* **************************************
* Build the classification view HTML
* ************************************ */
async function buildClassificationGrid(data) {
  let grid
  if (data.length > 0) {
    grid = '<div class="vehicle-grid">'
    data.forEach(vehicle => {
      grid += `
        <div class="vehicle-card">
          <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
            <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" class="vehicle-card__img"/>
          </a>
          <div class="vehicle-card__info">
            <h2 class="vehicle-card__title">
              <a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}
              </a>
            </h2>
            <div class="vehicle-card__price">${formatUSD(vehicle.inv_price)}</div>
            <div class="vehicle-card__details">
              <div><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)} miles</div>
              <div><strong>Ext. Color:</strong> ${vehicle.inv_color || "Unknown"}</div>
              <div><strong>Description:</strong> ${vehicle.inv_description || "N/A"}</div>
            </div>
          </div>
        </div>
      `
    })
    grid += '</div>'
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

/* Format price and mileage with commas and currency */
function formatUSD(amount) {
  amount = Number(amount)
  return !isNaN(amount)
    ? amount.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 })
    : ""
}
function formatNumber(num) {
  num = Number(num)
  return !isNaN(num) ? num.toLocaleString("en-US") : ""
}

/* Build vehicle detail HTML */
function buildVehicleDetail(vehicle) {
  return `
    <section class="vehicle-detail">
      <div class="vehicle-detail__left">
        <div class="vehicle-detail__main-img">
          <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">
        </div>
        <!-- Thumbnails could go here if you have them -->
      </div>
      <div class="vehicle-detail__right">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <div class="vehicle-detail__price-box">
          <div class="vehicle-detail__mileage-label">MILEAGE</div>
          <div class="vehicle-detail__mileage">${formatNumber(vehicle.inv_miles)}</div>
          <div class="vehicle-detail__price-label">No-Haggle Price</div>
          <div class="vehicle-detail__price">${formatUSD(vehicle.inv_price)}</div>
        </div>
        <ul class="vehicle-detail__info-list">
          <li><strong>Mileage:</strong> ${formatNumber(vehicle.inv_miles)}</li>
          <li><strong>Ext. Color:</strong> ${vehicle.inv_color || "Unknown"}</li>
          <li><strong>Int. Color:</strong> Black</li>
          <li><strong>Fuel Type:</strong> Gasoline</li>
          <li><strong>Drivetrain:</strong> Front Wheel Drive</li>
          <li><strong>Transmission:</strong> Automatic</li>
          <li><strong>Stock #:</strong> 12345</li>
          <li><strong>VIN:</strong> 1A2B3C4D5E6F7G8H9</li>
        </ul>
        <div class="vehicle-detail__actions">
          <button class="btn btn-green">START MY PURCHASE</button>
          <button class="btn">CONTACT US</button>
          <button class="btn">SCHEDULE TEST DRIVE</button>
          <button class="btn">APPLY FOR FINANCING</button>
        </div>
        <div class="vehicle-detail__contact">
          <div><strong>Call Us</strong><br><a href="tel:8013967886">801-396-7886</a></div>
          <div><strong>Visit Us</strong></div>
        </div>
      </div>
    </section>
  `
}

async function buildClassificationList(classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classificationList" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

function inventoryRules() {
  return [
    body("classification_id").notEmpty().withMessage("Classification is required."),
    body("inv_make").trim().notEmpty().withMessage("Make is required."),
    body("inv_model").trim().notEmpty().withMessage("Model is required."),
    body("inv_year").isInt({ min: 1900, max: 2099 }).withMessage("Year must be a 4-digit number."),
    body("inv_description").trim().notEmpty().withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail").trim().notEmpty().withMessage("Thumbnail path is required."),
    body("inv_price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("inv_miles").isInt({ min: 0 }).withMessage("Miles must be a positive number."),
    body("inv_color").trim().notEmpty().withMessage("Color is required.")
  ]
}

async function checkInventoryData(req, res, next) {
  const errors = validationResult(req)
  let nav = await getNav()
  let classificationList = await buildClassificationList(req.body.classification_id)
  if (!errors.isEmpty()) {
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      errors,
      messages: req.flash(),
      ...req.body
    })
  }
  next()
}

function checkLogin(req, res, next) {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

/* ****************************************
* Middleware to check token validity
**************************************** */
function checkJWTToken(req, res, next) {
  if (req.cookies && req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in")
          res.clearCookie("jwt")
          res.locals.loggedin = false
          res.locals.accountData = null
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      }
    )
  } else {
    res.locals.loggedin = false
    res.locals.accountData = null
    next()
  }
}

function checkInventoryAccess(req, res, next) {
  if (!res.locals.loggedin || !res.locals.accountData) {
    req.flash('notice', 'You must be logged in to access inventory management.')
    return res.redirect('/account/login')
  }
  const type = res.locals.accountData.account_type
  if (type === 'Employee' || type === 'Admin') {
    return next()
  }
  req.flash('notice', 'You do not have permission to access inventory management.')
  return res.redirect('/account/login')
}

/* **************************************
* Build star rating HTML
* ************************************ */
function buildStarRating(rating) {
  let stars = ''
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<span class="star filled">★</span>'
    } else {
      stars += '<span class="star">☆</span>'
    }
  }
  return stars
}

/* **************************************
* Build reviews HTML for detail page
* ************************************ */
function buildReviewsHtml(reviews, ratingData, inv_id) {
  let html = '<div class="reviews-section">'
  
  // Average rating display
  const avgRating = parseFloat(ratingData.avg_rating).toFixed(1)
  const reviewCount = ratingData.review_count
  
  html += '<div class="average-rating">'
  html += '<h3>Customer Reviews</h3>'
  if (reviewCount > 0) {
    html += `<div class="rating-summary">`
    html += `<div class="stars-large">${buildStarRating(Math.round(avgRating))}</div>`
    html += `<div class="rating-text">${avgRating} out of 5 stars (${reviewCount} ${reviewCount === 1 ? 'review' : 'reviews'})</div>`
    html += `</div>`
  } else {
    html += '<p class="no-reviews">No reviews yet. Be the first to review this vehicle!</p>'
  }
  html += '</div>'
  
  // Individual reviews
  if (reviews && reviews.length > 0) {
    html += '<div class="reviews-list">'
    reviews.forEach(review => {
      const reviewDate = new Date(review.review_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      html += `<div class="review-card">`
      html += `<div class="review-header">`
      html += `<div class="review-author">${review.account_firstname} ${review.account_lastname.charAt(0)}.</div>`
      html += `<div class="review-stars">${buildStarRating(review.rating)}</div>`
      html += `</div>`
      html += `<div class="review-date">${reviewDate}</div>`
      html += `<div class="review-text">${review.review_text}</div>`
      html += `</div>`
    })
    html += '</div>'
  }
  
  html += '</div>'
  return html
}

/* **************************************
* Build user's reviews HTML (for account management)
* ************************************ */
function buildUserReviewsHtml(reviews) {
  let html = ''
  
  if (reviews && reviews.length > 0) {
    html += '<div class="user-reviews-list">'
    reviews.forEach(review => {
      const reviewDate = new Date(review.review_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      html += `<div class="user-review-card">`
      html += `<div class="review-vehicle-info">`
      html += `<h4>${review.inv_year} ${review.inv_make} ${review.inv_model}</h4>`
      html += `<div class="review-stars">${buildStarRating(review.rating)}</div>`
      html += `</div>`
      html += `<div class="review-date">${reviewDate}</div>`
      html += `<div class="review-text">${review.review_text}</div>`
      html += `<div class="review-actions">`
      html += `<a href="/review/edit/${review.review_id}" class="btn-edit">Edit</a>`
      html += `<a href="/review/delete/${review.review_id}" class="btn-delete" onclick="return confirm('Are you sure you want to delete this review?')">Delete</a>`
      html += `</div>`
      html += `</div>`
    })
    html += '</div>'
  } else {
    html += '<p class="no-reviews">You have not written any reviews yet.</p>'
  }
  
  return html
}

module.exports = {
  getNav,
  handleErrors,
  buildClassificationGrid,
  buildVehicleDetail,
  buildClassificationList,
  classificationRules,
  checkClassificationData,
  inventoryRules,
  checkInventoryData,
  checkJWTToken,
  checkLogin,
  checkInventoryAccess,
  buildStarRating,
  buildReviewsHtml,
  buildUserReviewsHtml
}