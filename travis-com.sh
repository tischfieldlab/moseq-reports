#!/bin/sh
export TAG=$(npm version patch)
echo "$TAG"
cd ..
pwd

setup_git() {
  git config --global user.email "jmc07712@yahoo.com"
  git config --global user.name "jmc07712"
}

commit_website_files() {
  git checkout -b build-branch
  git add . ./moseq-reports/package.json
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-build https://jmc07712@github.com/tischfieldlab/vue-reports.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-build build-branch
}

setup_git
commit_website_files
upload_files
cd moseq-reports