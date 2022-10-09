const express = require('express');
require('express-async-errors');
require('dotenv').config();
const cors = require('cors')
const basicAuth = require('express-basic-auth');
const { handleError } = require('./utils/errors')

const {viewRouter} = require('./routes/view');
const {listRouter} = require('./routes/store');

const app = express();

app.use(express.static('public/'));
app.use(cors());
app.use(express.json());

app.use('/', viewRouter);
app.use('/store', basicAuth({
    challenge: true,
    users: { 'knadolna': process.env.PWD }
}), listRouter);

app.use(handleError);

app.listen(process.env.PORT || 3000);