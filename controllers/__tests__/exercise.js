const app = require('../../app');
const helper = require('../../test/test_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../../models/user');
const Log = require('../../models/log');

const api = supertest(app);
const testUser = 'Test user';
const baseApiUrl = '/api/exercise';

beforeEach(async () => {
  await User.deleteMany({});
});

describe('creating a new user', () => {
  test('succeeds with an unused username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: testUser
    };

    await api
      .post(`${baseApiUrl}/new-user`)
      .type('form')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(u => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test('fails with proper statuscode and message if username is not supplied', async () => {
    const result = await api
      .post(`${baseApiUrl}/new-user`)
      .type('form')
      .send()
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.length).toBe(1);
    expect(result.body.error[0].msg).toBe('Invalid value');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(0);
  });

  test('fails with proper statuscode and message if username is empty', async () => {
    const newUser = {
      username: ''
    };

    const result = await api
      .post(`${baseApiUrl}/new-user`)
      .type('form')
      .send(newUser)
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.length).toBe(1);
    expect(result.body.error[0].msg).toBe('Invalid value');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(0);
  });

  test('fails with proper statuscode and message if username already taken', async () => {
    const user = new User({ username: testUser });
    await user.save();
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: testUser
    };

    const result = await api
      .post(`${baseApiUrl}/new-user`)
      .type('form')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd.length).toBe(usersAtStart.length);
  });
});

describe('get all users', () => {
  beforeEach(async () => {
    for (let i = 1; i <= 5; i++) {
      const user = new User({ username: `${testUser} ${i}` });
      await user.save();
    }
  });

  test('returns all users from the database', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/users`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body.length).toBe(usersAtStart.length);
  });

  test('returns users with the correct properties', async () => {
    const result = await api
      .get(`${baseApiUrl}/users`)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const firstUser = result.body[0];

    expect(firstUser).toHaveProperty('_id');
    expect(firstUser).toHaveProperty('username');
    expect(Object.keys(firstUser).length).toBe(2);
  });
});

describe('adding a log to a user', () => {
  beforeEach(async () => {
    await Log.deleteMany();
    const user = new User({ username: testUser });
    await user.save();
  });

  test('returns the user with the submitted log details', async () => {
    const usersAtStart = await helper.usersInDb();

    const newLog = {
      userId: usersAtStart[0]._id.toString(),
      description: 'Test log',
      duration: 60,
      date: '2020-01-01'
    };

    const result = await api
      .post(`${baseApiUrl}/add`)
      .type('form')
      .send(newLog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toHaveProperty('_id');
    expect(result.body).toHaveProperty('username');
    expect(result.body).toHaveProperty('description');
    expect(result.body).toHaveProperty('duration');
    expect(result.body).toHaveProperty('date');
    expect(Object.keys(result.body).length).toBe(5);
  });

  test('with no date, returns the user with the submitted log details and todays date', async () => {
    const usersAtStart = await helper.usersInDb();

    const newLog = {
      userId: usersAtStart[0]._id.toString(),
      description: 'Test log',
      duration: 60
    };

    const result = await api
      .post(`${baseApiUrl}/add`)
      .type('form')
      .send(newLog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const returnedDate = new Date(result.body.date).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);

    expect(returnedDate).toBe(today);
  });

  test('fails with proper statuscode and message if required parameters are not supplied', async () => {
    const result = await api
      .post(`${baseApiUrl}/add`)
      .type('form')
      .send()
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.every(x => x.msg === 'Invalid value')).toBe(true);
    expect(result.body.error.length).toBe(3);
  });

  test('fails with proper statuscode and message if required parameters are empty', async () => {
    const newLog = {
      userId: '',
      description: '',
      duration: ''
    };

    const result = await api
      .post(`${baseApiUrl}/add`)
      .type('form')
      .send(newLog)
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.every(x => x.msg === 'Invalid value')).toBe(true);
    expect(result.body.error.length).toBe(3);
  });
});

describe('getting a users log', () => {
  beforeEach(async () => {
    await Log.deleteMany();
    const user = new User({ username: testUser });
    for (let i = 1; i <= 5; i++) {
      const log = Log({
        userId: user._id.toString(),
        description: `Test log ${i}`,
        duration: 5 * i
      });
      await log.save();
      user.log = [...user.log, log];
    }
    await user.save();
  });

  test('returns a users log with the correct parameters', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/log`)
      .query({ userId: usersAtStart[0]._id.toString() })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body).toHaveProperty('_id');
    expect(result.body).toHaveProperty('username');
    expect(result.body).toHaveProperty('log');
    expect(Object.keys(result.body).length).toBe(3);
  });

  test('with no parameters returns the full log', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/log`)
      .query({ userId: usersAtStart[0]._id.toString() })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body.log.length).toBe(5);
  });

  test('passing the limit parameter returns the correct number of log entries', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/log`)
      .query({ userId: usersAtStart[0]._id.toString(), limit: 1 })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(result.body.log.length).toBe(1);
  });

  test('fails with proper statuscode and message if the from parameter is supplied without the to parameter', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/log`)
      .query({ userId: usersAtStart[0]._id.toString(), from: '2020-01-01' })
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.length).toBe(1);
    expect(result.body.error[0].msg).toBe(
      'A to date must be supplied if a from date is supplied'
    );
  });

  test('fails with proper statuscode and message if the to parameter is supplied without the from parameter', async () => {
    const usersAtStart = await helper.usersInDb();

    const result = await api
      .get(`${baseApiUrl}/log`)
      .query({ userId: usersAtStart[0]._id.toString(), to: '2020-01-01' })
      .expect(422)
      .expect('Content-Type', /application\/json/);

    expect(result.body.error.length).toBe(1);
    expect(result.body.error[0].msg).toBe(
      'A from date must be supplied if a to date is supplied'
    );
  });
});

afterAll(() => {
  mongoose.connection.close();
});
