const userModel = require("../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");
const { get } = require("mongoose");
async function registerUser(req, res) {
  try {
    const {
      username,
      email,
      password,
      fullName: { firstName, lastName },
      role
    } = req.body;

    const isUserAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isUserAlreadyExist) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hash = await bcryptjs.hash(password, 13);

    const user = await userModel.create({
      username,
      email,
      password: hash,
      fullName: { firstName, lastName },
      role: role || 'user',
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
async function loginUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const user = await userModel
      .findOne({ $or: [{ username }, { email }] })
      .select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcryptjs.compare(
      password,
      user.password || ""
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        address: user.address,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
}
async function getCurrentUser(req, res) {
  return res
    .status(200)
    .json({ message: "Current user fetched successfully", user: req.user });
}
async function logoutUser(req, res) {
  const token = req.cookies?.token;

  if (token) {
    await redis.set(`blacklist_${token}`, true, "EX", 24 * 60 * 60);
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  return res.status(200).json({ message: "Logout successful" });
}
async function getUserAddresses(req, res) {
  const userId = req.user.id;
  const user = await userModel.findById(userId).select("address");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res
    .status(200)
    .json({
      message: "User addresses fetched successfully",
      addresses: user.address,
    });
}
async function addUserAddress(req, res) {
  const userId = req.user.id;
  const { street, city, state, pincode, country, isDefault } = req.body;
  const user = await userModel.findByIdAndUpdate(
    { _id: userId },
    {
      $push: {
        address: {
          street,
          city,
          state,
          pincode,
          country,
          isDefault,
        },
      },
    },
    { new: true }
  );
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  await user.save();

  res
    .status(201)
    .json({ message: "Address added successfully", addresses: user.address });
}

// new: delete a user address by id (only for authenticated user)
async function deleteUserAddress(req, res) {
  const userId = req.user.id;
  const { addressId } = req.params;

  const user = await userModel.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const beforeCount = user.address.length;
  user.address = user.address.filter((a) => String(a._id) !== String(addressId));

  if (user.address.length === beforeCount) {
    // address not found
    return res.status(404).json({ message: "Address not found" });
  }

  await user.save();

  return res.status(200).json({ message: "Address deleted successfully", addresses: user.address });
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  getUserAddresses,
  addUserAddress,
  deleteUserAddress,
};
