/* eslint-disable no-undef */
const mongoose = require("mongoose")
const { isEmail } = require("validator")
const jwt = require("jsonwebtoken")
const RefreshTokens = require("../models/refreshTokenModel")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name!"],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      required: [true, "Please enter your email!"],
      validate: [isEmail, "Please fill a valid email address"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password!"],
    },
    role: {
      type: Number,
      default: 0, // 0 = user, 1 = admin
    },
    avatar: {
      type: String,
      default:
        "https://www.alliancerehabmed.com/wp-content/uploads/icon-avatar-default.png",
    },
    tokens: [
      {
        token: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
  { versionKey: false }
)

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  if (!userObject.role === 1) {
    delete userObject.updatedAt
    delete userObject.__v
  }

  delete userObject.password
  delete userObject.tokens

  return userObject
}

userSchema.methods.generateAccessToken = async function () {
  const user = this
  const accessToken = jwt.sign(
    { sub: { _id: user._id.toString(), role: user.role } },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_TIME }
  )
  user.tokens = user.tokens.concat({ token: accessToken })
  await user.save()
  return accessToken
}

userSchema.methods.generateRefreshToken = async function () {
  const user = this

  const refreshToken = jwt.sign(
    { sub: { _id: user._id.toString(), role: user.role } },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_TIME }
  )

  try {
    await RefreshTokens.findOneAndUpdate(
      { _id: user._id },
      {
        _id: user._id,
        refreshToken: refreshToken,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    )
  } catch (err) {
    console.log(err)
  }

  return refreshToken
}

module.exports = mongoose.model("Users", userSchema)
