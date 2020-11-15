<template>
  <v-app>
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

@Component({
  auth: false,
})
export default class DefaultLayout extends Vue {
  auth: false
}
</script>

<style scoped lang="scss">
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
</style>
