import request from 'supertest'
import { createConnection, getConnection } from 'typeorm'
import { app } from '~/server/app'
import { User } from '~/server/entity'

describe('API - users', () => {
  const req = request(app)

  beforeAll(() => createConnection())

  afterAll(() =>
    getConnection()
      .createQueryBuilder()
      .delete()
      .from(User)
      .execute())

  test('should return user', async () => {
    // Given
    const user = {
      email: 'login@test.com',
      username: 'username',
      password: 'Secret!'
    }

    // When
    const res = await req.post('/api/users')
      .send({ user })
      .expect(200)

    // Then
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email')
    expect(res.body.user.email).toBe(user.email)
    expect(res.body.user.token).not.toBeNull()
  })

  test('should return user', async () => {
    // Given
    const user = {
      email: 'login@test.com',
      password: 'Secret!'
    }

    // When
    const res = await req.post('/api/users/login')
      .send({ user })
      .expect(200)

    // Then
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email')
    expect(res.body.user.email).toBe(user.email)
    expect(res.body.user.token).not.toBeNull()
  })

  test('should return UnprocessableEntityError', async () => {
    // Given
    const user = {
      email: 'login@test.com',
      password: 'invalid password'
    }

    // When
    const res = await req.post('/api/users/login')
      .send({ user })
      .expect(422)

    // Then
    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toHaveProperty('body')
    expect(res.body.errors.body).toEqual(['email or password is invalid'])
  })

  test('should return user w/ authorization', async () => {
    // Given
    const user = {
      email: 'login@test.com',
      password: 'Secret!'
    }

    // When
    let res = await req.post('/api/users/login')
      .send({ user })
      .expect(200)

    expect(res.body).toHaveProperty('user')
    expect(res.body.user.token).not.toBeNull()

    res = await req.get('/api/user')
      .set('Authorization', `Token ${res.body.user.token}`)
      .expect(200)

    // Then
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email')
    expect(res.body.user.email).toBe(user.email)
    expect(res.body.user.token).not.toBeNull()
  })

  test('should throw AuthorizedRequiredError #1', async () => {
    const res = await req.get('/api/user')
      .expect(401)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toHaveProperty('body')
    expect(res.body.errors.body).toBeInstanceOf(Array)
    expect(res.body.errors.body)
      .toContain('Authorization is required for request on GET /api/user')
  })

  test('should throw AuthorizedRequiredError #2', async () => {
    const res = await req.put('/api/user')
      .expect(401)

    expect(res.body).toHaveProperty('errors')
    expect(res.body.errors).toHaveProperty('body')
    expect(res.body.errors.body).toBeInstanceOf(Array)
    expect(res.body.errors.body)
      .toContain('Authorization is required for request on PUT /api/user')
  })

  test('should return user w/ token', async () => {
    // Given
    const user = {
      email: 'login@test.com',
      password: 'Secret!'
    }

    // When
    let res = await req.post('/api/users/login')
      .send({ user })
      .expect(200)

    expect(res.body).toHaveProperty('user')
    expect(res.body.user.token).not.toBeNull()

    const loggedUser = res.body.user

    const updateUser = {
      username: `${loggedUser.username}!`,
      email: `${loggedUser.email}!`
    }

    res = await req.put('/api/user')
      .send({ user: updateUser })
      .set('Authorization', `Token ${res.body.user.token}`)
      .expect(200)

    expect(res.body).toHaveProperty('user')
    expect(res.body.user).not.toBeNull()
    expect(res.body.user.username).toEqual(updateUser.username)
    expect(res.body.user.email).toEqual(updateUser.email)
    expect(res.body.user.token).not.toBeNull()
    expect(res.body.user.token).not.toEqual(loggedUser.token)

  })
})
