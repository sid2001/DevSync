const router = require('express').Router();
const {getVideo,getVideoFile} = require('../controllers/fileStream');

router.get('/mediaFile/:filepath',getVideoFile);

router.get('/video',getVideo);

module.exports = router;