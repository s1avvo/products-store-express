const express = require('express');
const { db } = require('../utils/db-product')
const { amount } = require('../utils/db-amount')
const { NotFoundError } = require('../utils/errors')

const viewRouter = express.Router();

viewRouter
  .get('/all', (req, res) => {
    res.json(db.getAll());
  })
  .get('/:id/', (req, res) => {
    const product = db.getOne(req.params.id);
    if(!product) throw new NotFoundError();

    res.json(product);
  })
  .get('/detail/:id/', (req, res) => {
    const product = amount.getOneDetail(req.params.id);
    if(!product) throw new NotFoundError();

    res.json(product);
  })
  
module.exports = {
    viewRouter,
};