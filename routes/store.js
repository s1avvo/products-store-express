const express = require('express');
const { db } = require('../utils/db-product')
const { amount } = require('../utils/db-amount')
const {getS3FilesList, uploadToS3} = require("../utils/aws-s3-servises");

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
  })
    .post('/upload', async (req, res) => {
      const  { uploaded } = req.files;

      if (!uploaded || Object.keys(req.files).length === 0) {
        res.status(400).send('No files were uploaded.');
        return;
      }

      const listFilesFromBucket = await getS3FilesList();
      const existInBucket = listFilesFromBucket.filter(file => file.includes(uploaded.name));

      if (existInBucket.length > 0) {
        res.send('Dla tego produktu już istnieje karta charakterystyki');
        return;
      }

      await uploadToS3(uploaded);

      res.send('Plik został załadowany');
    });

module.exports = {
  listRouter,
};
