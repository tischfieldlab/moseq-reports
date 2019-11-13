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
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git push HEAD:${TRAVIS_BRANCH}
}

setup_git
commit_website_files
upload_files
cd moseq-reports