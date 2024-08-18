const express = require('express');
const { kickOutUser } = require('../controller/adminController');
const router = express.Router();
router.post('/kick-out-user',kickOutUser)

module.exports = router;
