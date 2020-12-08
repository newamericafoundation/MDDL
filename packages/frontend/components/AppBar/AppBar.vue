<template>
  <v-app-bar
    :color="color"
    fixed
    app
    height="52px"
    clipped-right
    :extension-height="$slots.actionsBeneath ? '98px' : '46px'"
  >
    <slot name="nav-action" />
    <template v-if="!empty">
      <v-btn
        v-if="$vuetify.breakpoint.smAndUp"
        text
        class="white--text d-flex text-heading-1 align-center"
        :to="localePath('/dashboard')"
      >
        <v-img
          contain
          style="max-width: 24px"
          :src="require('@/static/images/city-icon.svg')"
          class="mr-2"
        />
        Datalocker
      </v-btn>
      <v-app-bar-nav-icon v-else color="grey-8" @click.stop="toggleSideNav" />
    </template>
    <v-spacer />
    <SwitchAccountButton
      v-if="userStore.isCbo && userStore.isActingAsDelegate"
    />
    <slot name="actions" />
    <template v-if="!empty">
      <v-btn
        text
        color="white"
        @click.prevent="showActivity = !showActivity"
        @keydown.prevent.enter="showActivity = !showActivity"
      >
        <v-icon left color="white" small>$clock</v-icon>
        {{ $t('navigation.activity') }}
      </v-btn>
      <v-btn
        v-show="$vuetify.breakpoint.smAndUp"
        text
        class="mr-4 white--text font-weight-medium"
        @click="signOut"
      >
        {{ $t('navigation.signOut') }}
      </v-btn>
    </template>
    <template v-if="showExtension" v-slot:extension>
      <v-row
        v-if="
          !!$slots.actionsBeneath || !!$slots.extensions || breadcrumbs.length
        "
        no-gutters
        class="white"
      >
        <v-col
          v-if="!!$slots.actionsBeneath"
          cols="12"
          class="pt-2 pr-2 d-flex justify-end"
        >
          <slot name="actionsBeneath" />
        </v-col>
        <v-col v-if="!!$slots.extensions || breadcrumbs.length" cols="12">
          <v-row
            v-if="breadcrumbs.length"
            no-gutters
            class="white"
            outlined
            rounded="0"
          >
            <v-col cols="12">
              <template v-for="(crumb, i) in breadcrumbs">
                <v-btn
                  v-if="crumb.to"
                  :key="`crumb-${i}`"
                  text
                  primary
                  :to="localePath(crumb.to)"
                  :class="{ 'font-weight-bold': i === 0 }"
                >
                  {{ $t(crumb.title) }}
                </v-btn>
                <div
                  v-else
                  :key="`crumb-${i}`"
                  class="body-2 pl-4 primary--text d-inline"
                >
                  {{ crumb.title }}
                </div>
                <v-icon
                  v-if="i < breadcrumbs.length - 1"
                  :key="`crumb-chevron-${i}`"
                  class="align-center"
                  color="blue-light"
                  size="0.6rem"
                  :style="'margin-top: -0.1rem'"
                >
                  $chevron-right
                </v-icon>
              </template>
            </v-col>
          </v-row>
          <slot name="extensions" />
          <v-divider class="my-0" />
        </v-col>
      </v-row>
      <v-navigation-drawer
        v-model="showActivity"
        fixed
        right
        mobile-breakpoint="xs"
        class="mt-13"
        floating
        width="24rem"
        style="
          box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.25);
          height: calc(100vh - 52px);
        "
      >
        <div class="px-4">
          <v-card rounded="0">
            <v-card-title
              class="text-heading-2 d-flex justify-space-between grey-9--text pa-0"
            >
              {{ $t('navigation.activity') }}
              <v-btn
                icon
                class=""
                @click="showActivity = false"
                @keypress.enter="showActivity = false"
              >
                <v-icon small color="grey-8">$close-bold</v-icon>
              </v-btn>
            </v-card-title>
          </v-card>
          <ActivityList />
        </div>
      </v-navigation-drawer>
    </template>
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Prop, mixins } from 'nuxt-property-decorator'
import Navigation from '@/mixins/navigation'
import { Breadcrumb } from '@/types/nav'
import { userStore } from '@/plugins/store-accessor'

@Component({
  mixins: [Navigation],
})
export default class AppBar extends mixins(Navigation) {
  @Prop({ default: false }) empty: boolean
  @Prop({ default: () => [] }) breadcrumbs: Breadcrumb[]

  showActivity = false

  userStore = userStore

  get color() {
    return !this.empty && this.$vuetify.breakpoint.smAndUp ? 'black' : 'white'
  }

  get showExtension() {
    return (
      !!this.$slots.extensions ||
      this.breadcrumbs.length ||
      !!this.$slots.actionsBeneath
    )
  }

  async signOut() {
    await this.$auth.logout()
    this.$router.push(this.localePath('/'))
  }
}
</script>

<style scoped lang="scss">
.v-app-bar {
  &::v-deep .v-toolbar__extension {
    padding: 0;
  }
}
</style>
