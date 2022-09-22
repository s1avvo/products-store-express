// const {ValidationError, NotFoundError } = require('../utils/errors');

class AmountRecords {
  constructor (obj) {
    const {id, plus, minus, data, person} = obj || {};
    //
    // if(!id){
    //   throw new NotFoundError();
    // }
    //
    // if(typeof id !== 'string'){
    //   throw new ValidationError('Id nie może być puste');
    // }
    //
    // if(!name || typeof name !== 'string' || name.length < 3) {
    //   throw new ValidationError('Imię musi być tekstem o długości min. 3 znaków');
    // }
    //
    // if(!mail || typeof mail !== 'string' || mail.indexOf('@') === -1 ) {
    //   throw new ValidationError('Email nieprawidłowy');
    // }
    //
    // if(typeof nextContactAt !== 'string') {
    //   throw new ValidationError('Data następnego kontaktu musi być tekstem');
    // }
    //
    // if(typeof notes !== 'string') {
    //   throw new ValidationError('Notatki muszą być tekstem');
    // }

    this.id = id;
    this.plus = plus;
    this.minus = minus;
    this.data = data;
    this.person = person;
  }
}

module.exports = {
  AmountRecords,
}