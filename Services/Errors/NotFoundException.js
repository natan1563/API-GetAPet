class NotFoundException extends Error {
  constructor(text = 'Not found') {
    super(text)
    this.name = 'NotFoundException'
    this.code = 404;
  }
}

module.exports = NotFoundException;