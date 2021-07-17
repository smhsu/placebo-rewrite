set -e # Exit the script if there's an error

HEROKU_APP_NAME=twitter-timeline-study # Adjust this as needed

if [ "$1" != "deploy-only" ]; then
    cd frontend
    npm run build

    # Move the frontend's compiled files to ../backend/public
    rm -rf ../backend/public # Remove anything that might be there already
    mv build ../backend/public

    echo "Compiling backend..."
    cd ../backend
    npx tsc

    echo "Builds done."
else
    cd backend
fi


cp .heroku.gitignore .gitignore # Use the special gitignore for the Heroku push

MESSAGE="$(git log -1 --pretty=%B)" # Most recent commit message

set +e # Disable the earlier set -e because we want to undo things if there are errors
git init # Temporary git repo for deploying to Heroku
git add .
git commit -m "$MESSAGE" # Temporary commit
heroku git:remote -a $HEROKU_APP_NAME
git push -f heroku master # Note the push -f will clobber any existing commits on the existing heroku remote.

rm -rf .git # Remove the new git repo
git checkout -- .gitignore # Discard the changes we made to .gitignore
