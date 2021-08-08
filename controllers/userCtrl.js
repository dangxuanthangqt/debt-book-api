/* eslint-disable no-undef */
const { isEmail } = require("validator")
const Users = require("../models/userModel")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body

      if (!name || !email || !password)
        return res.status(400).json({ msg: "Please fill in all fields." })

      if (!isEmail(email))
        return res.status(400).json({ msg: "Invalid emails." })

      const user = await Users.findOne({ email })
      if (user)
        return res.status(400).json({ msg: "This email already exists." })

      if (password.length < 6)
        return res
          .status(400)
          .json({ msg: "Password must be at least 6 characters." })

      const passwordHash = await bcrypt.hash(password, 12)

      const newUser = new Users({
        name,
        email,
        password: passwordHash,
      })

      try {
        await newUser.save("newUser")
        res.json({
          msg: "Register Successfully!",
        })
      } catch (error) {
        res.status(500).json({
          msg: error.message || "Server internal error.",
        })
      }
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await Users.findOne({ email })
      if (!user)
        return res.status(400).json({ msg: "This email does not exist." })

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch)
        return res.status(400).json({ msg: "Password is incorrect." })

      const accessToken = await user.generateAccessToken()
      const refreshToken = await user.generateRefreshToken()

      res.json({ msg: "Login success!", data: { accessToken, refreshToken } })
    } catch (err) {
      return res.status(500).json({ msg: err.message })
    }
  },

  getAccessToken: async (req, res) => {
    const decodeRefresh = req.decodeRefresh.sub
    const user = await Users.findOne({
      _id: decodeRefresh._id,
      "tokens.token": req.token,
    })

    if (!user) {
      return res.status(400).json({ msg: "Token not exist" })
    } else {
      const index = user.tokens.findIndex((token) => {
        return token.token === req.token
      })
      console.log("index", index)
      const accessToken = jwt.sign(
        { sub: { _id: user._id.toString(), role: user.role } },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_TIME }
      )

      user.tokens[index] = { token: accessToken }

      await user.save()
      return res.json({
        data: { accessToken: accessToken },
      })
    }
  },

  logout: async (req, res) => {
    try {
      req.user.tokens = req.user.tokens.filter((token) => {
        return token.token !== req.token
      })
      await req.user.save()
      return res.send({
        message: "Logout successfully !",
      })
    } catch (e) {
      res.status(400).send(e)
    }
  },
}

module.exports = userCtrl
