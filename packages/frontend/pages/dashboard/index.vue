<template>
  <div>
    <AppBar>
      <template v-slot:nav-action>
        <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      </template>
      <template v-slot:actions>
        <UploadButton prepend-icon="$plus" />
        <nuxt-link :to="localePath('/share')" class="nuxt-link">
          <v-btn class="ml-4 text-body-1 font-weight-medium" color="primary">
            <v-icon>$send</v-icon>
            {{ $t('share') }}
          </v-btn>
        </nuxt-link>
      </template>
      <template v-slot:extension>
        <v-tabs v-model="currentTab" slider-color="primary" color="#000">
          <v-tab href="#tab-docs">
            <span>{{ $t('allFiles') }}</span>
          </v-tab>
          <v-tab href="#tab-collections">
            <span>{{ $t('collections') }}</span>
          </v-tab>
        </v-tabs>
      </template>
    </AppBar>
    <v-main>
      <v-container class="px-0">
        <template v-if="!loading">
          <v-tabs-items v-model="currentTab">
            <v-tab-item value="tab-docs">
              <template v-if="documents.length">
                <DocumentCard
                  v-for="(document, i) in documents"
                  :key="i"
                  :document="document"
                  :class="{ 'mb-4': $vuetify.breakpoint.smAndUp }"
                />
              </template>
              <center v-else>
                <v-img
                  max-width="30rem"
                  class="mx-auto"
                  :src="require('@/assets/images/upload.svg')"
                />
                <p class="capitalize">{{ $t('nothingHere') }}</p>
                <UploadButton label="firstFile" :text-button="true" />
              </center>
            </v-tab-item>
            <v-tab-item value="tab-collections">
              <CollectionList v-model="collections" />
            </v-tab-item>
          </v-tabs-items>
        </template>
        <template v-else>
          <v-card
            v-for="i in [0, 1, 2, 3, 4]"
            :key="i"
            class="mx-auto mb-4"
            max-width="700"
            outlined
          >
            <v-row align="center">
              <v-col class="py-0" xs="6" sm="4">
                <v-skeleton-loader type="image"></v-skeleton-loader>
              </v-col>
              <v-col>
                <v-skeleton-loader
                  type="list-item-two-line"
                ></v-skeleton-loader>
              </v-col>
            </v-row>
          </v-card>
        </template>
      </v-container>
    </v-main>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { DocumentListItem } from 'api-client'
import { userStore, snackbarStore } from '@/plugins/store-accessor'
import SnackParams from '@/types/snackbar'
import ClientDashboard from '@/layouts/dashboard.vue'

@Component({
  layout: 'dashboard',
})
export default class Documents extends Vue {
  loading = true
  currentTab = 'tab-docs'

  async mounted() {
    if (this.$route.query.showSnack) {
      snackbarStore.setVisible(true)
    }

    this.$store.commit('user/setUserId', this.$auth.user.username)
    await Promise.all([
      this.$store.dispatch('user/getDocuments'),
      this.$store.dispatch('user/getCollections'),
    ])
    this.loading = false
  }

  get documents() {
    return userStore.documents
  }

  get collections() {
    return userStore.collections
  }
}
</script>

<style scoped lang="scss"></style>
