#!/bin/sh
export TAG=$(npm version patch)
echo "$TAG"
cd ..
pwd

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
}

commit_website_files() {
  git checkout -b gh-pages
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-pages https://${GH_TOKEN}@github.com/tischfieldlab/vue-reports.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-pages gh-pages
}

setup_git
commit_website_files
upload_files
cd moseq-reports