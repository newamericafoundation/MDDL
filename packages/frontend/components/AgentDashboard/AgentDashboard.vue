<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon color="grey-8" @click.stop="toggleNav" />
      </template>
    </AppBar>
    <SharedOwnerList />
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { capitalize } from '@/assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('tabTitles.shared') as string),
    }
  },
})
export default class AgentDashboard extends Vue {
  @Prop({ required: true }) toggleNav: () => void
}
</script>
