const exerciseRouter = require('express').Router();
const User = require('../models/user');

exerciseRouter.post('/new-user', async (request, response, next) => {
  try {
    const user = new User({
      username: request.body.username
    });

    const savedUser = await user.save();
    response.json(savedUser);
  } catch (exception) {
    next(exception);
  }
});

module.exports = exerciseRouter;
