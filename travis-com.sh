#!/bin/sh
export TAG=$(npm version patch)
echo "$TAG"
cd ..
pwd

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
  git config --global push.default matching
}

commit_website_files() {
  git checkout -b build-branch
  git add . ./moseq-reports/*.json
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git remote add origin-build https://${GH_TOKEN}@github.com/tischfieldlab/vue-reports.git > /dev/null 2>&1
  git push --quiet --set-upstream origin-build build-branch
}

setup_git
commit_website_files
upload_files
cd moseq-reports