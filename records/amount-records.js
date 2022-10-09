const {ValidationError, NotFoundError } = require('../utils/errors');

class AmountRecords {
  constructor (obj) {
    const {id, plus, minus, data, person, productId} = obj || {};

    if(!id){
      throw new NotFoundError();
    }

    if(typeof id !== 'string'){
      throw new ValidationError('Id nie może być puste');
    }

    this.id = id;
    this.plus = plus;
    this.minus = minus;
    this.data = data;
    this.person = person;
    this.productId = productId;
  }
}

module.exports = {
  AmountRecords,
}