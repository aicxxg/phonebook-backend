require('dotenv').config()
const repl = require('repl')
const mongoose = require("mongoose")

const getMongodbURI = (path) => {
  const uri = process.env.MONGODB_URI || ''
  const password = process.env.MONGODB_PASSWORD || ''
  return uri.replace("<PASSWORD>", password).replace('<PATH>', path)
}

if (process.argv.length < 3) {
  console.log("Error: at least one argument")
  process.exit(1)
}

const mongodb_uri = getMongodbURI(process.argv[2])
mongoose.set("strictQuery", false)
mongoose.connect(mongodb_uri)
const personSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model("Person", personSchema)
debugger
if (process.argv.length == 3) {
    Person.find({})
    .then(r => {
        console.log("phonebook:")
        r.forEach(p => {
            console.log(p.name, p.number)
        })
        mongoose.connection.close()
    })
} else if (process.argv.length == 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4]
    })
    person.save()
    .then(r => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
} else {
    console.log("invalid arguments")
    process.exit(1)
}