FROM node:latest

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN ln -s /usr/src/app/node_modules/phantomjs-prebuilt/lib/phantom/bin/phantomjs /usr/local/bin/phantomjs
COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]