const pool = require("../database/")

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(inv_id, account_id, review_text, rating) {
  try {
    const sql = `INSERT INTO reviews (inv_id, account_id, review_text, rating) 
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *`
    const result = await pool.query(sql, [inv_id, account_id, review_text, rating])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get all reviews for a vehicle
 * ************************** */
async function getReviewsByVehicle(inv_id) {
  try {
    const sql = `SELECT r.review_id, r.inv_id, r.account_id, r.review_text, r.rating, r.review_date,
                        a.account_firstname, a.account_lastname
                 FROM reviews r
                 INNER JOIN account a ON r.account_id = a.account_id
                 WHERE r.inv_id = $1
                 ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get average rating for a vehicle
 * ************************** */
async function getAverageRating(inv_id) {
  try {
    const sql = `SELECT 
                   COALESCE(AVG(rating), 0) as avg_rating,
                   COUNT(*) as review_count
                 FROM reviews
                 WHERE inv_id = $1`
    const result = await pool.query(sql, [inv_id])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Check if user already reviewed a vehicle
 * ************************** */
async function checkExistingReview(inv_id, account_id) {
  try {
    const sql = `SELECT review_id FROM reviews 
                 WHERE inv_id = $1 AND account_id = $2`
    const result = await pool.query(sql, [inv_id, account_id])
    return result.rowCount > 0
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Get all reviews by a specific user
 * ************************** */
async function getReviewsByUser(account_id) {
  try {
    const sql = `SELECT r.review_id, r.inv_id, r.review_text, r.rating, r.review_date,
                        i.inv_make, i.inv_model, i.inv_year
                 FROM reviews r
                 INNER JOIN inventory i ON r.inv_id = i.inv_id
                 WHERE r.account_id = $1
                 ORDER BY r.review_date DESC`
    const result = await pool.query(sql, [account_id])
    return result.rows
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Update a review
 * ************************** */
async function updateReview(review_id, review_text, rating) {
  try {
    const sql = `UPDATE reviews 
                 SET review_text = $1, rating = $2 
                 WHERE review_id = $3 
                 RETURNING *`
    const result = await pool.query(sql, [review_text, rating, review_id])
    return result.rows[0]
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(review_id) {
  try {
    const sql = `DELETE FROM reviews WHERE review_id = $1`
    const result = await pool.query(sql, [review_id])
    return result.rowCount
  } catch (error) {
    return error.message
  }
}

module.exports = {
  addReview,
  getReviewsByVehicle,
  getAverageRating,
  checkExistingReview,
  getReviewsByUser,
  updateReview,
  deleteReview
}
