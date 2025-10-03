require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const [Person, mongodbConnection] = require('./models/person')

const app = express()
app.use(express.static('dist'))
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan((token, req, res) => {
  if (req.method === 'POST' && req.body)
    return JSON.stringify(req.body, null, 2)
  return null
}))

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    }).catch((error) => {
      next(error)
    })
})

app.post('/api/persons', (request, response, next) => {
  const data = request.body
  if (!data) {
    return response.status(400).json(
      { error: 'empty content' }
    )
  }
  if (!data.name) {
    return response.status(400).json(
      { error: 'you must specify name' }
    )
  }
  if (!data.number) {
    return response.status(400).json(
      { error: 'you must specify number' }
    )
  }
  const person = new Person({
    name: data.name,
    number: data.number
  })
  person.save().then(r => {
    response.json(r)
  }).catch((error) => {
    next(error)
  })
})

app.put('/api/persons/:id',(request, response, next) => {
  const id = request.params.id
  const data = request.body
  const person = {}
  if (data.name) person.name = data.name
  if (data.number) person.number = data.number
  Person.findByIdAndUpdate(id, person, { new: true, runValidators: true })
    .then(r => {
      if (r) {
        response.json(r)
      } else {
        response.status(404).end()
      }
    }).catch(error => {
      next(error)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findById(id)
    .then(person => {
      if (person)
        response.json(person)
      else {
        response.status(404).end()
      }
    }).catch((error) => {
      next(error)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
    .then(r => {
      if (r) response.status(204).end()
      else response.status(404).end()
    }).catch((error) => {
      next(error)
    })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons =>
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `))
})

app.get('/debug-state', (request, response) => {
  mongodbConnection.then(() => {
    response.send('<p>success</p>')
  }).catch((error) => {
    response.json(error)
  })
})

app.use((error, request, response, next) => {
  console.log('error:')
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted error' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  console.log(error)
  next(error)
})

const port = process.env.PORT || 3001

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`)
})
