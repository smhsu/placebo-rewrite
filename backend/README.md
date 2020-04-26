# hapi-heroku
A sample app running hapi on heroku

## Useful links
https://hapi.dev/api/?v=19.1.1#request
https://hapi.dev/api/?v=19.1.1#response-toolkit

## Important environment variables
PORT: the port to run the server on
HOST: the host (ip address) to run the server on
DB_URL: MongoDB URL to connect to

## Getting started

Before cloning this repository and reploying to heroku install the [Heroku Toolbelt](https://toolbelt.heroku.com/).

1. `git clone git://github.com/wpreul/hapi-heroku.git && cd hapi-heroku`
2. `heroku login`
3. `heroku create`
4. `git push heroku master`
5. `heroku ps:scale web=1`
5. `heroku open`

## Route description
