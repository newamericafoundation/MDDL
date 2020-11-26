<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon color="grey-8" @click.stop="toggleSideNav" />
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
