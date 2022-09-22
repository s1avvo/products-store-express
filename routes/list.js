const express = require('express');
const { db } = require('../utils/db-product')
const { amount } = require('../utils/db-amount')

const listRouter = express.Router();

listRouter
  .get('/all', (req, res) => {
      res.json(db.getAll());
  })
  .get('/:id/', (req, res) => {
    const product = db.getOne(req.params.id);
    res.json(product);
  })
  .get('/:id/detail', (req, res) => {
    const product = amount.getOneDetail(req.params.id);
    res.json(product);

  })
  .post('/:id/add', (req, res) => {
    // if(!res.body) return res.status(400).send({status: 'failed'});
    res.status(200).send({status: 'received'});
    const id = amount.createDetail(req.body);
    db.update(amount.sumAmount(req.body.id));
    // res.json(id);
  })
  .post('/', (req, res) => {
    // if(!res.body) return res.status(400).send({status: 'failed'});
    res.status(200).send({status: 'received'});
    db.createProduct(req.body);
  })
  .put('/edit', (req, res) => {
    console.log(req.body)
    res.status(200).send({status: 'received'});
    db.update(req.body);
  })
  .delete('/delete', (req, res) => {
    res.status(200).send({status: 'received'});
    db.delete(req.body.id);
    amount.deleteDetails(req.body.id);
  });

module.exports = {
  listRouter,
};