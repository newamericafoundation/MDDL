#/bin/bash

set -eo pipefail

rm -rf layer
mkdir -p layer

docker run --rm -v "$PWD"/layer:/lambda/opt lambci/yumda:2 yum install -y GraphicsMagick ghostscript

pushd layer
zip -yr ../layer.zip .
popd
