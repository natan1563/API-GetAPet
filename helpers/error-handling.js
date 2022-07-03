module.exports = function handleErrors(res, error) {    
    if (!error.code) {
      console.log(error.message)
      res.status(500).json({
        message: 'Erro interno do servidor'
      })
      return
    }

    res.status(error.code).json({
      message: error.message
    })
}
