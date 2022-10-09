const express = require('express');
require('express-async-errors');
require('dotenv').config();
const cors = require('cors')
const basicAuth = require('express-basic-auth');
const { handleError } = require('./utils/errors')

const {viewRouter} = require('./routes/view');
const {listRouter} = require('./routes/store');
const password = process.env.USER_PWD;

const app = express();

app.use(express.static('public/'));
app.use(cors());
app.use(express.json());

app.use('/', viewRouter);
app.use('/store', basicAuth({
    challenge: true,
    users: { 'knadolna': password }
}), listRouter);

app.use(handleError);

app.listen(process.env.PORT || 3000);