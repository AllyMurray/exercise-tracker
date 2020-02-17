const exerciseRouter = require('express').Router();
const User = require('../models/user');
const Log = require('../models/log');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');

exerciseRouter.post(
  '/new-user',
  [
    check('username')
      .not()
      .isEmpty()
  ],
  async (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ error: errors.array() });
    }

    try {
      const user = new User({
        username: request.body.username
      });

      const savedUser = await user.save();
      response.json(savedUser);
    } catch (exception) {
      next(exception);
    }
  }
);

exerciseRouter.get('/users', async (request, response, next) => {
  try {
    const users = await User.find({});
    response.json(
      users.map(u =>
        u.toJSON({
          transform: (document, returnedObject) => {
            delete returnedObject.__v;
            delete returnedObject.log;
          }
        })
      )
    );
  } catch (exception) {
    next(exception);
  }
});

exerciseRouter.post(
  '/add',
  [
    check('userId')
      .not()
      .isEmpty(),
    check('description')
      .not()
      .isEmpty(),
    check('duration').isNumeric()
  ],
  async (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ error: errors.array() });
    }

    try {
      const body = request.body;

      const user = await User.findById(body.userId);

      const log = new Log({
        description: body.description,
        duration: body.duration,
        date: body.date
      });

      const savedLog = await log.save();

      user.log = [...user.log, savedLog._id];

      await user.save();

      response.json({
        _id: user._id,
        username: user.username,
        description: savedLog.description,
        duration: savedLog.duration,
        date: savedLog.date
      });
    } catch (exception) {
      next(exception);
    }
  }
);

exerciseRouter.get(
  '/log',
  [
    check('userId')
      .not()
      .isEmpty(),
    check('from').custom((value, { req }) => {
      if (value && !req.body.to) {
        throw new Error(
          'A to date must be supplied if a from date is supplied'
        );
      }
      // Indicates the success of this synchronous custom validator
      return true;
    }),
    check('to').custom((value, { req }) => {
      if (value && !req.body.from) {
        throw new Error(
          'A from date must be supplied if a to date is supplied'
        );
      }
      // Indicates the success of this synchronous custom validator
      return true;
    })
  ],
  async (request, response, next) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(422).json({ error: errors.array() });
    }

    const { userId, from, to, limit } = request.query;

    try {
      const $match = {
        $expr: { $in: ['$_id', '$$log'] }
      };
      if (from && to) {
        $match.date = {
          $gte: new Date(from),
          $lte: new Date(to)
        };
      }

      const pipeline = [{ $match }];

      if (limit) {
        pipeline.push({
          $limit: Number(limit)
        });
      }

      const userLog = await User.aggregate([
        { $match: { _id: mongoose.Types.ObjectId(userId) } },
        {
          $lookup: {
            from: 'logs',
            as: 'logs',
            let: { log: '$log' },
            pipeline
          }
        }
      ]);

      response.json({
        _id: userLog[0]._id,
        username: userLog[0].username,
        log: userLog[0].logs
      });
    } catch (exception) {
      next(exception);
    }
  }
);

module.exports = exerciseRouter;
