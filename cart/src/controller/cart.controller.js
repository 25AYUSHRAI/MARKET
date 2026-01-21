const cartModel  = require('../models/cart.model');
const mongoose = require('mongoose');

async function addItemToCart(req,res) {
    try {
      const {productId,qty}=req.body;
      const user = req.user;
      
      // SECURITY: Validate quantity
      if (!Number.isInteger(qty) || qty <= 0 || qty > 999) {
        return res.status(400).json({message: "Invalid quantity. Must be between 1 and 999"});
      }
      
      let cart = await cartModel.findOne({user : user._id});
      if(!cart){
          cart = new cartModel({user:user._id,items: []});
      }
      const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === productId );
      if(existingItemIndex>=0){
          cart.items[existingItemIndex].quantity += qty;
      }else{
          cart.items.push({productId,quantity:qty});
      }
      await cart.save();
      res.status(200).json({message:"Item added to cart",cart});
    } catch (error) {
      // SECURITY: Don't expose internal error details
      console.error('Error adding item:', error);
      res.status(500).json({message: "An error occurred while adding the item"});
    }
}

async function updateItemQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { qty } = req.body;
    const user = req.user;
    
    // SECURITY: Validate quantity
    if (!Number.isInteger(qty) || qty <= 0 || qty > 999) {
      return res.status(400).json({message: "Invalid quantity. Must be between 1 and 999"});
    }
    
    let cart = await cartModel.findOne({user : user._id});
    if(!cart){
      return res.status(404).json({message: "Cart not found"});
    }
    
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if(itemIndex < 0){
      return res.status(404).json({message: "Item not found in cart"});
    }
    
    if(qty <= 0){
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = qty;
    }
    
    await cart.save();
    res.status(200).json({message: "Item quantity updated", cart});
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error updating item:', error);
    res.status(500).json({message: "An error occurred while updating the item"});
  }
}

async function getCart(req , res){
    try {
      const user =req.user;
      const cart = await cartModel.findOne({user:user._id});

      if(!cart){
        cart = new cartModel({user:user._id,items:[]});
        await cart.save();
      }
      return res.status(200).json({
        cart,
        totals:{
          itemCount : cart.items.length,
          totalQuantity : cart.items.reduce((sum,item)=>sum+item.quantity, 0)
        }
      })
    } catch (error) {
      // SECURITY: Don't expose internal error details
      console.error('Error fetching cart:', error);
      res.status(500).json({message: "An error occurred while fetching the cart"});
    }
}
async function deleteItemInCart(req,res){
  try {
    const {productId} = req.params;
    const user = req.user;
    
    // SECURITY: Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({message:"Invalid product ID format"});
    }
    
    const cart = await cartModel.findOne({user:user._id});
    if(!cart){
      return res.status(404).json({message:"Cart not found"});
    }
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    return res.status(200).json({message:"Item removed from cart",cart});
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error deleting item:', error);
    res.status(500).json({message: "An error occurred while deleting the item"});
  }
}
async function deleteCart(req,res){
  try {
    const user = req.user;
    const cart = await cartModel.findOneAndDelete({user:user._id});
    if(!cart){
      return res.status(404).json({message:"Cart not found"});
    }
    return res.status(200).json({message:"Cart deleted successfully"});
  } catch (error) {
    // SECURITY: Don't expose internal error details
    console.error('Error deleting cart:', error);
    res.status(500).json({message: "An error occurred while deleting the cart"});
  }
}

module.exports = {addItemToCart, updateItemQuantity,getCart,deleteItemInCart,deleteCart};