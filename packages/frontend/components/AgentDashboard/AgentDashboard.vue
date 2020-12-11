<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:extensions>
        <v-row no-gutters class="white" outlined rounded="0">
          <v-col cols="12">
            <div class="pa-3">
              {{ $t('agent.selectClient') }}
            </div>
          </v-col>
        </v-row>
      </template>
    </AppBar>
    <DesktopSideBar />
    <SharedOwnerList />
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'

@Component({
  head() {
    return {
      title: this.$t('tabTitles.shared') as string,
    }
  },
})
export default class AgentDashboard extends Vue {}
</script>
