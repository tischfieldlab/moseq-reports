export TAG=$(npm version minor)
echo "$TAG"
git tag $TAG
cd ..
git add -A && git push && git push --tags
cd moseq-reports