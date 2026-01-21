const express = require('express');
const router = express.Router();
const cartController = require('../controller/cart.controller');
const { createAuthMiddleware } = require("../middlewares/auth.middleware");
const validate = require('../middlewares/validations.middleware');

router.get('/',createAuthMiddleware(['user']),cartController.getCart);
router.post("/items", validate.validateAddItemToCart, createAuthMiddleware(['user']), cartController.addItemToCart);
router.patch("/items/:productId", validate.validateUpdateToCartItem,createAuthMiddleware(['user']), cartController.updateItemQuantity);
// SECURITY: Added validation middleware to DELETE route
router.delete("/items/:productId", validate.validateDeleteItem, createAuthMiddleware(['user']),cartController.deleteItemInCart);
router.delete("/",createAuthMiddleware(['user']),cartController.deleteCart);
module.exports = router;