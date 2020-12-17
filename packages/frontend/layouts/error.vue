<template>
  <v-app class="d-flex align-center">
    <div class="d-flex flex-column justify-center" style="height: 100vh">
      <v-progress-circular
        style="width: 100vw"
        indeterminate
        :size="50"
        color="primary"
      />
    </div>
  </v-app>
</template>

<script>
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  layout: 'empty',
  head() {
    return {
      title: 'An error occurred',
    }
  },
})
export default class ErrorLayout extends Vue {
  @Prop({ default: null }) error
}
</script>
