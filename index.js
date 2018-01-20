require('dotenv').config()

const express = require('express')
const line = require('@line/bot-sdk')

const handler = require('./handler')
const config = require('./config.js')

const app = express();
app.post('/webhook', line.middleware(config), handler.webhook);

app.listen(process.env.PORT || 3000);
