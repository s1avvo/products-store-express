const { readFile, writeFile } = require('fs').promises;
const { join } = require('path');
const { v4: uuid } = require('uuid');
const { ProductRecords } = require('../records/product-records');
const { amount } = require('./db-amount')

class DbProduct {
  constructor (dbFileName) {
    this.dbFileName = join(__dirname, '../data', dbFileName);
    this._load(); // dlatego tak ze w konstruktorze nie da sie dac async/await
  }

  async _load () {
    try {
      this._data = JSON.parse(await readFile(this.dbFileName, 'utf8')).map(obj => new ProductRecords(obj));
    } catch (e){
      if (e.code === 'ENOENT') {
        this._data = [];
      }
    }
  }

  _save () {
    writeFile(this.dbFileName, JSON.stringify(this._data), "utf8");
  }

  createProduct (obj) { //nie musimy czac na zapis do pliku dlatego pomijamy async/await
    // cos.push(obj) === cos.push({...obj}) //...operator rozproszenia, rozprasza obiekt aby dodac cos
    const id = uuid();

    this._data.push(new ProductRecords({
      id,
      ...obj,
    }));
    this._save();

    return id; //dzieki temu mozemy wykorzystac w ruterze w post
  }


  getAll () {
    // return this._data;
    // return { allProducts: this._data.map(obj => new ProductRecords(obj)), allAmount };
    return this._data.map(obj => new ProductRecords(obj));
  }

  getOne (id) {
    // return this._data.find(obj => obj.id === id);
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