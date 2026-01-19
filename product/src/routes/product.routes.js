const express = require("express");
const multer = require("multer");
const productController = require("../controllers/productController");
const router = express.Router();

const { createAuthMiddleware } = require("../middlewares/auth.middleware.js");
const { validateProduct } = require('../validators/product.validator.js');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  createAuthMiddleware(["admin", "seller"]),
  upload.array("images", 5),
  validateProduct, productController.createProduct
);
router.get('/',productController.getProducts)
router.get('/seller',createAuthMiddleware(['seller']),productController.getProductsBySeller);
router.get('/:id',productController.getProductById);
router.patch('/:id', createAuthMiddleware(["seller"]), productController.updateProduct);
router.delete('/:id', createAuthMiddleware(["seller"]), productController.deleteProduct);
module.exports = router;
