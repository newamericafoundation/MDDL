<template>
  <v-list>
    <template v-for="(item, i) in items">
      <v-divider v-if="item.divider" :key="i" class="mx-6 my-3" />
      <nuxt-link
        v-else-if="item.to"
        :key="i"
        tabindex="0"
        class="nuxt-link"
        :to="localePath(item.to)"
      >
        <v-list-item router exact>
          <v-list-item-action v-if="item.icon" class="mr-4">
            <v-icon color="primary">{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="$t(item.label)" />
          </v-list-item-content>
        </v-list-item>
      </nuxt-link>
      <v-list-item
        v-else-if="item.click !== null"
        :key="i"
        @click.stop="item.click"
      >
        <v-list-item-action v-if="item.icon" class="mr-4">
          <v-icon color="primary">{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="$t(item.label)" />
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'nuxt-property-decorator'
import { NavItem } from '@/types/nav'

@Component
export default class NavItemList extends Vue {
  @Prop({ required: true }) items: NavItem[]
}
</script>

<style scoped lang="scss">
.v-list {
  width: 100%;
}
</style>
