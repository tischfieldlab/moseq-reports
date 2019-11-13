#!/bin/sh
export TAG=$(npm version patch)
echo "$TAG"
echo "$TRAVIS_BRANCH"
cd ..
pwd

setup_git() {
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"
  git config --global push.default matching
}

commit_website_files() {
  git checkout ${TRAVIS_BRANCH}
  git add . ./moseq-reports/*.json
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  #git remote add origin-build https://${GH_TOKEN}@github.com/tischfieldlab/vue-reports.git > /dev/null 2>&1
  git push --quiet https://${GH_TOKEN}@github.com/tischfieldlab/vue-reports.git > /dev/null 2>&1
}

setup_git
commit_website_files
upload_files
cd moseq-reports