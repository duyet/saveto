FROM risingstack/alpine:3.3-v5.11.0-3.5.0

MAINTAINER Van-Duyet Le <me@duyetdev.com>

# Fix npm install from github.com
RUN git config --global http.sslverify "false"

# Install NPM
COPY package.json package.json
RUN npm install

# Install Mongodb
# Import MongoDB public GPG key AND create a MongoDB list file
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
RUN echo "deb http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.0.list

# Update apt-get sources AND install MongoDB
RUN apt-get update && apt-get install -y mongodb-org

# Add your source files
COPY . .

# Install and run Bower
RUN npm install -g bower
RUN bower install

EXPOSE 6969

CMD ["npm","start"]