# quick

Quick save link to collection, quick access.

Build with Koajs

Release: http://saveto.co or http://ahihi.club 

## Coming soon

[x] using without login. <br />
[  ] youtube review <br />
[  ] file-quick: save file and hightlight <br />

# Installation 

1. Clone the source 
	```sh
	git clone https://github.com/duyetdev/quick
	cd quick
	```

2. Install `npm`, `bower`, `mongodb`, `redis` package 
	```sh
	npm install 
	bower install 
	sudo apt-get install mongodb redis-server
	chmod +x ./watch.sh
	```

3. Change database config in `app/config.js`
4. Start server (support watch and reload)
	```sh
	./watch.sh
	```

5. Visit [http://localhost:6969](http://localhost:6969)

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
