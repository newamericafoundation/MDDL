#/bin/bash

set -eo pipefail

mkdir -p nodejs

npm install --prefix ./nodejs mysql2 knex

zip -yr layer.zip ./nodejs
