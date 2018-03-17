require('dotenv').config()

const express = require('express')
const line = require('@line/bot-sdk')

const webhookHandler = require('./handler/webhook')
const healthyCheckHandler = require('./handler/healthy-check')
const config = require('./config.js')

const app = express();

app.get('/', healthyCheckHandler)

app.post('/webhook', line.middleware(config), webhookHandler);

app.listen(process.env.PORT || 3000);
