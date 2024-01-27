const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const cardsFilePath = path.join(__dirname, 'data', 'cards.json');
let nextCardId = 1; // Assuming your initial card ID starts from 1

function verifyToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ errorMessage: 'Unauthorized - Missing token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ errorMessage: 'Unauthorized - Invalid token' });
    }
    req.user = user;
    next();
  });
}

const getAllCards = (req, res) => {
  const cardsData = readCardsFile();
  res.json(cardsData.cards);
};

const addCard = (req, res) => {
  const createCard = req.body;

  // Example: Check if the user has a specific role or permission to add a card
  if (req.user.role !== 'admin') {
    return res.status(403).json({ errorMessage: 'Forbidden - Insufficient permissions' });
  }

  createCard.cardId = getNextCardId();
  const cardsData = readCardsFile();
  cardsData.cards.push(createCard);
  writeCardsFile(cardsData);
  res.json({ successMessage: 'Card created successfully', card: createCard });
};

const updateCard = (req, res) => {
  const cardId = parseInt(req.params.id);
  const updatedCard = req.body;

  // Example: Check if the user has a specific role or permission to update a card
  if (req.user.role !== 'admin') {
    return res.status(500).json({ errorMessage: 'Forbidden - Insufficient permissions' });
  }

  const cardsData = readCardsFile();
  const index = cardsData.cards.findIndex((card) => card.cardId === cardId);

  updatedCard.cardId = getNextCardId(cardsData.cards);
  cardsData.cards[index] = updatedCard;
  writeCardsFile(cardsData);
  res.json({ successMessage: 'Card updated successfully', card: updatedCard });
};

const deleteCard = (req, res) => {
  const cardId = parseInt(req.params.id);

  // Example: Check if the user has a specific role or permission to delete a card
  if (req.user.role !== 'admin') {
    return res.status(500).json({ errorMessage: 'Forbidden - Insufficient permissions' });
  }

  const cardsData = readCardsFile();
  const index = cardsData.cards.findIndex((card) => card.cardId === cardId);

  cardsData.cards.splice(index, 1);
  writeCardsFile(cardsData);
  res.json({ successMessage: 'Card deleted successfully' });
};

function getNextCardId() {
  const currentId = nextCardId;
  nextCardId += 1;
  return currentId;
}

function readCardsFile() {
  const cardsFile = fs.readFileSync(cardsFilePath, 'utf-8');
  return JSON.parse(cardsFile);
}

function writeCardsFile(data) {
  fs.writeFileSync(cardsFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { getAllCards, addCard, deleteCard, updateCard, verifyToken };
