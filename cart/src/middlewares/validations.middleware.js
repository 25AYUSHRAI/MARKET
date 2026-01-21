const { body, param, validationResult } = require("express-validator");
const mongoose = require("mongoose");

function validateResult(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

const validateAddItemToCart = [
  body("productId")
    .isString()
    .withMessage("Product Id must be string ")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product id format "),
  body("qty").isInt({ gt: 0 }).withMessage("Quantity must be positive number "),
  validateResult,
];

const validateUpdateToCartItem =[
    param("productId")
    .isString()
    .withMessage("Product Id must be string ")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product id format "),
  body("qty").isInt({ gt: 0 }).withMessage("Quantity must be positive number "),
  validateResult,
]

// SECURITY: Added validation for DELETE item route
const validateDeleteItem = [
  param("productId")
    .isString()
    .withMessage("Product Id must be string ")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid product id format "),
  validateResult,
];

module.exports = {validateAddItemToCart, validateUpdateToCartItem, validateDeleteItem}
