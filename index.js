const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const usersData = require('./data/users.json'); // Import users module
const users = usersData.users; // Access the 'users' array

const cards = require('./cards');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();


console.log('Users:', users);
console.log('JWT Secret:', process.env.JWT_SECRET); // Move this line here





const authenticateToken = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ errorMessage: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ errorMessage: 'Invalid token' });
    req.user = user;
    next();
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/getToken', (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ errorMessage: 'Invalid credentials' });
  }

  const token = jwt.sign({ username: user.username, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });


});


app.get('/cards', (req, res) => {
  const allCards = cards.getAllCards(req.query);
  res.json(allCards);
});
app.post('/cards/create', authenticateToken, (req, res) => {
  const createCard = req.body;
  const newCard = cards.addCard(createCard);
  res.json({ successMessage: 'Card created successfully', card: newCard });
});
app.put('/cards/:id', authenticateToken, (req, res) => {
  const cardId = parseInt(req.params.id);
  const updatedCard = req.body;
  const result = cards.updateCard(cardId, updatedCard);

  if (result.errorMessage) {
    return res.status(400).json({ errorMessage: result.errorMessage });
  }

  res.json({ successMessage: 'Card updated successfully', card: result.card });
});

app.delete('/cards/:id', authenticateToken, (req, res) => {
  const cardId = parseInt(req.params.id);
  const result = cards.deleteCard(cardId);

  if (result.errorMessage) {
    return res.status(400).json({ errorMessage: result.errorMessage });
  }

  res.json({ successMessage: 'Card deleted successfully' });
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
