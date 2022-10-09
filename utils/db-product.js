const { v4: uuid } = require('uuid');
const { ProductRecords } = require('../records/product-records');
const { s3, bucketName } = require("./aws-s3");


class DbProduct {
  constructor (dbFileName) {
    this.dbFileName = dbFileName;
    this._load();
  }

  async _load () {
    try {
      const params = {
        Bucket: bucketName,
        Key: "product.json"
      };

      const theObject = await s3.getObject(params).promise();
      const table = Buffer.from(theObject.Body)
      this._data = JSON.parse(table).map(obj => new ProductRecords(obj));

    } catch (err) {
      console.log(err);
    };
  }

  async _save () {
    try {
      const params = {
        Bucket: bucketName,
        Key: 'product.json',
        Body: JSON.stringify(this._data),
      };

      await s3.putObject(params).promise();

    } catch (err) {
      console.log("Error uploading data: ", err);
    }
  }

  createProduct (obj) {
    const id = uuid();

    this._data.push(new ProductRecords({
      id,
      ...obj,
    }));
    this._save();

    return id;
  }


  getAll () {
    return this._data.map(obj => new ProductRecords(obj));
  }

  getOne (id) {
    return new ProductRecords(this._data.find(obj => obj.id === id));
  }

  update (newObj) {
    this._data = this._data.map(obj => obj.id === newObj.id ? { ...obj, ...newObj, } : obj);
    this._save();
  }

  delete (id) {
    this._data = this._data.filter(obj => obj.id !== id);
    this._save();
  }
}

const db = new DbProduct('product.json')

module.exports = {
  db,
}