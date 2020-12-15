<template>
  <v-app>
    <v-toolbar v-if="title" class="primary" elevation="0">
      <v-toolbar-title class="white--text text-center" style="width: 100vw">
        {{ $t(title) }}
      </v-toolbar-title>
    </v-toolbar>
    <v-main>
      <v-container class="landing-layout-container">
        <div class="landing-layout-container-inner">
          <nuxt />
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { userStore } from '@/plugins/store-accessor'

@Component({
  auth: false,
})
export default class DefaultLayout extends Vue {
  auth: false

  get title() {
    if (userStore.isCbo) {
      return 'landing.community'
    } else if (userStore.isAgent) {
      return 'landing.agency'
    }
    return ''
  }
}
</script>

<style scoped lang="scss">
.v-application {
  .landing-layout-container {
    display: flex;
    flex-direction: column;
    padding: 0;
  }
  .landing-layout-container-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
  }
}
</style>
