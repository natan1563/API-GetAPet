module.exports = class UnprocessableEntityException extends Error {
  constructor(message) { 
    super(message);
    this.code = 422 
  }
}