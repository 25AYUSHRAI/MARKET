const express  = require('express');
const validator = require("../middlewares/validator.middleware");
const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.post('/register',validator.registerUserValidations,authController.registerUser);
router.post('/login',validator.loginUserValidation,authController.loginUser);
router.get('/me',authMiddleware.authMiddleware, authController.getCurrentUser);
router.get('/logout',authController.logoutUser);
router.get('/users/me/addresses',authMiddleware.authMiddleware, authController.getUserAddresses);
router.post('/users/me/addresses',authMiddleware.authMiddleware, validator.addressValidation, authController.addUserAddress);
router.delete('/users/me/addresses/:addressId', authMiddleware.authMiddleware, authController.deleteUserAddress);
module.exports = router;