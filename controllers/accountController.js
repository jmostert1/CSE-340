const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    errors: null,
    email: "",
    messages: req.flash()
  })
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  // Hash the password before storing
  let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
    return
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult && regResult.rows && regResult.rows.length > 0) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).redirect("/account/login")
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  console.log('Login attempt:', { account_email })
  console.log('Account data found:', !!accountData)

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      messages: req.flash()
    })
  }

  try {
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password)
    if (passwordMatch) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      console.log("JWT cookie set:", accessToken)
      return res.redirect("/account/")
    } else {
      req.flash("notice", "Please check your credentials and try again.")
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
        messages: req.flash()
      })
    }
  } catch (error) {
    req.flash("notice", "Access Forbidden")
    return res.status(403).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      messages: req.flash()
    })
  }
}
/* ****************************************
*  Deliver account management view
* *************************************** */
async function buildAccountManagement(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/account-management", {
    title: "Account Management",
    nav,
    messages: req.flash(),
    errors: null
  })
}


/**
 * Logout controller: clears JWT cookie, resets locals, redirects to login
 */
function logout(req, res) {
  res.clearCookie("jwt")
  res.locals.loggedin = false
  res.locals.accountData = null
  req.flash("notice", "You have been logged out.")
  res.redirect("/")
}


// Deliver update view
async function buildUpdateAccount(req, res) {
  const account_id = req.params.account_id
  const account = await accountModel.getAccountById(account_id)
  const nav = await utilities.getNav()
  res.render("account/update", {
    title: "Update Account",
    nav,
    account,
    messages: req.flash(),
    errors: [],
  })
}

// Process account update
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body
  const updateResult = await accountModel.updateAccount(account_firstname, account_lastname, account_email, account_id)
  if (updateResult) {
    req.flash("notice", "Account updated successfully.")
    // Refresh JWT token with new info
    const updatedAccount = await accountModel.getAccountById(account_id)
    const token = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
    res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000 })
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Account update failed.")
    const account = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Account",
      nav,
      account,
      messages: req.flash(),
      errors: [],
      account_firstname,
      account_lastname,
      account_email,
    })
  }
}

// Process password update
async function updatePassword(req, res) {
  const { account_password, account_id } = req.body
  const hashedPassword = await bcrypt.hash(account_password, 10)
  const updateResult = await accountModel.updatePassword(hashedPassword, account_id)
  if (updateResult) {
    req.flash("notice", "Password updated successfully.")
    return res.redirect("/account/")
  } else {
    req.flash("notice", "Password update failed.")
    const account = await accountModel.getAccountById(account_id)
    const nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Account",
      nav,
      account,
      messages: req.flash(),
      errors: [],
    })
  }
}

module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  accountLogin,
  buildAccountManagement,
  logout,
  buildUpdateAccount,
  updateAccount,
  updatePassword
}

