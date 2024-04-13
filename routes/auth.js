const router = require('express').Router();
const {postRegister, postLogIn} = require('../controllers/auth');

// router.post('/login', )
router.post('/register',postRegister);

module.exports = router;