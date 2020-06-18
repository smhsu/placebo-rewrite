# Mechanism of Placebo Effect of Settings Study

## Quick tour
* The frontend, in the `frontend` folder, uses React.
* The backend, in the `backend` folder, uses Hapi.js and MongoDB.
* Shared dependencies are in the `common` folder.

## Setting up a development environment

These instructions are for setting up a complete app with front- and backend working.  If you're interested in only the
frontend, you can skip to step 4.  In addition, you should read the respective READMEs in the frontend and backend
folders.

### 1. Get Twitter API keys

To run the backend successfully, you need Twitter API keys and callback URL.  You can obtain them from somebody you
know, or by applying for your own developer account [here](https://developer.twitter.com/en/apply-for-access).

The reason that the keys are not included with this repository is because if they were exposed, malicious actors could
use them for unauthorized API calls.  **Never** commit any file containing API keys -- that includes hardcoding them in
source files!  Instead, put the keys in the .env files, which are set to be ignored by git already and described in
the next step.

When choosing a callback URL for development, <http://127.0.0.1:3000> is recommended.  For more details about callback
URLs, [click here](https://developer.twitter.com/en/docs/basics/apps/guides/callback-urls).

### 2. Configure environment variables

Once you have your API keys, go into the `backend` folder and create `.env.development.local` using `.env.example.local`
as a template.  You may also set environment variables as needed or desired in the other .env files.

### 3. Install required software

* MongoDB.  Follow instructions at <https://docs.mongodb.com/manual/installation/>.
* NodeJS, minimum v12.  Follow instructions at <https://nodejs.org/en/>.

### 4. Install NodeJS dependences
* In the `backend` folder: run `npm install`.
* In the `frontend` folder: run `npm install`.

### 5. Run the app
1. Run `mongod` to start MongoDB.
2. In the `backend` folder: run `npm start`.
3. In the `frontend` folder: run `npm start`.

## Building and running a production version

To build a production version, run `build_and_deploy.sh build-only`.  When it finishes, the server in the `backend`
folder will be able to serve both the frontend files and backend APIs, assuming all the environment variables are set up
correctly.  To start the server, run `npm run start-prod` inside the `backend` folder.

## Deploying a production version to Heroku

This project was made with deployment to Heroku in mind.  For detailed deployment documentation, visit
<https://devcenter.heroku.com/articles/preparing-a-codebase-for-heroku-deployment>.

1. Make an account and new app at <https://www.heroku.com>.
2. Set up a production MongoDB database.  A quick way is via Heroku's dashboard, by adding MongoDB as an add-on --
a tiny instance is available for free.
3. Install the Heroku CLI on your computer.  <https://devcenter.heroku.com/articles/heroku-cli>
4. The production version needs the variables described in `.env.example.local`, but we won't be creating a new .env
file.  Instead, configure those environment variables through Heroku, either through Heroku CLI or dashboard.  For
additional details how, visit <https://devcenter.heroku.com/articles/config-vars>.
5. Add your Heroku app's URL as a valid callback URL in your Twitter Developers configuration.
6. Configure the Heroku app name by modifiying the appropriate variable at the top of `build_and_deploy.sh`.
7. Last step -- run the `build_and_deploy.sh` script!
    * If you want to just run the build process without pushing to Heroku, you can `build_and_deploy.sh build-only`.

Once you have everything set up, you only need to repeat the last step for future deployments.
