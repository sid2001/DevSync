const router = require('express').Router();
const getVideoFile = require('../controllers/fileStream');

router.get('/mediaFile/:filepath',getVideoFile);

module.exports = router;