var express = require("express")
const userCtrl = require("../controllers/userCtrl")
const auth = require("../midlewares/auth")
var router = express.Router()

/* GET users listing. */
router.post("/register", userCtrl.register)
router.post("/login", userCtrl.login)
router.post("/logout",auth.simple, userCtrl.logout)
router.post("/token", auth.verifyRefreshToken, userCtrl.getAccessToken)

module.exports = router
