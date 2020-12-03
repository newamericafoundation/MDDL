<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon
          class="a11y-focus"
          role="button"
          color="grey-8"
          @click.prevent="toggleSideNav"
          @keydown.prevent.enter="toggleSideNav(true)"
        />
      </template>
    </AppBar>
    <SharedOwnerList />
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, Prop, mixins } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'
import Navigation from '@/mixins/navigation'

@Component({
  head() {
    return {
      title: capitalize(this.$t('tabTitles.shared') as string),
    }
  },
  mixins: [Navigation],
})
export default class AgentDashboard extends mixins(Navigation) {}
</script>
