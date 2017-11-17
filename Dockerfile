FROM node:8

MAINTAINER Van-Duyet Le <me@duyetdev.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install NPM
COPY package.json /usr/src/app/
RUN npm install

# Install MongDB
RUN groupadd -r mongodb && useradd -r -g mongodb mongodb
RUN mkdir -p /data/db /data/configdb \
	&& chown -R mongodb:mongodb /data/db /data/configdb
VOLUME /data/db /data/configdb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 0C49F3730359A14518585931BC711F9BA15703C6 && \
	echo "deb http://repo.mongodb.org/apt/debian jessie/mongodb-org/3.4 main" | tee /etc/apt/sources.list.d/mongodb-org-3.4.list && \
	apt-get update && \
	apt-get install -y mongodb-org
RUN mongod &

# Redis
RUN apt-get install -y redis-server

# Bundle app source
COPY . /usr/src/app

# Install and run Bower
RUN npm install -g bower
RUN bower install --allow-root

EXPOSE 6969

CMD ["npm","start"]
