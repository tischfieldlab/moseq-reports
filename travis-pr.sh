export TRAVIS_TAG=$(npm version minor)
echo "$TRAVIS_TAG"
git tag $TRAVIS_TAG
NODE_OPTIONS=--max-old-space-size=4096 npm run build --modern
export RELEASE_NAME=${TRAVIS_TAG}.tar.gz
tar czvf ${RELEASE_NAME} dist/