const { AmountRecords } = require('../records/amount-records');
const { s3, bucketName } = require("./aws-s3");

class Amount {
  constructor (dbFileName) {
    // this.dbFileName = join(__dirname, '../data', dbFileName) ;
    this.dbFileName = dbFileName;
    this._load();
  }

  async _load () {
    // try {
    //   this._amount = JSON.parse(await readFile(this.dbFileName, 'utf8')).map(obj => new AmountRecords(obj));
    // } catch (e){
    //   if (e.code === 'ENOENT') {
    //     this._amount = [];
    //   }
    // }
    try {
      const params = {
        Bucket: bucketName,
        Key: "amount.json"
      };

      const theObject = await s3.getObject(params).promise();
      const body = Buffer.from(theObject.Body)
      this._amount = JSON.parse(body).map(obj => new AmountRecords(obj));

    } catch (err) {
      console.log(err);
    };
  }

  async _save () {
    // writeFile(this.dbFileName, JSON.stringify(this._amount),"utf8");
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