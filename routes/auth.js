const router = require('express').Router();
const {postRegister, postLogIn,confrimRegistration} = require('../controllers/auth');

// login user
router.post('/login',postLogIn);

//register user
router.post('/register',postRegister);

//verify account registration
router.get('/confirmRegistration/:tag',confrimRegistration);

module.exports = router;