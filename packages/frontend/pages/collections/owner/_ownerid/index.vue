<template>
  <div>
    <SharedCollectionList :owner-id="$route.params.ownerid" />
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { DocumentListItem } from 'api-client'
import { format } from 'date-fns'

@Component
export default class OwnerCollections extends Vue {}
</script>
