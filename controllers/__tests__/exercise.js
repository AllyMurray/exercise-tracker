const app = require('../../app');
const helper = require('../../test/test_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../../models/user');

const api = supertest(app);
const initialUsername = 'User One';
const baseApiUrl = '/api/exercise';

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({});
    const user = new User({ username: initialUsername });
    await user.save();
  });

  test('creation succeeds with an unused username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'User Two'
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

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: initialUsername
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

afterAll(() => {
  mongoose.connection.close();
});
