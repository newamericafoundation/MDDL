<template>
  <v-main class="blue-super-light">
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon color="grey-8" @click.stop="toggleSideNav" />
      </template>
    </AppBar>
    <v-window v-model="$route.query.tab">
      <v-window-item value="switch">
        <ClientList>
          <p class="menu-2 capitalize py-4 mb-0 mx-8 font-weight-medium">
            {{ $t('cbo.selectClient') }}
          </p>
          <v-divider class="full-width" />
        </ClientList>
      </v-window-item>
      <v-window-item value="manage">
        <ClientList :deletable="true">
          <p class="menu-2 capitalize py-4 mb-0 mx-8 font-weight-medium">
            {{ closeText[0] }}
            <v-icon small>$close</v-icon>
            {{ closeText[1] }}
          </p>
          <v-divider class="full-width" />
        </ClientList>
      </v-window-item>
    </v-window>
  </v-main>
</template>

<script lang="ts">
import { Vue, Component, mixins } from 'nuxt-property-decorator'
import Navigation from '@/mixins/navigation'

@Component({
  mixins: [Navigation],
})
export default class CboDashboard extends mixins(Navigation) {
  get closeText() {
    return (this.$t('cbo.clickToRemove') as string).split('{close}')
  }
}
</script>
