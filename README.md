# Mechanism of Placebo Effect of Settings Study

## Quick tour
* The frontend, in the `frontend` folder, uses React.
* The backend, in the `backend` folder, uses Hapi.js and MongoDB.
* Shared dependencies are in the `common` folder.

## Setting up a development environment

### 1. Twitter API keys

Before running anything, you need Twitter API keys and callback URL.  You can obtain them from somebody you know, or by
applying for your own developer account [here](https://developer.twitter.com/en/apply-for-access).

The reason that the keys are not included with this repository is because if they were exposed, malicious actors could
use them for unauthorized API calls.  **Never** commit any file containing API keys -- that includes hardcoding them in
source files!

When choosing a callback URL, <http://127.0.0.1:3000> is recommended for development.  See Twitter's guide 
[here](https://developer.twitter.com/en/docs/basics/apps/guides/callback-urls).

### 2. Configure environment variables

Once you have your API keys, go into the `backend` folder and create `.env.development.local` and
`.env.production.local` using `.env.example.local` as a template.  You may also set environment variables as needed or
desired in the other .env files.

### 3. Install required software

* MongoDB.  Follow instructions at <https://docs.mongodb.com/manual/installation/>.
* NodeJS, minimum v12.  Follow instructions at <https://nodejs.org/en/>.

### 4. Install NodeJS dependences
* In any directory: run `npm install -g nodemon`. This utility watches for file changes and can automatically restart
the backend server upon any file changes.
* In the `backend` folder: run `npm install`.
* In the `frontend` folder: run `npm install`.

### 5. Run the app
1. Run `mongod` to start MongoDB.
2. In the `backend` folder: run `npm run start-dev`.
3. In the `frontend` folder: run `npm start`.

## Deploying

TODO
