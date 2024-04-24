const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel'); Was being used to embed tour guide info

// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be less or equal to 40 characters'],
      minlength: [10, 'A tour name must be more or equal to 10 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'], // This was just to show how to use custom validators, however it isnt practical for this exercise
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      trim: true,
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty can only be easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating bust me at least 1.0'],
      max: [5, 'Rating cant be more than 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // 'this' only points to the current doc on NEW doc creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      }, // The ({VALUE}) key is a built in part of mongoose that has access to (val) from the function
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' }); // 2dsphere is cuz its geospatial 2-dimesional data

// Convert time into weeks but store the data virtually (Not in the DB)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Create virtual Child Refrencing list for Tours regarding their reviews
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE

// Embed slug into new tour
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Embed tour guides into new tour
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function (next) { // The regular expression /^find/ allows this to work for all .find() operations
// Finds tours with secretTour designations
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// Populates 'guides' field name
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

// Logger
// tourSchema.post(/^find/, function (docs, next) {
//   console.log(`Query took ${Date.now() - this.start} milliseconds!`);
//   next();
// });

// AGGREGATION MIDDLEWARE
// Due to version mismatch with the course,
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this.pipeline());
//   next();
// });

// This code allows us to create new documents straight from the code
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
