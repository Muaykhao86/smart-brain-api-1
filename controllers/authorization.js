// * Auth Middleware

const redisClient = require("./signin").red;

const requireAuth = (req, res, next) => {
  // ? next allows the function to do its thing and then move on to the next part
  const {authorization} = req.headers;
  // * IF NO AUTH
  if (!authorization) {
    return res.status(401).json("Unauthorized none");
  }
  return redisClient.get(authorization, (err, reply) => {
    // * IF NO TOKEN IN REDIS
    if (err || !reply) {
      return res.status(401).json("Unauthorized error");
    }
    console.log('Go Ahead!')
    // * IF THEY HAVE AUTH TOKEN WE JUST MOVE ON TO THE NEXT TASK 
    // ! so we must make sure we call next() at the end
    return next();
  });
};

module.exports = {
    requireAuth
}