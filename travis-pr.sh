export TAG=$(npm version minor)
echo "$TAG"
git tag $TAG
cd ..
git add . && git push origin HEAD:"$TRAVIS_BRANCH" && git push origin HEAD:"$TRAVIS_BRANCH" --tags
cd moseq-reports