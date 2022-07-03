module.exports = function handleErrors(res, error) {    
    if (!error.code) {
      res.status(500).json({
        message: 'Erro interno do servidor'
      })
      return
    }

    res.status(error.code).json({
      message: error.message
    })
}
