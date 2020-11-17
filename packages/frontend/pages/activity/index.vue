<template>
  <div>
    <v-card class="mx-auto" :max-width="350" rounded="0">
      <v-card-title class="d-flex grey-2">TODO: 10th Oct 2020</v-card-title>
      <v-list-item three-line>
        <v-list-item-avatar size="40" color="grey"></v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="menu-2">
            TODO: shared n items
          </v-list-item-title>
          <v-list-item-subtitle>TODO: 10:20PM</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-card>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { capitalize } from '../../assets/js/stringUtils'

@Component({
  head() {
    return {
      title: capitalize(this.$t('navigation.activity') as string),
    }
  },
})
export default class Account extends Vue {}
</script>
