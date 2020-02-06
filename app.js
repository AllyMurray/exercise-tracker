const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const exerciseRouter = require('./controllers/exercise');
const mongoose = require('mongoose');
const config = require('./utils/config');
const logger = require('./utils/logger');
const app = express();

logger.info('connecting to:', config.MONGODB_URI);

mongoose
  .connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch(error => {
    logger.error('error connecting to MongoDB:', error.message);
  });

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (request, response) => {
  response.sendFile(__dirname + '/views/index.html');
});

app.use('/api/exercise', exerciseRouter);

module.exports = app;
