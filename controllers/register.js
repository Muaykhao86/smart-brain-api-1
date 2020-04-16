const jwt = require("./signin").jwt;
const redisClient = require("./signin").red;

const signToken = email => {
  const jwtPayload = { email };
  return jwt.sign(jwtPayload, "jwt_secret", { expiresIn: "2 days" }); //(signWith, secret to sign with//should be from a .env)
};

const setToken = (key, value) => {
  return Promise.resolve(redisClient.set(key, value));
};

const createSession = (user) => {
  //jwt, return user data
  const { email, id } = user;
  const token = signToken(email);
  return setToken(token, id)
    .then(() => {
      return { success: "true", userId: id, token, ...user };
    })
    .catch(err => console.log(err));
};

const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("incorrect form submission");
  }
  const hash = bcrypt.hashSync(password);
  // console.log(req.body)
  db.transaction(trx => {
    trx
      .insert({
        hash: hash,
        email: email
      })
      .into("login")
      .returning("email")
      .then(loginEmail => {
        return trx("users")
          .returning("*")
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => {
            return user[0]
          });
      })
      .then(data => {
        return createSession(data) 
      })
      .then(session => res.json(session))
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch(err => res.status(400).json("unable to register"));
};

module.exports = {
  handleRegister: handleRegister
};
