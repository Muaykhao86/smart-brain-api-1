const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
const morgan = require('morgan');

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const signout = require('./controllers/signout');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const auth = require('./controllers/authorization');

const db = knex({
  client: 'pg',
  connection: process.env.POSTGRES_URI
  
});
// host : process.env.POSTGRES_HOST,
// user : process.env.POSTGRES_USER,
// password : process.env.POSTGRES_PASSWORD,
// database : process.env.POSTGRES_DB

const app = express();
app.use(morgan('combined'));
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res)=> { res.send("Its Working") })
app.post('/signout',(req, res) => signout.handleSignout(req, res))
app.post('/signin', signin.signInAuthentification(db, bcrypt))// ? can do this (signin is a HOC) way AND the way below, dependency injection => we have db and bcrypt so when the function is run we can give it the two args, then when we get a post req we will add the req/res directly to the handler function 
app.post('/register', (req, res) => { register.handleRegister(req, res, db, bcrypt) })
app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db)})
app.post('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileUpdate(req, res, db)})
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res)})

app.listen(3000, ()=> {
  console.log('app is running on port 3000');
})
