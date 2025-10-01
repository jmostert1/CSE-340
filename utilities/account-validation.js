const utilities = require(".")
const { body, validationResult } = require("express-validator")
const accountModel = require("../models/account-model")
const validate = {}

/*  **********************************
*  Registration Data Validation Rules
* ********************************* */
validate.registrationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),
    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email)
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.")
        }
      }),
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ]
}

/* ******************************
* Check registration data and return errors or continue
* ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}

/*  **********************************
*  Login Data Validation Rules
* ********************************* */
validate.loginRules = () => [
  body("account_email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required."),
  body("account_password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
]

/* ******************************
* Check login data and return errors or continue
* ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { email } = req.body
  let errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      email,
    })
    return
  }
  next()
}


// Account update validation rules
validate.updateAccountRules = () => [
  body("account_firstname")
    .trim()
    .notEmpty().withMessage("First name is required."),
  body("account_lastname")
    .trim()
    .notEmpty().withMessage("Last name is required."),
  body("account_email")
    .trim()
    .isEmail().withMessage("A valid email is required.")
    .custom(async (email, { req }) => {
      const account_id = req.body.account_id
      const existing = await accountModel.getAccountByEmail(email)
      if (existing && existing.account_id != account_id) {
        throw new Error("Email already exists. Please use a different email.")
      }
    })
]

// Password update validation rules
validate.passwordUpdateRules = () => [
  body("account_password")
    .isStrongPassword({
      minLength: 12,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage("Password must be at least 12 characters, include an uppercase letter, a number, and a special character.")
]

// Error handling for account update
validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const account = await accountModel.getAccountById(req.body.account_id)
    return res.render("account/update", {
      title: "Update Account",
      errors: errors.array(),
      account,
      account_firstname: req.body.account_firstname,
      account_lastname: req.body.account_lastname,
      account_email: req.body.account_email,
      messages: req.flash(),
    })
  }
  next()
}

// Error handling for password update
validate.checkPasswordData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const account = await accountModel.getAccountById(req.body.account_id)
    const nav = await utilities.getNav()
    return res.render("account/update", {
      title: "Update Account",
      nav,
      errors: errors.array(),
      account,
      messages: req.flash(),
    })
  }
  next()
}

module.exports = validate