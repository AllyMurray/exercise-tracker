const app = require('../../app');
const helper = require('../../test/test_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = require('../../models/user');

const api = supertest(app);
const initialUsername = 'Test user 1';
const baseApiUrl = '/api/exercise';

describe('creating a new user', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test('succeeds with an unused username', async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: 'Test user 2'
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
    const user = new User({ username: initialUsername });
    await user.save();
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
