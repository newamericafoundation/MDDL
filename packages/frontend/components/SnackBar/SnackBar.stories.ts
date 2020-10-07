export default {
  title: 'Components/SnackBar',
}

export const Info = () => `
  <SnackBar :value="true">
    Test message
    <template v-slot:action="{ attrs }">
      <nuxt-link v-bind="attrs">
        Test link
      </nuxt-link>
    </template>
  </SnackBar>
`

export const Links = () => `
  <SnackBar :value="true">
    Test message
    <template v-slot:action="{ attrs }">
      <nuxt-link v-bind="attrs">
        Test link
      </nuxt-link>
    </template>
  </SnackBar>
`

export const NonDismissable = () => `
  <SnackBar :value="true" :dismissable="false">
    Test message
  </SnackBar>
`

export const Empty = () => '<SnackBar :value="true" />'
