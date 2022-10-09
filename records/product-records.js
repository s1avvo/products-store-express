const {ValidationError, NotFoundError } = require('../utils/errors');

class ProductRecords {
  constructor (obj) {
    const {id, name, secondName, amount, place, unit} = obj || {};

    if(!id){
      throw new NotFoundError();
    }

    if(typeof id !== 'string'){
      throw new ValidationError('Id nie może być puste');
    }

    if(!name || typeof name !== 'string' || name.length < 1) {
      throw new ValidationError('Nazwa musi być tekstem o długości min. 1 znaków');
    }

    this.id = id;
    this.name = name;
    this.secondName = secondName;
    this.amount = amount;
    this.unit = unit;
    this.place = place;
  }
}

module.exports = {
  ProductRecords,
}