## Build Setup

To run these scripts from the root directory, use `yarn fe <script>`.

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Config

Example config can be found in [./.env.local](./.env.local). You can use this as a template for creating local dev config, however you will need to add any secrets which can't be committed (keep in mind this is an open source repo) and create your own `.env` file in the `packages/frontend` directory.

## Hygen Templates

[Hygen](https://www.hygen.io/) templates are stored in `./templates`. You can use hygen templates to generate boilerplate code for you. We currently have templates for:

- Components: Generates a component with unit tests and storybook. Also validates that component names are suitable.
- Layouts: Generates a layout with unit tests.
- Pages: Generates a page with unit tests and storybook.
- Store Modules: Generates a store module with unit tests. Also modifies the [store accessor plugin](./utils/store-accessor.ts) to export a type-safe reference to the module.
- Utils: Generates a utility module with unit tests.

## Frontend Stack

Workspace name: frontend
Programming language: TypeScript
Package manager: Yarn
UI framework: Vue
Component library: Vuetify.js
Nuxt.js modules: Axios, Progressive Web App (PWA)
Linting tools: ESLint, Prettier, eslint-config-prettier
Testing frameworks: Jest, Storybook, (In future we will also use Browserstack)
Rendering mode: Single Page App
Deployment target: Static
CSS Preprocessing: node-sass, sass-loader, @nuxtjs/style-resources
Vue modules: vue-class-component, nuxt-property-decorator, vuex-module-decorators
