# API Project: Timestamp Microservice for FCC

This project was built as part of the [FreeCodeCamp curriculum](https://www.freecodecamp.org/learn/apis-and-microservices/apis-and-microservices-projects/exercise-tracker).

https://exercise-tracker.allymurray.com

## Built with

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [Mongoose](https://mongoosejs.com)
- [mongoose-unique-validator](https://github.com/blakehaswell/mongoose-unique-validator)
- [body-parser](https://github.com/expressjs/body-parser)
- [CORS](https://github.com/expressjs/cors)
- [dotenv](https://github.com/motdotla/dotenv)

### Development tools

- [ESLint](https://eslint.org)
- [Jest](https://jestjs.io)
- [nodemon](https://nodemon.io)
- [SuperTest](https://github.com/visionmedia/supertest)

## User stories :

1. I can create a user by posting form data username to /api/exercise/new-user and returned will be an object with username and \_id.
2. I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
3. I can add an exercise to any user by posting form data userId(\_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will be the user object with also with the exercise fields added.
4. I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(\_id). Return will be the user object with added array log and count (total exercise count).
5. I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
