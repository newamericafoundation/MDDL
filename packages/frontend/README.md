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

# deploy the web app
# must be run from the ROOT LEVEL OF THE PROJECT
$ npm run deploy --city=CityName --bucket=s3://bucket-for-webapp
```

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

More info about the deployment script and setup can be found in the [infra readme](./packages/infra/README.md).

## Config

Example config can be found in [./.env.local](./.env.local). You can use this as a template for creating local dev config, however you will need to add any secrets which can't be committed (keep in mind this is an open source repo) and create your own `.env` file in the `packages/frontend` directory.

## Hygen Templates

[Hygen](https://www.hygen.io/) templates are stored in `./templates`. You can use Hygen templates to generate boilerplate code for you.

```
# install Hygen globally
yarn global add hygen
```

We currently have templates for:

- Components: Generates a component with unit tests and storybook. Also validates that component names are suitable.
- Layouts: Generates a layout with unit tests.
- Pages: Generates a page with unit tests and storybook.
- Store Modules: Generates a store module with unit tests. Also modifies the [store accessor plugin](./utils/store-accessor.ts) to export a type-safe reference to the module.
- Utils: Generates a utility module with unit tests.

## Customising Hosted Login

The frontend uses AWS Cognito hosted login to serve sign in, sign out, and other auth-related pages. Customisation can be accomplished by making changes to [hostedLogin.css](./assets/css/hostedLogin.css) and running:

```bash
aws cognito-idp set-ui-customization --user-pool-id <span style="color: #fa671d">user_pool_id</span> --client-id <span style="color: #fa671d">client_id</span> --css "$(<./packages/infra/src/assets/hostedLogin.css)"
```

Make sure to set `client_id` to the ID of the Cognito App Client you're testing. This should match the `AUTH_CLIENT_ID` parameter in your `.env` file.

If you need to test the banner image, replace `__BANNER_BACKGROUND_URL__` in the `hostedLogin.css` file locally with the full path of a image hosted in the web app, e.g. `https://dev-city.datalocker.example.com/images/city-logo.svg`

More information can be found on the AWS docs regarding permitted [CSS classes](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-ui-customization.html#cognito-user-pools-app-ui-customization-css) and [CSS variables](https://docs.amplify.aws/ui/customization/theming/q/framework/vue):

## Frontend Stack

Workspace name: frontend

- Programming language: TypeScript
- Package manager: Yarn
- UI framework: Vue.js 2
- Component library: Vuetify.js
- Nuxt.js modules: Axios, Progressive Web App (PWA)
- Linting tools: ESLint, Prettier, eslint-config-prettier
- Accessibility: eslint-plugin-vue-a11y lints static code; Vue Axe analyzes rendered components in the browser via the
  developer console.
- Testing frameworks: Jest, Storybook, (In future we will also use BrowserStack)
- Rendering mode: Single Page App
- Deployment target: Static
- CSS Preprocessing: node-sass, sass-loader, @nuxtjs/style-resources
- Vue modules: vue-class-component, nuxt-property-decorator, vuex-module-decorators

## Accessibility

ESLint includes an accessibility check of all Vue components. Futher accessibility

## Static assets

Assets under `./static` are for local development purposes only. At build time the CI/CD pipeline will pull the static assets from an S3 bucket specific to the deployment environment.

## Debugging Auth

In [./nuxt.config.js](./nuxt.config.js) set `auth.redirect = false`, and `auth.strategies.redirect_uri = 'http://localhost:3000/debug'`. Then you can navigate to /debug (on dev environment only) and do your troubleshooting using the tools there.

## Local Development with Google Analytics

You need to set your tracking ID in your [.env](./.env) file:

```
GOOGLE_ANALYTICS_TRACKING_ID=UA-00000000-1
```

And you need to add the following in [nuxt.config.js](./nuxt.config.js):

```
googleAnalytics: {
  dev: true,
  debug: {
    enabled: true,
    sendHitTask: true,
  },
}
```

## Testing on mobile

in your [.env](./.env) file, set `MOBILE_TESTING=1`

Then you can run your development server, look at the IP it is running on and add that IP to the development environment cognito config. This is required for the login flow to work correctly. See the third entry in cognito console below for example:

![IP address in cognito app client settings](./docs/mobile_development.png 'How to add local IP to cognito')

## Internationalisation

See following docs:

- [Nuxt i18n module](https://i18n.nuxtjs.org/)
- [Vue i18n framework](https://kazupon.github.io/vue-i18n/introduction.html)

To add translations for another language, follow these steps:

1. Update [messages.ts](./assets/js/messages.ts) by copying the `en` block, changing the locale to the appropriate ISO 639-2 code for the language you want to add translations for, and adding appropriate translations for all items. You will also need to import the appropriate vuetify and vee-validate translations. A guide on using `messages.ts` can be found in the [Vue i18n docs](https://kazupon.github.io/vue-i18n/started.html#html).
2. Add the ISO 639-2 code to [nuxt.config.js](./nuxt.config.js) in the list under `i18n > locales`
3. For each folder in the [content](./content) directory, add a file named with the new ISO 639-2 code, eg. `jp.ts` which will contain the markdown content for that page. You may use the english versions as a reference, although any markdown is acceptable.

> Note: A language picker will be available when navigating to `/account` as long as more than one translation has been provided. The chosen language will be preserved for the duration of the browser session, with english being the default.
