const jwt = require('jsonwebtoken');
const redis = require("redis");

// * Redis Client => quick key/value storage used here for session managment
const redisClient = redis.createClient(process.env.REDIS_URI);

// * Sign In
// ? const handleSignin = (db, bcrypt) => (req, res) => {... <= <= <= AS HOC
const handleSignin = (db, bcrypt, req, res) => {  
  const { email, password } = req.body;
  if (!email || !password) {
    // return res.status(400).json('incorrect form submission'); Before we needed the function to return a promise to signInAuthentification
       return Promise.reject('incorrect form submission')
  }
  return db.select('email', 'hash').from('login')
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => user[0])
          .catch(err => Promise.reject('unable to get user'))
      } else {
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => Promise.reject('wrong credentials'))
}

// * Check if token is in redis
const getAuthTokenId = (req, res) => {
 const {authorization} = req.headers;
 return redisClient.get(authorization, (err, reply) => {
   if(err || !reply){
    return res.status(400).json('Unauthorized');
   }
   return res.json({id: reply})
 })

} 

// * Sign new token with email
const signToken = (email) => {
  const jwtPayload = {email};
  return jwt.sign(jwtPayload, 'jwt_secret',{expiresIn: '2 days'});//(signWith, secret to sign with//should be from a .env)
}

// * Set token in redis
const setToken = (key, value) => {
 return Promise.resolve(redisClient.set(key, value))
}
// * Create session
const createSession = (user) => {
  //jwt, return user data
  const {email, id} = user;
  const token = signToken(email);
  return setToken(token, id)
  .then(() => {
    return {success: 'true', userId: id, token}
  })
  .catch(console.log)
}

//  * Sign In
const signInAuthentification = (db, bcrypt) => (req, res) => {
const {authorization} = req.headers;
// * If they have jwt they wont need to sign in again
return authorization ? 
getAuthTokenId(req, res) // * THEY DO SO LET USER PASS
: 
handleSignin(db, bcrypt, req, res)// * THEY DONT SO USER NEEDS TO SIGNIN
  .then(data => { //data === user
    return data.id && data.email ? 
    createSession(data)// * create user session
    :
    Promise.reject(data)// * else they need to signin
  })
  .then(session => res.json(session))
  .catch(err => res.status(400).json(err))

}
 
module.exports = {
  signInAuthentification,
  jwt,
  red: redisClient// ? again just showing that you can change the name on export if you want to
}