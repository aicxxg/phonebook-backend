const mongoose = require('mongoose')

const getMongodbURI = (path) => {
  const uri = process.env.MONGODB_URI || ''
  const password = process.env.MONGODB_PASSWORD || ''
  return uri.replace('<PASSWORD>', password).replace('<PATH>', path)
}

let debugState = {
  initialized: false,
  error: false
}
mongoose.set('strictQuery', false)
const mongodbConnection = mongoose.connect(getMongodbURI('phonebook'))
mongodbConnection.then(() => 0).catch(() => 0)
const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'name must be at least 3 characters'],
    required: [true, 'name is required']
  },
  number: {
    type: String,
    minLength: [8, 'number must be at least 8 characters'],
    validate: {
      validator: (v) => {
        return /^\d{2,3}-\d+$/.test(v)
      },
      message: 'invalid phone number'
    }
  }
})
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Person = mongoose.model('Person', personSchema)

module.exports = [Person, mongodbConnection]