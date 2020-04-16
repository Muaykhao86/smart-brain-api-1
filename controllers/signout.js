const redis = require("redis");

// * Redis Client => quick key/value storage used here for session managment
const redisClient = redis.createClient(process.env.REDIS_URI);

// * Sign out
const handleSignout = (req, res) => {  
  const { token, id } = req.body;
  console.log({id})
  if (!token || !id) {
       return Promise.reject('please try again')
  }

return redisClient.del(token, (err, reply) => {
      if(err || !reply){
          return res.status(400).json('Unauthorized');
        }
       return res.json({id: reply})
})

}

module.exports = {
    handleSignout
}
 
