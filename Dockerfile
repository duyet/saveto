FROM node:5.11

MAINTAINER Van-Duyet Le <me@duyetdev.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install NPM
COPY package.json /usr/src/app/
RUN npm install

# Bundle app source
COPY . /usr/src/app

# Install and run Bower
RUN npm install -g bower
RUN bower install --allow-root

EXPOSE 6969

CMD ["npm","start"]