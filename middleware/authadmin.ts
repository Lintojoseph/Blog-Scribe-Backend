import adminmodel from '../models/adminmodel'
const jwt = require('jsonwebtoken');
const secret_key = process.env.SECRET_KEY;

const verifyAdminLogin =  (req:any, res:any, next:any) => {
  const authHeader = req.headers["authorization"];
  

  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, secret_key, (err:any, user:any) => {
    if (err) {
      return res.sendStatus(403);
    }

    if (!user || !user.is_admin) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  });
}
  

export default verifyAdminLogin