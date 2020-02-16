const exerciseRouter = require('express').Router();
const User = require('../models/user');
const Log = require('../models/log');
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
});

module.exports = exerciseRouter;
