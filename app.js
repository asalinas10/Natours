const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

// Start express
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1. GLOBAL MIDDLEWARES
// Serving Static Files
app.use(express.static(path.join(__dirname, 'public')));
// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// Set Morgan to only be active in 'dev' (Morgan does the logging)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Set rate limiter for API requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body Parser (Reading data from body into req.body)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization gainst NoSQL query injection
app.use(mongoSanitize());

// Data Sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Compresses text files sent to clients, used for app deployment
app.use(compression());

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});
// app.use((req, res, next) => {
//   console.log('Hello from the middleware!');
//   next();
// });

// 2. ROUTES
// Pug Routes
app.use('/', viewRouter);

// API Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// This code should always be at the end
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
