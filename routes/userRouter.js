var express = require('express');
const userCtrl = require('../controllers/userCtrl');
var router = express.Router();

/* GET users listing. */
router.post('/register', userCtrl.register)

module.exports = router;
