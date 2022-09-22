const express = require('express');
const {listRouter} = require('./routes/list');

const app = express();

app.use(express.static('public/'));
app.use(express.json());
app.use('/', listRouter);

app.listen(process.env.PORT || 3000);