#/bin/bash

set -eo pipefail

mkdir -p nodejs

npm install --prefix ./nodejs mysql2@^2.2.5 knex@^0.21.6 objection@^2.2.3

zip -yr layer.zip ./nodejs
