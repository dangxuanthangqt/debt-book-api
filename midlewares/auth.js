const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const RefreshTokens = require("../models/refreshTokenModel")

const simple = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "")
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    console.log('decoded', decoded)
    const user = await User.findOne({
      _id: decoded.sub._id,
      "tokens.token": token, // if not exist token
    })
    console.log('token', token)
    console.log('user', user)
    if (!user) throw new Error()
    req.token = token
    req.user = user
    next()
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." })
  }
}

const enhance = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "")
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    
    const user = await User.findOne({
      _id: decoded.sub._id,
      "tokens.token": token,
    })
    if (!user || user.role !== 1) throw new Error()
    req.token = token
    req.user = user
    next()
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." })
  }
}

async function verifyRefreshToken(req, res, next) {
  const token = req.header("Authorization").replace("Bearer ", "")
  req.token = token

  const refreshToken = req.body.refreshToken

  if (refreshToken === null)
    return res.status(401).json({ status: false, message: "Invalid request." })
  try {
    // eslint-disable-next-line no-undef
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    req.decodeRefresh = decoded

    // verify if token is in store or not
    const refreshTokenDocument = await RefreshTokens.findOne({
      _id: decoded.sub._id,
      refreshToken: refreshToken,
    })

    if (refreshTokenDocument) {
      next()
    } else {
      return res.status(401).json({ msg: "Refresh token not exist in DB" })
    }
  } catch (error) {
    return res.status(401).json({
      status: true,
      message: "Your session is not valid.",
      data: error,
    })
  }
}

module.exports = { simple, enhance, verifyRefreshToken }
