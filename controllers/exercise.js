const exerciseRouter = require('express').Router();
const User = require('../models/user');
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
});

module.exports = exerciseRouter;
