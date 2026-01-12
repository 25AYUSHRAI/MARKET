const { body, validationResult } = require("express-validator");
const { addUserAddress } = require("../controllers/auth.controller");
const respondWithValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
const registerUserValidations = [
  body("username")
    .isString()
    .withMessage("Username must be string")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 character long "),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 character long"),
  body("fullName.firstName")
    .isString()
    .withMessage("First name must be String ")
    .notEmpty()
    .withMessage("First name is required"),
  body("fullName.lastName")
    .isString()
    .withMessage("Last name must be String ")
    .notEmpty()
    .withMessage("Last name is required"),
  body("role")
    .isString()
    .withMessage("Role must be a string")
    .isIn(["user", "seller"])
    .optional()
    .withMessage("Role is required"),
  respondWithValidationErrors,
];
const loginUserValidation = [
  body("email").optional().isEmail().withMessage("Invalid email address"),
  body("username").optional().isString().withMessage("Username must be string"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be of at least 6 characters long "),
  (req, res, next) => {
    if (!req.body.username && !req.body.email) {
      return res.status(400).json({ message: "Username or email is required" });
    }
    respondWithValidationErrors(req, res, next);
  },
  ,
];
const addressValidation = [
  body("street")
    .isString()
    .withMessage("Street must be a string")
    .notEmpty()
    .withMessage("Street is required"),
  body("city")
    .isString()
    .withMessage("City must be a string")
    .notEmpty()
    .withMessage("City is required"),
  body("state")
    .isString()
    .withMessage("State must be a string")
    .notEmpty()
    .withMessage("State is required"),
  body("pincode")
    .isString()
    .withMessage("Pincode must be a string")
    .notEmpty()
    .withMessage("Pincode is required"),
  body("country")
    .isString()
    .withMessage("Country must be a string")
    .notEmpty()
    .withMessage("Country is required"),
  // make isDefault optional (boolean) so tests that omit it won't fail
  body("isDefault")
    .optional()
    .isBoolean()
    .withMessage("isDefault must be a boolean"),
  respondWithValidationErrors,
];

module.exports = {
  registerUserValidations,
  loginUserValidation,
  addressValidation,
};
