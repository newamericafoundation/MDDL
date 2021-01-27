<template>
  <v-app-bar
    :color="color"
    fixed
    app
    clipped-right
    :extension-height="`${extensionHeight}px`"
  >
    <slot name="nav-action" />
    <template v-if="!empty">
      <v-btn
        v-if="$vuetify.breakpoint.smAndUp"
        text
        :to="localePath('/dashboard')"
        class="white--text d-flex text-heading-1 align-start py-2"
      >
        <v-img
          contain
          style="max-width: 24px"
          :src="require('@/static/images/city-icon.svg')"
          class="mr-2 mb-1"
        />
        CivicLocker
      </v-btn>
      <v-app-bar-nav-icon
        v-else-if="!customMobileNav"
        color="grey-8"
        @click.stop="() => toggleSideNav(false)"
        @keydown.stop.enter="() => toggleSideNav(true)"
      />
    </template>
    <template v-if="($vuetify.breakpoint.xs || empty) && title">
      <v-toolbar-title>
        {{ $t(title) }}
      </v-toolbar-title>
    </template>
    <v-spacer />
    <SwitchAccountButton
      v-if="
        userStore.isCbo &&
          userStore.isActingAsDelegate &&
          $vuetify.breakpoint.smAndUp
      "
    />
    <slot name="actions" />
    <template v-if="!empty">
      <v-btn
        v-if="showActivityButton"
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
      <v-row id="extension" no-gutters class="white row-extension">
        <v-col
          v-if="
            !!$slots.actionsBeneath ||
              (title && $vuetify.breakpoint.smAndUp && !empty)
          "
          cols="12"
          class="pr-2 d-flex justify-end align-center white"
        >
          <v-toolbar-title
            v-show="title && $vuetify.breakpoint.smAndUp"
            class="flex-grow-1 px-4"
          >
            {{ $t(title) }}
          </v-toolbar-title>
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
              <Breadcrumbs :value="breadcrumbs" />
            </v-col>
          </v-row>
          <slot name="extensions" />
        </v-col>
        <v-col cols="12">
          <v-divider class="my-0" />
        </v-col>
      </v-row>
      <v-navigation-drawer
        v-model="showActivity"
        fixed
        right
        mobile-breakpoint="xs"
        class="mt-16"
        floating
        width="24rem"
        style="
          box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.25);
          height: calc(100vh - 64px);
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
    <v-divider
      v-if="empty && !showExtension"
      class="my-0 full-width"
      style="position: absolute; left: 0; bottom: 0"
    />
  </v-app-bar>
</template>

<script lang="ts">
import { Vue, Component, Prop, mixins } from 'nuxt-property-decorator'
import Navigation from '@/mixins/navigation'
import { Breadcrumb } from '@/types/nav'
import { userStore } from '@/plugins/store-accessor'
import { UserRole } from '@/types/user'

@Component({
  mixins: [Navigation],
})
export default class AppBar extends mixins(Navigation) {
  @Prop({ default: false }) empty: boolean
  @Prop({ default: () => [] }) breadcrumbs: Breadcrumb[]
  @Prop({ default: '' }) title: string
  @Prop({ default: false }) customMobileNav: boolean

  showActivity = false
  userStore = userStore
  recompute = false

  mounted() {
    // TODO: attempting to get the app bar to compute its height correctly
    //       need a better way of waiting for all elements to mount and then recompute height
    this.recompute = !this.recompute
    setTimeout(() => {
      this.recompute = !this.recompute
    }, 1000)
    setTimeout(() => {
      this.recompute = !this.recompute
    }, 3000)
  }

  get showActivityButton() {
    return (
      this.$vuetify.breakpoint.smAndUp &&
      (userStore.isClient || (userStore.isCbo && userStore.isActingAsDelegate))
    )
  }

  get color() {
    return !this.empty && this.$vuetify.breakpoint.smAndUp ? 'black' : 'white'
  }

  get showExtension() {
    return (
      this.$auth.loggedIn &&
      (!!this.$slots.extensions ||
        this.breadcrumbs.length ||
        !!this.$slots.actionsBeneath ||
        this.$vuetify.breakpoint.smAndUp)
    )
  }

  get extensionElement() {
    // for some reason a ref doesn't work here
    // referencing recompute causes vue to search DOM at time element exists
    // eslint-disable-next-line no-unused-expressions
    this.recompute
    return document.getElementById('extension')
  }

  get extensionHeight() {
    if (this.extensionElement) {
      return this.extensionElement.clientHeight
    }
    return 0
  }

  async signOut() {
    this.$router.push(this.localePath('/'))
    localStorage.clear()
    await this.$auth.logout()
  }
}
</script>

<style scoped lang="scss">
.v-app-bar {
  &::v-deep .v-toolbar__extension {
    padding: 2px 0;
    background: white;
  }
  .row-extension {
    width: 100%;
  }
}
</style>
