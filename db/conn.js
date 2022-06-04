const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect('mongodb://localhost:27017/getapet')

    console.log('Conectado ao mongoose');
  } catch (err) {
    console.error('#001', 'Fail to connect to Mongoose')
  }
}

main()

module.exports = mongoose