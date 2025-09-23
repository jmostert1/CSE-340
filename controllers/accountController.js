const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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
    // regular password and cost (salt is generated automatically)
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

  // Use hashedPassword instead of account_password
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
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}
/* ****************************************
*  Process Login
* *************************************** */
async function loginAccount(req, res) {
  let nav = await utilities.getNav()
  const { email, password } = req.body

  // Attempt to get the account by email
  const accountData = await accountModel.getAccountByEmail(email)

  if (accountData) {
    // For demonstration, compare plain text (replace with bcrypt in production)
    if (password === accountData.account_password) {
      req.flash("success", `Welcome back, ${accountData.account_firstname}!`)
      // Redirect to account dashboard or home page
      return res.redirect("/account")
    } else {
      req.flash("error", "Invalid email or password.")
      return res.status(401).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        email,
        messages: req.flash()
      })
    }
  } else {
    req.flash("error", "Invalid email or password.")
    return res.status(401).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      email,
      messages: req.flash()
    })
  }
}



module.exports = {
  buildLogin,
  buildRegister,
  registerAccount,
  loginAccount, 
}


