const { AmountRecords } = require('../records/amount-records');
const { s3, bucketName } = require("./aws-s3");
const { v4: uuid } = require('uuid');

class Amount {
  constructor (dbFileName) {
    this.dbFileName = dbFileName;
    this._load();
  }

  async _load () {
    try {
      const params = {
        Bucket: bucketName,
        Key: "amount.json"
      };

      const theObject = await s3.getObject(params).promise();
      const table = Buffer.from(theObject.Body)
      this._amount = JSON.parse(table).map(obj => new AmountRecords(obj));

    } catch (err) {
      console.log(err);
    };
  }

  async _save () {
    try {
      const params = {
        Bucket: bucketName,
        Key: 'amount.json',
        Body: JSON.stringify(this._amount),
      };

      await s3.putObject(params).promise();

    } catch (err) {
      console.log("Error uploading data: ", err);
    }
  }

  createDetail (obj) {
    const id = uuid();

    this._amount.push(new AmountRecords({
      id,
      ...obj,
    }));
    this._save();

    return obj.id;
  }

  getOneDetail (id) {
    return  this._amount.filter(obj => obj.productId === id).map(obj => new AmountRecords(obj));
  }

  sumAmount (id) {
    let sum = 0;
    this._amount
        .filter(obj => obj.productId === id)
        .map(obj => obj.plus ? sum += obj.plus : sum -= obj.minus);

    return { id, amount: parseFloat(sum.toFixed(4))};
  }

  deleteDetails (id) {
    this._amount = this._amount.filter(obj => obj.productId !== id);
    this._save();
  }

  deleteOneDetail (id) {
    this._amount = this._amount.filter(obj => obj.id !== id);
    this._save();
  }
}

const amount = new Amount('amount.json')

module.exports = {
  amount,
}