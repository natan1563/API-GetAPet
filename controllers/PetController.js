const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')
const ObjectId = require('mongoose').Types.ObjectId
const handleErrors = require('../helpers/error-handling')

const Pet = require('../models/Pet')
const NotFoundException = require('../Services/Errors/NotFoundException')
const UnprocessableEntityException = require('../Services/Errors/UnprocessableEntityException')

module.exports = class PetController {
  static async create(req, res) {
    try {
      const { name, age, weight, color } = req.body
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

  static async getAll(req, res) {
    const pets = await Pet.find().sort('-createdAt')

    res.json({
      pets
    })
  }

  static async getAllUserPets(req, res) {
    const token = getToken(req)
    const currentUser = await getUserByToken(token)

    const myPets = await Pet.find({'user._id': currentUser._id}).sort('-createdAt')

    res.json({
      pets: myPets
    })
  }

  static async getAllUserAdoptions(req, res) {
    const token = getToken(req)
    const currentUser = await getUserByToken(token)

    const myPets = await Pet.find({'adopter._id': currentUser._id}).sort('-createdAt')

    res.json({
      pets: myPets
    })
  }

  static async getPetById(req, res) {
   try {
    const { id } = req.params

    if (!ObjectId.isValid(id)) 
      throw new Error('Ops! requisição inválida')

    const pet = await Pet.findById(id)
    if (!pet) 
      throw new Error('Ops! Pet não encontrado')

    res.status(200).json({ pet })
   } catch (err) {
    res.status(404).json({
      error: '404',
      message: err.message
    })
   }
  }

  static badRequestHandler(res, message = "Bad request"	) {
    res.status(400).json({
      message
    })
  }

  static async removePetById(req, res) {
    try {
      const id = req.params.id
      if (!ObjectId.isValid(id)) 
        throw new UnprocessableEntityException('Ops! ID inválido')

      const pet = await Pet.findById(id)
      if (!pet)
        throw new NotFoundException('Ops! Pet não encontrado')

      const token = getToken(req)
      const user = await getUserByToken(token)

      if (pet.user._id.toString() !== user._id.toString())
        throw new UnprocessableEntityException('Houve um problema em processar a sua solicitação')
      
      const removedPet = await Pet.findByIdAndRemove(pet._id)

      res.json({
        message: 'Pet removido com sucesso!',
        pet: removedPet,
      })
    } catch (err) {
      handleErrors(res, err)
    }
  }

  static async updatePet(req, res) {
    try {
      const images = req.files
      const dataToUpdate = {
        name: req.body.name,
        age: req.body.age,
        weight: req.body.weight,
        color: req.body.color,
        images: images.map(img => img.filename)
      }

      PetController['validatePetAttributes'](dataToUpdate)

      const id = req.params.id
      if (!ObjectId.isValid(id)) 
        throw new UnprocessableEntityException('Ops! ID inválido')

      const pet = await Pet.findById(id)
      if (!pet)
        throw new NotFoundException('Ops! Pet não encontrado')
      
      const token = getToken(req)
      const user = await getUserByToken(token)

      if (pet.user._id.toString() !== user._id.toString())
        throw new UnprocessableEntityException('Houve um problema em processar a sua solicitação')

      const updatedData = await Pet.findByIdAndUpdate(pet._id, dataToUpdate)

      res.status(200).json({
        message: 'Pet atualizado com sucesso!',
        updatedPet: updatedData
      })
    } catch (err) {
      handleErrors(res, err)
    }
  }

  static validatePetAttributes(petAttributes) {
    const { name, age, weight, color, images } = petAttributes

    console.log(petAttributes)
    if (!name) 
      throw new UnprocessableEntityException('O campo nome é obrigatório')
  
    if (!age) 
      throw new UnprocessableEntityException('O campo idade é obrigatório')

    if (!weight) 
      throw new UnprocessableEntityException('O campo peso é obrigatório')
      
    if (!color) 
      throw new UnprocessableEntityException('O campo color é obrigatório')

    if (!images)
      throw new UnprocessableEntityException('Ao menos uma imagem deve ser enviada')
  }
}