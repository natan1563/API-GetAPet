// Models
const User = require('../models/User')

// Libs
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController {
  static async register(req, res) {
    const { name, email, phone, password, confirmPassword } = req.body

    if (!name) {
      res.status(422).json({
        message: 'O campo nome é obrigatório'
      })

      return
    }

    if (!email) {
      res.status(422).json({
        message: 'O campo email é obrigatório'
      })

      return
    }

    if (!phone) {
      res.status(422).json({
        message: 'O campo telefone é obrigatório'
      })

      return
    }

    if (!password) {
      res.status(422).json({
        message: 'O campo senha é obrigatório'
      })

      return
    }

    if (!confirmPassword) {
      res.status(422).json({
        message: 'A confirmação de senha é obrigatória'
      })

      return
    }

    if (password !== confirmPassword) {
      res.status(422).json({
        message: 'A senhas devem ser identicas'
      })

      return
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
      res.status(422).json({
        message: 'Usuario já cadastrado, por favor utilize outro e-mail.'
      })

      return
    }

    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    const user = new User({
      name,
      email,
      phone,
      password: passwordHash,
    })

    try {
      const newUser = await user.save()

      await createUserToken(newUser, req, res)

    } catch (err) {
      res.status(500).json({ message: err.message })
    } 
  }

  static async login(req, res) {
    const { email, password } = req.body

    if (!email) {
      res.status(422).json({
        message: 'O campo email é obrigatório'
      })

      return
    }

    if (!password) {
      res.status(422).json({
        message: 'O campo senha é obrigatório'
      })

      return
    }

    const user = await User.findOne({ email })
    const message = 'Usuario ou senha inválidos.'
    if (!user) {
      res.status(422).json({ message })
      return
    }

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
      res.status(422).json({ message })
      return
    }

    await createUserToken(user, req, res)
  }

  static async checkUser(req, res) {
   try {
    let currentUser = null

    if (req.headers.authorization) {
      const token = getToken(req)
      const decoded = jwt.verify(token, process.env.SECRET_KEY)

      currentUser = await User.findById(decoded.id)
      currentUser.password = undefined
    }

    if (!currentUser) {
      res.status(403).send({ message: 'Invalid Token' })
    }

    res.json({
      user: currentUser
    })
   } catch (err) {
      console.log(err.message)
   }
  }

  static async getUserById(req, res) {
   try {
    const id = req.params.id
    const user = await User.findById(id).select('-password')

    if (!user) {
      res.status(422).json({
        message: 'Usuario não encontrado'
      })

      return
    }

    res.json({
      user
    })
   } catch (err) {
     res.status(400).json({
       error: "Requisição inválida"
     })
   }
  }

  static async editUser(req, res) {
    const token = getToken(req)
    const user = await getUserByToken(token)
    
    const {name, email, phone, password, confirmPassword} = req.body
    let image = ''

    if (req.file) {
      image = req.file.filename
    }

    user.image = image
  
    if (!name) {
      res.status(422).json({
        message: 'O campo nome é obrigatório'
      })

      return
    }
    
    user.name = name

    if (!email) {
      res.status(422).json({
        message: 'O campo email é obrigatório'
      })

      return
    }

    if (!phone) {
      res.status(422).json({
        message: 'O campo telefone é obrigatório'
      })

      return
    }
    
    user.phone = phone

    if (password !== confirmPassword) {
      res.status(422).json({
        message: 'A senhas devem ser identicas'
      })

      return
    } else if (password && password === confirmPassword) {
      const salt = await bcrypt.genSalt(12)
      user.password = await bcrypt.hash(password, salt)
    }


    const userExists = await User.findOne({email})

    if (userExists && user.email !== email) {
      res.status(422).json({
        message: "E-mail já está em uso, por favor tente outro"
      })
      return
    }

    user.email = email

    try {

      const updatedUser = await User.findOneAndUpdate(
        { 
          _id: user._id
        },
        {
          $set: user
        },
        {
          new: true
        }
      )
      .select('-password')
      
      res.status(200).json({
        message: 'Update realizado com sucesso',
        user: updatedUser
      })
    } catch (err) {
      res.status(500).json({
        messages: "Ops, ocorreu um erro ao atualizar o seu usuário, por favor tente novamente mais tarde."
      })
    }
  }
}