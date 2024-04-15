const jwt = require('jsonwebtoken');
function verifyUser(req, res, next) {
  const authToken = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(authToken, process.env.JWT_SECRET, function (err, decoded) {
      if (err) {
        res.status(401).json({
          "type": "error",
          "message": err
        });
      } else {
        console.log(decoded);
      }
    });
  } else {
    res.status(401).json({
      "type": "erorr",
      "message": "No auth token provided."
    });
  }
}
module.exports = verifyUser;
//# sourceMappingURL=auth.js.map