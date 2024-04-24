const multer = require('multer');
const sharp = require('sharp'); // Sharp is an image processing library

//const fs = require('fs');  Only need this for when reading or writing files
const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
// const APIFeatures = require('./../utils/apiFeatures');

// This was used to import data from JSON file /////////////////////////////////////////////////////////
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8')
// );
//////////////////////////////////////////////////////////////////////////////////////////////////////////

// Examples of middleware put to use /////////////////////////////////////////////////////////////////////
/*
exports.checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};


exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};
*/
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please only upload images', 400), false);
  }
};

// routes where upoloaded images will go to
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxcount: 1 },
  { name: 'images', maxcount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();

  // 1. Cover Image

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2. Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    }),
  );

  next();
});

// This is for the Alias route, as it has the presets for the 'top-5-cheap'
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

// Old way of getting tours before handlerFactory ///////////////////////////////////////////////
// exports.getAllTours = catchAsync(async (req, res, next) => {
//   // EXECUTE QUERY /////////////////////////////////////////////////////////////////////
//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   // SEND RESPONSE /////////////////////////////////////////////////////////////////////
//   res.status(200).json({
//     status: 'success',
//     results: tours.length,
//     data: {
//       tours,
//     },
//   });

//   // TRY-CATCH BLOCK ////////////////////////////////////////////////////////
//   // try {
//   //   // EXECUTE QUERY ////////////////////////////////////////
//   //   const features = new APIFeatures(Tour.find(), req.query)
//   //     .filter()
//   //     .sort()
//   //     .limitFields()
//   //     .paginate();
//   //   const tours = await features.query;

//   //   // SEND RESPONSE ////////////////////////////////////////
//   //   res.status(200).json({
//   //     status: 'success',
//   //     results: tours.length,
//   //     data: {
//   //       tours,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
//   //////////////////////////////////////////////////////////////////////////////
// }); //////////////////////////////////////////////////////////////////////////////////////////////

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// Old way of getting tour before handlerFactory /////////////////////////////////////////////////////
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   // the previous line is shorthand of Tour.fineOne({ _id: req.params.id })

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });

//   // TRY-CATCH BLOCK /////////////////////////////////////////////////////////////
//   // try {
//   //   const tour = await Tour.findById(req.params.id);
//   //   // the previous line is shorthand of Tour.fineOne({ _id: req.params.id })
//   //   res.status(200).json({
//   //     status: 'success',
//   //     data: {
//   //       tour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
//   ///////////////////////////////////////////////////////////////////////////////////
// }); ////////////////////////////////////////////////////////////////////////////////////////////////////

exports.createTour = factory.createOne(Tour);

// Old Way of creating tour before creation of handlerFactory /////////////////////////////////////////////
// exports.createTour = catchAsync(async (req, res, next) => {
//   // const newTour = new Tour({})  old way of getting a new tour w/o async await function
//   // newTour.save()

//   const newTour = await Tour.create(req.body);

//   res.status(202).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });

//   // TRY-CATCH BLOCK SCAFFOLDING ///////////////////////////////
//   // try {
//   //   // const newTour = new Tour({})  old way of getting a new tour w/o async await function
//   //   // newTour.save()

//   //   const newTour = await Tour.create(req.body);

//   //   res.status(202).json({
//   //     status: 'success',
//   //     data: {
//   //       tour: newTour,
//   //     },
//   //   });
//   // } catch (err) {
//   //   res.status(400).json({
//   //     status: 'fail',
//   //     message: err,
//   //   });
//   // }
//   //////////////////////////////////////////////////////////
// }); ////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Way to write data into the JSON file w/o async await ///////////////////////////////////////////////////
/*
exports.createTour = (req, res) => {

  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    },
  );
};
*/
////////////////////////////////////////////////////////////////////////////////////////////////////////////

exports.updateTour = factory.updateOne(Tour);

// Old way to update a Tour before creation of handlerFactory //////////////////////////////
// exports.updateTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//     runValidators: true,
//   });

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour,
//     },
//   });
// }); //////////////////////////////////////////////////////////////////////////////////////

exports.deleteTour = factory.deleteOne(Tour);

// Old way to delete a Tour before creation of handlerFactory ////////////////
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) {
//     return next(new AppError('No tour found with that ID', 404));
//   }

//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// }); //////////////////////////////////////////////////////////////////////////////////

// This function allows you to use the aggregation pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // this next 'match' is just here to show that you can repeat operators through the aggregation chain
    // notice how '_id' is now related to difficulty
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`), //This part is signifying that the dates will be inbetween these two dates
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' }, // This one lets you add fields, notice how 'month' doesnt have a '$' before it
    },
    {
      $project: {
        // Allows you to select which fields are shown, either with a '1' or '0'
        _id: 0,
      },
    },
    {
      $sort: { numTourStarts: -1 },
    },
    // This is just here to show how the 'limit' operator works
    // {
    //   $limit: 6,
    // },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  // we want radius in radians and we get that by dividing by the radius of the earth (miles, km's)
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400,
      ),
    );
  }
  const distances = await Tour.aggregate([
    {
      // the stuff in this geoNear stuff is just mandatory to calculate the distace
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
