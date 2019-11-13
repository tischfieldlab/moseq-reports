export TAG=$(npm version patch)
echo "$TAG"
git tag $TAG
cd ..
git add -A && git push && git push --tags
cd moseq-reports