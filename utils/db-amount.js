const { readFile, writeFile } = require('fs').promises;
const { join } = require('path');
const { AmountRecords } = require('../records/amount-records');
const { ProductRecords } = require('../records/product-records')

class Amount {
  constructor (dbFileName) {
    this.dbFileName = join(__dirname, '../data', dbFileName);
    this._load();
  }
  async _load () {
    this._amount = JSON.parse(await readFile(this.dbFileName, 'utf8')).map(obj => new AmountRecords(obj));
  }

  _save () {
    writeFile(this.dbFileName, JSON.stringify(this._amount), 'utf8');
  }

  createDetail (obj) {
    // cos.push(obj) === cos.push({...obj}) //...operator rozproszenia, rozprasza obiekt aby dodac cos
    // const id = uuid();

    this._amount.push(new AmountRecords(obj));
    this._save();

    return obj.id;
  }

  getOneDetail (id) {
    return  this._amount.filter(obj => obj.id === id).map(obj => new AmountRecords(obj));
  }

  updateDetail (newObj) {
    this._amount = this._amount.map(obj => obj.id === newObj.id ? { ...obj, ...newObj, } : obj);
    this._save();
  }

  sumAmount (id) {
    let sum = 0;
    this._amount.filter(obj => obj.id === id).map(
      obj => obj.plus ? sum += Number(obj.plus) : sum -= Number(obj.minus)
    );
    return { id, amount: sum.toFixed(4) };
  }
  deleteDetails (id) {
    this._amount = this._amount.filter(obj => obj.id !== id);
    this._save();
  }
}

const amount = new Amount('amount.json')

module.exports = {
  amount,
}