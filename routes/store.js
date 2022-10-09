const express = require('express');
const { db } = require('../utils/db-product')
const { amount } = require('../utils/db-amount')

const listRouter = express.Router();

listRouter
  .get('/auth', (req, res) => {
    res.status(200).json({status: 'Allowed'});
  })
  .post('/add', (req, res) => {
    res.status(200).send({status: 'received'});
    db.createProduct(req.body);
  })
  .post('/addDetail/:productId', (req, res) => {
    res.status(200).send({status: 'received'});
    amount.createDetail(req.body);
    db.update(amount.sumAmount(req.body.productId));
  })
  .put('/edit', (req, res) => {
    res.status(200).send({status: 'received'});
    db.update(req.body);
  })
  .delete('/delete', (req, res) => {
    res.status(200).send({status: 'received'});
    db.delete(req.body.id);
    amount.deleteDetails(req.body.id);
  })
  .delete('/deleteDetail', (req, res) => {
    res.status(200).send({status: 'received'});
    amount.deleteOneDetail(req.body.id);
    db.update(amount.sumAmount(req.body.productId));
  });

module.exports = {
  listRouter,
};
