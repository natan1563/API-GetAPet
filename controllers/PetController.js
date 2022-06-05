const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

const Pet = require('../models/Pet')

module.exports = class PetController {
  static async create(req, res) {
    try {
      const {name, age, weight, color } = req.body
      const images = req.files
      const available = true

      // validations 
      if (!name) 
        throw new Error('O campo nome é obrigatório')
      
      if (!age) 
        throw new Error('O campo idade é obrigatório')

      if (!weight) 
        throw new Error('O campo peso é obrigatório')
        
      if (!color) 
        throw new Error('O campo color é obrigatório')

      if (!images.length)
        throw new Error('Ao menos uma imagem deve ser enviada')

      // get pet owner 
      const token = getToken(req)
      const user = await getUserByToken(token)

      const pet = new Pet({
        name,
        age,
        weight,
        color,
        available,
        images: [],
        user: {
          _id: user._id,
          name: user.name,
          image: user.image,
          phone: user.phone
        }
      })

      images.forEach((image) => {
        pet.images.push(image.filename)
      })

      const newPet = await pet.save()
      res.status(201).json({
        message: "Pet criado com sucesso!!",
        newPet
      })
    } catch (err) {
      if (err instanceof Error) {
        PetController['badRequestHandler'](res, err.message)
      } else {
        res.status(500).json({
          message: "Erro interno do servidor, verifique seus dados e tente novamente."
        })
      }
    }
  }

  static badRequestHandler(res, message = "Bad request"	) {
    res.status(400).json({
      message
    })
  }
}