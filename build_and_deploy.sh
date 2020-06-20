set -e # Exit the script if there's an error

HEROKU_APP_NAME=twitter-timeline-study # Adjust this as needed

echo "Compiling frontend..."
cd frontend
npm run build > /dev/null # A lot of output from the create-react-app build script, suppress it.

# Move the frontend's compiled files to ../backend/public
rm -rf ../backend/public # Remove anything that might be there already
mv build ../backend/public

echo "Compiling backend..."
cd ../backend
npx tsc

echo "Builds done."

if [ "$1" != "build-only" ]; then
    sed -i "" "/dist/d" .gitignore # Remove dist and public from .gitignore
    sed -i "" "/public/d" .gitignore
    echo "*.js.map" >> .gitignore # Ignore map files
    echo "/src" >> .gitignore # We won't need the src folder

    MESSAGE="$(git log -1 --pretty=%B)" # Most recent commit message

    set +e # Disable the earlier set -e because we want to undo things if there are errors
    git init # Temporary git repo for deploying to Heroku
    git add .
    git commit -m "$MESSAGE" # Temporary commit
    heroku git:remote -a $HEROKU_APP_NAME
    git push -f heroku master # Note the push -f will clobber any existing commits on the existing heroku remote.

    rm -rf .git # Remove the new git repo
    git checkout -- .gitignore # Discard the changes we made to .gitignore
fi
