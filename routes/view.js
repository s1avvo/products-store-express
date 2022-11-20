const express = require('express');
const { db } = require('../utils/db-product')
const { amount } = require('../utils/db-amount')
const { downloadFromS3, getS3FilesList } = require("../utils/aws-s3-servises");

const viewRouter = express.Router();

viewRouter
  .get('/all', (req, res) => {
    res.json(db.getAll());
  })
  .get('/:id/', async (req, res) => {
    const product = db.getOne(req.params.id);
    let dataSheet;

    const listFilesFromBucket = await getS3FilesList();
    const existInBucket = listFilesFromBucket.filter(file => file.includes(req.params.id));

    (existInBucket.length === 0) ? product.dataSheet = false : product.dataSheet = true;

    res.json(product);
  })
  .get('/detail/:id/', (req, res) => {
    const product = amount.getOneDetail(req.params.id);

    res.json(product);
  })
    .get('/download/:filename', async (req, res) => {
      const listFilesFromBucket = await getS3FilesList();
      const existInBucket = listFilesFromBucket.filter(file => file.includes(req.params.filename));

      if (existInBucket.length === 0) {
        res.status(404).send('Dla tego produktu nie istnieje karta charakterystyki');
        return;
      }

      const data = await downloadFromS3(req.params.filename);

      res.attachment(req.params.filename);
      data.Body.pipe(res);
    });
  
module.exports = {
    viewRouter,
};