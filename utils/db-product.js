const { v4: uuid } = require('uuid');
const { ProductRecords } = require('../records/product-records');
const { s3, bucketName } = require("./aws-s3");


class DbProduct {
  constructor (dbFileName) {
    // this.dbFileName = join('https://products-store-express-trial.s3.eu-central-1.amazonaws.com/', dbFileName);
    this.dbFileName = dbFileName;
    this._load(); // dlatego tak ze w konstruktorze nie da sie dac async/await
  }

  async _load () {
    // try {
    //   this._data = JSON.parse(await readFile(this.dbFileName, 'utf8')).map(obj => new ProductRecords(obj));
    // } catch (e){
    //   if (e.code === 'ENOENT') {
    //     this._data = [];
    //   }
    // }
    try {
      const params = {
        Bucket: bucketName,
        Key: "product.json"
      };

      const theObject = await s3.getObject(params).promise();
      const body = Buffer.from(theObject.Body)
      this._data = JSON.parse(body).map(obj => new ProductRecords(obj));

    } catch (err) {
      console.log(err);
    };
  }

  async _save () {
    // writeFile(this.dbFileName, JSON.stringify(this._data), "utf8");
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