const jwt = require('jsonwebtoken');
const createUserToken = async (user, _, res) => {
  const token = jwt.sign({
    name: user.name,
    id: user._id
  }, process.env.SECRET_KEY)

  res.status(200).json({
    message: "Autenticado com sucesso!",
    token,
    userId: user._id
  })
}

module.exports = createUserToken