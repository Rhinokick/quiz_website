// load .env data into process.env
require('dotenv').config();

// Web server config
const sassMiddleware = require('./lib/sass-middleware');
const express = require('express');
const morgan = require('morgan');
let cookieSession = require('cookie-session');

const PORT = process.env.PORT || 8080;
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['s3cr3tK3yV4lu3'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

app.use((req, res, next) => {
  res.locals.user = {
    id: req.session.user_id,
    username: req.session.username
  };
  next();
});

app.set('view engine', 'ejs');

// Load the logger first so all (static) HTTP requests are logged to STDOUT
// 'dev' = Concise output colored by response status for development use.
//         The :status token will be colored red for server error codes, yellow for client error codes, cyan for redirection codes, and uncolored for all other codes.
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(
  '/styles',
  sassMiddleware({
    source: __dirname + '/styles',
    destination: __dirname + '/public/styles',
    isSass: false, // false => scss, true => sass
  })
);
app.use(express.static('public'));

// Separated Routes for each Resource
// Note: Feel free to replace the example routes below with your own
const userApiRoutes = require('./routes/users-api');
const widgetApiRoutes = require('./routes/widgets-api');
const usersRoutes = require('./routes/users');
const quizRoutes = require('./routes/quiz');

const createQuizApiRoutes = require('./routes/create-quiz-api');
const createQuizRoutes = require('./routes/create-quiz');
const myquizzesRoutes = require('./routes/my-quizzes');
const publicQuizzesRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');

// Mount all resource routes
// Note: Feel free to replace the example routes below with your own
// Note: Endpoints that return data (eg. JSON) usually start with `/api`
app.use('/api/users', userApiRoutes);
app.use('/api/widgets', widgetApiRoutes);
app.use('/users', usersRoutes);
app.use('/quizzes', quizRoutes);
app.use('/quiz', myquizzesRoutes);
app.use('/', authRoutes);
app.use('/', publicQuizzesRoutes);
// Note: mount other resources here, using the same pattern above

// routes for create_quiz
app.use('/api/create-quiz', createQuizApiRoutes);
app.use('/create-quiz', createQuizRoutes);


// Home page
// Warning: avoid creating more routes in this file!
// Separate them into separate routes files (see above).
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/');
});


app.get('/', (req, res) => {
  res.render('index');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
