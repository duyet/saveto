# saveto

*This project is under maintenance. PRs are welcome!*

![](.github/screencapture-saveto-co-1472220247447.png)

![](.github/screencapture-saveto-co-me-1472219333280.png)

![](.github/screencapture-saveto-co-trend-1472219732376.png)

![](.github/screencapture-saveto-view-1472220400244.png)

![](.github/screencapture-saveto-co-note-1472219805542.png)


## Roadmap

- [x] using without login. 
- [x] youtube review
- [x] file-quick: save file and hightlight 
- [x] TIL
- [x] Improve login (cookie or localStorage)
- [x] /trend
- [ ] /note template 
- [x] /url can be show as screenshot, og:image 
- [x] note card 
- [ ] todo checklist 
- [ ] Socket.io 
- [ ] report flag
- [ ] admin dashboard
 
# Installation 

1. Clone the source 

```sh
git clone https://github.com/duyet/saveto
cd saveto
```

1. Install `npm`, `bower`, `mongodb`, `redis` package 

```sh
npm install 
npm install -g bower # install bower
bower install 
sudo apt-get install mongodb redis-server
chmod +x ./watch.sh
```

1. Change database config in `app/config.js`

1. Start server (support live reload)

```sh
npm start
```

6. Visit [http://localhost:6969](http://localhost:6969)

# Dockerizing

1. Install Docker and start Docker deamon
2. Build Docker image

```
docker build --tag duyet/saveto .
```

3. Deploy and run

```
docker run -p 6969:6969 --name saveto-app -d duyet/saveto
```

4. Visit http://localhost:6969

#  Production

See how to deploy in production [wiki](https://github.com/duyet/saveto/wiki/Production).

# How to contribute

1. Fork the project on Github
2. Create a topic branch for your changes
3. Ensure that you provide documentation and test coverage for your changes (patches won’t be accepted without)
4. Create a pull request on Github (these are also a great place to start a conversation around a patch as early as possible)

# License

MIT License

Copyright (c) 2016 Van-Duyet Le

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
