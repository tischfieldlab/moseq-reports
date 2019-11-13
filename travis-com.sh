#!/bin/sh
export TAG=$(npm version patch)
echo "$TAG"
cd ..
pwd

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
  git config --global push.default current
  git stash
}

commit_website_files() {
  git checkout ${TRAVIS_BRANCH}
  git stash pop
  git add .
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git push https://${GH_TOKEN}@github.com/tischfieldlab/vue-reports.git
}

setup_git
commit_website_files
upload_files
cd moseq-reports