const mongoose = require("mongoose")

const refreshTokenSchema = new mongoose.Schema(
  {
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model("RefreshTokens", refreshTokenSchema)
