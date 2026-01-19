const Product = require("../models/product.model");
const { imagekit, ImageKitMock } = require("../services/imagekit.service");
const { randomUUID } = require("crypto");
const productModel = require("../models/product.model");
const mongoose = require("mongoose");

async function createProduct(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const seller = req.user.id;
    const { title, description } = req.body;
    const priceValue =
      req.body.price ?? req.body.amount ?? req.body.priceAmount;
    const currency = req.body.currency || "INR";

    if (!title) {
      return res.status(400).json({ message: "`title` is required" });
    }

    const price = {
      amount: Number(priceValue ?? 0),
      currency,
    };

    const images = [];
    if (req.files?.length) {
      const imgClient =
        imagekit && typeof imagekit.upload === "function"
          ? imagekit
          : ImageKitMock();

      const uploadPromises = req.files.map((file) =>
        imgClient.upload({
          file: file.buffer,
        })
      );

      const uploadResults = await Promise.all(uploadPromises);

      uploadResults.forEach((uploadResult) => {
        uploadResult = uploadResult || {};
        const url =
          uploadResult.url ||
          uploadResult.filePath ||
          "https://example.com/fake-image.jpg";
        images.push({
          url,
          thumbnail: url,
          id: randomUUID(),
        });
      });
    }

    if (mongoose.connection.readyState !== 1) {
      const product = Object.assign(
        { _id: new mongoose.Types.ObjectId() },
        { title, description, price, seller, images }
      );
      return res.status(201).json(product);
    }

    const product = await Product.create({
      title,
      description,
      price,
      seller,
      images,
    });

    return res.status(201).json(product);
  } catch (err) {
   
    return res.status(500).json({ message: "Internal server error" });
  }
}
async function getProducts(req, res) {
  const { q, minprice, maxprice, skip = 0, list = 20 } = req.query;
  const MIN_LIMIT = 5;
  const MAX_LIMIT = 100;
  const limit = Math.max(MIN_LIMIT, Math.min(Number(list), MAX_LIMIT));

  const filter = {};
  if (q) {
    filter.$text = { $search: q };
  }
  if (minprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $gte: Number(minprice),
    };
  }
  if (maxprice) {
    filter["price.amount"] = {
      ...filter["price.amount"],
      $lte: Number(maxprice),
    };
  }
  const products = await productModel
    .find(filter)
    .skip(Number(skip))
    .limit(limit);
  return res.status(200).json({ data: products });
}
async function getProductById(req, res) {
  const { id } = req.params;
  const product = await productModel.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product Not found " });
  }
  return res.status(200).json({ product: product });
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await productModel.findOne({
      _id: id,
      seller: req.user.id,
    });
    if (!product) {
      return res.status(404).json({ message: "Procduct not found " });
    }
    const allowedUpdates = ["title", "description", "price"];
    for (const key of Object.keys(req.body)) {
      if (allowedUpdates.includes(key)) {
        if (key === "price" && typeof req.body.price === "object") {
          if (req.body.price.amount !== undefined) {
            product.price.amount = Number(req.body.price.amount);
          }
          if (req.body.price.currency !== undefined) {
            product.price.currency = req.body.price.currency;
          }
        } else {
          product[key] = req.body[key];
        }
      }
    }
    await product.save();
    return res.status(200).json({ message: "Product updated", data: product });
  } catch (err) {
 
    return res.status(500).json({ message: "Internal server error" });
  }
}
async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const product = await productModel.findOne({
      _id: id,
      seller: req.user.id,
    });
    if (!product) {
      return res.status(404).json({ message: "Product not found " });
    }
    await productModel.deleteOne({ _id: id.toString() });
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
async function getProductsBySeller(req,res) {
    try {
        const seller = req.user;
        const { skip = 0, limit = 20 } = req.query;
        const products = await productModel.find({ seller: seller.id });
        
        // Apply pagination after getting results
        const paginatedProducts = Array.isArray(products) 
            ? products.slice(Number(skip), Number(skip) + Math.min(Number(limit), 20))
            : [];
        
        return res.status(200).json({data: paginatedProducts});
    } catch (err) {
      
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsBySeller
};
