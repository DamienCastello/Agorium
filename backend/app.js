var express = require('express');
var path = require('path');
const i18n = require('./config/i18n-config');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var articlesRouter = require('./routes/articles');
var tagsRouter = require('./routes/tags');
var achievementsRouter = require('./routes/achievements');
var commentsRouter = require('./routes/comments');
var reportsRouter = require('./routes/reports');
var authRouter = require('./routes/auth');

const { localAuthStrategy } = require('./routes/strategies/local');
const { jwtAuthStrategy } = require('./routes/strategies/jwt');
const multer = require('multer');


var app = express();

// CORS Middleware
app.use((req, res, next) => {
  const allowedOrigins = [
      'https://agorium.castello.ovh',
      'https://agorium-preprod.castello.ovh',
      'http://localhost:8080',
      'http://localhost:5173'
  ];

  if (allowedOrigins.includes(req.headers.origin)) {
      res.header('Access-Control-Allow-Origin', req.headers.origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
  }

  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(i18n.init); 

app.use((req, res, next) => {
  let lang = req.cookies.lang;

  if (!lang) {
    lang = 'fr';
    res.cookie('lang', lang, { 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });
  }

  i18n.setLocale(req, lang);
  next();
});

if (process.env.NODE_ENV === "development") {
  app.use('/uploads', express.static('uploads'));
  app.use(express.static(path.join(__dirname, 'public')));
} else {
  app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
}
  


// Initialize auth strategies config
localAuthStrategy;
jwtAuthStrategy;

app.use('/', indexRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/articles', articlesRouter);
app.use('/api/v1/comments', commentsRouter);
app.use('/api/v1/reports', reportsRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/achievements', achievementsRouter);


// Gestion des erreurs Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Erreur de téléversement : ${err.message}` });
  }

  next(err);
});

app.post('/api/v1/set-language', (req, res) => {
  const { language } = req.body;

  if (!language || !['fr', 'en'].includes(language)) {
    return res.status(400).json({ message: 'Langue invalide' });
  }

  res.cookie('lang', language, { 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',  
    sameSite: 'lax' 
  });

  i18n.setLocale(req, language);

  res.json({ message: `Langue changée en ${language}`, currentLang: req.getLocale() });
});

module.exports = app;