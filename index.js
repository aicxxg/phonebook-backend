const express = require("express")
const morgan = require("morgan")

const generateID = () => {
  const ids = persons.map(p => p.id)
  let id
  let maxID = Math.pow(2, 64)
  while (true) {
    id = Math.floor(Math.random() * maxID)
    if (!ids.includes(id)) {
      return id
    }
  }
}

persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]

const app = express()
app.use(express.json())
app.use(morgan("tiny"))
app.use(morgan((token, req, res) => {
  if (req.method === "POST" && req.body)
    return JSON.stringify(req.body, null, 2)
  return null
}))

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.post("/api/persons", (request, response) => {
  const data = request.body
  if (!data) {
    return response.status(400).json(
      { error: "empty content"}
    )
  }
  if (!data.name) {
    return response.status(400).json(
      { error: "you must specify name" }
    )
  }
  if (!data.number) {
    return response.status(400).json(
      { error: "you must specify number" }
    )
  }
  if (persons.map(p => p.name).includes(data.name)) {
    return response.status(400).json({ error: "name must be unique" })
  }
  const person = {
    id: generateID(),
    name: data.name,
    number: data.number
  }
  persons = persons.concat(person)
  response.json(person)
})

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (!person) {
    response.status(404).end()
  } else {
    response.json(person)
  }
})

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id
  const person = persons.find(p => p.id === id)
  if (person) {
    persons = persons.filter((p) => p !== person)
    response.status(204).end()
  } else {
    response.status(404).end()
  }
})

app.get("/info", (request, response) => {
  //Person.find({}).then(persons =>
  response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${new Date()}</p>
  `)
})

const port = 3001

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`)
})
