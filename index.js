const express = require('express');
const cors = require('cors')
const {listRouter} = require('./routes/list');

const app = express();

app.use(express.static('public/'));
app.use(cors());
app.use(express.json());
app.use('/', listRouter);


app.listen(process.env.PORT || 3000);