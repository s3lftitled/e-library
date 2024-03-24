const { logIn } = require('./authController.js')
const { ROLES } = require('../middleware/auth-middleWare')
const bcrypt = require('bcrypt')
const UserRepository = require('../repositories/userRepository.js')

jest.mock('bcrypt')
jest.mock('../middleware/auth-middleWare')

describe('logIn', () => {
  const userRepository = new UserRepository()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(userRepository, 'findUserByEmail').mockResolvedValue(null)
  })

  it('should log in a user with valid credentials', async () => {
    const user = {
      _id: '1234567890abcdef',
      email: 'test@panpacificu.edu.ph',
      password: 'hashedPassword123_',
      verificationCode: null,
      role: ROLES.STUDENT,
      programID: 'programId',
      departmentID: 'departmentId',
    }

    userRepository.findUserByEmail.mockResolvedValueOnce(user)
    bcrypt.compare.mockResolvedValue(true)

    const logRepository = {
      createLog: jest.fn(), 
    }

    const req = {
      body: {
        email: user.email, 
        password: 'correctPassword', 
      }
    }

    const res = {
      status: jest.fn().mockReturnThis(), 
      json: jest.fn(),
      cookie: jest.fn(), 
    }

    await logIn(req, res, userRepository, logRepository)

    expect(userRepository.findUserByEmail).toHaveBeenCalledWith(user.email)
    expect(bcrypt.compare).toHaveBeenCalledWith('correctPassword', user.password)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      userID: user._id,
      role: user.role,
      msg: 'User logged in successfully',
    }))
  })
})
