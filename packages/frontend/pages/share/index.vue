<template>
  <v-window v-model="step">
    <v-window-item :class="{ mobile: $vuetify.breakpoint.xs }">
      <v-toolbar v-model="step" flat>
        <BackButton />
        <v-toolbar-title>{{ $t('selectFiles') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          color="primary"
          text
          class="font-weight-bold body-1"
          :disabled="selectedDocs.length === 0"
          @click="next"
        >
          {{ $t('next') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container">
        <DocumentList
          v-model="selectedDocs"
          :selectable="true"
          :pre-selected="preSelected"
        />
      </div>
    </v-window-item>
    <v-window-item>
      <v-toolbar class="mb-2" flat>
        <v-icon class="mr-2" @click="prev">$chevron-left</v-icon>
        <v-toolbar-title>{{ $t('addRecipients') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          color="primary"
          text
          :disabled="!emailInputValid || !individualEmailAddresses.length"
          class="font-weight-bold body-1"
          @click="next"
        >
          {{ $t('next') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container px-8">
        <v-row>
          <v-col cols="auto" class="pr-0">
            <v-icon v-if="true" class="mb-2">$profile</v-icon>
          </v-col>
          <v-col class="capitalize font-weight-medium">
            {{ $t('recipients') }}
          </v-col>
        </v-row>
        <ValidationObserver ref="observer">
          <v-form @submit.prevent>
            <ValidationProvider
              v-slot="{ errors }"
              mode="eager"
              name="email"
              :rules="emailValidationRules"
            >
              <v-text-field
                v-model="email"
                :error-messages="
                  individualEmailAddresses.length >= 10
                    ? [capitalize($t('tooManyRecipients'))]
                    : errors
                "
                outlined
                :placeholder="capitalize($t('enterEmailPlaceholder'))"
                type="email"
                :disabled="individualEmailAddresses.length >= 10"
                @keydown.enter="addEmail"
                @blur="addEmail"
              />
            </ValidationProvider>
          </v-form>
        </ValidationObserver>
        <v-card
          v-for="(email, i) in individualEmailAddresses"
          :key="i"
          rounded
          class="invitee px-4 py-1 mb-2"
        >
          <v-row align="center" no-gutters>
            <v-col>
              <span>{{ email }}</span>
            </v-col>
            <v-col cols="auto">
              <v-btn icon @click="removeEmail(i)">
                <v-icon>$close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <v-footer outlined class="pa-8 d-flex">
        <span class="font-weight-medium capitalize">
          {{ $t('disclaimer') }}:&nbsp;
        </span>
        {{ $t('shareDocumentDisclaimer') }}
      </v-footer>
    </v-window-item>
    <v-window-item>
      <v-toolbar class="mb-8" flat>
        <v-icon class="mr-2" :disabled="isLoading" @click="prev">
          $chevron-left
        </v-icon>
        <v-toolbar-title>{{ $t('confirmSharing') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          class="font-weight-bold body-1"
          color="primary"
          text
          :disabled="isLoading"
          @click="submit"
        >
          {{ $t('done') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container px-8">
        <p class="capitalize font-weight-medium pt-4">
          {{ $tc('confirmSharedFiles', selectedDocs.length) }}:
        </p>
        <v-card
          v-for="(doc, i) in selectedDocs.slice(0, sliceFiles)"
          :key="`file-${i}`"
          rounded
          class="invitee px-4 py-4 mb-2"
        >
          <v-row align="center" no-gutters>
            <v-col class="pr-4" cols="auto">
              <v-icon>$document</v-icon>
            </v-col>
            <v-col>
              <span>{{ doc.name }}</span>
            </v-col>
          </v-row>
        </v-card>
        <v-btn
          v-if="selectedDocs.length > sliceFiles"
          class="float-right"
          text
          @click="sliceFiles = 10"
        >
          {{ $tc('plusNMore', selectedDocs.length - sliceFiles) }}
        </v-btn>
        <p class="capitalize font-weight-medium pt-8">
          {{ $tc('confirmSharedRecipients', individualEmailAddresses.length) }}:
        </p>
        <v-card
          v-for="(email, i) in individualEmailAddresses.slice(0, 5)"
          :key="`recipient-${i}`"
          rounded
          class="invitee px-4 py-4 mb-2 d-flex"
        >
          <v-row align="center" no-gutters>
            <v-col class="pr-4" cols="auto">
              <v-icon>$profile</v-icon>
            </v-col>
            <v-col>
              <span>{{ email }}</span>
            </v-col>
          </v-row>
        </v-card>
        <v-btn
          v-if="individualEmailAddresses.length > sliceRecipients"
          class="float-right"
          text
          @click="sliceRecipients = 10"
        >
          {{
            $tc('plusNMore', individualEmailAddresses.length - sliceRecipients)
          }}
        </v-btn>
      </div>
      <v-footer outlined class="pa-8">
        {{ capitalize($t('shareSettingsDisclaimer')) }}
      </v-footer>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { validate, ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'
import { Document } from 'api-client'
import SnackParams from '@/types/snackbar'
import { RawLocation } from 'vue-router'
import { VeeObserver } from 'vee-validate/dist/types/types'
import { ValidationContext } from 'vee-validate/dist/types/components/common'
import { snackbarStore } from '../../plugins/store-accessor'

@Component({
  layout: 'empty',
  components: {
    ValidationObserver,
    ValidationProvider,
  },
  head() {
    return {
      title: capitalize(this.$t('share') as string),
    }
  },
})
export default class Share extends Vue {
  selectedDocs: Document[] = []
  individualEmailAddresses: string[] = []

  step = 0
  length = 3
  capitalize = capitalize
  email = ''
  recompute = false
  isLoading = false
  name = ''
  sliceFiles = 5
  sliceRecipients = 5
  emailValidationRules = ''

  async mounted() {
    const collections = await this.$store.dispatch('user/getCollections')
    this.name = `Collection ${collections.length + 1}`

    // we wait until mounted to assign this since jest cannot mock $config
    // until the component is mounted
    this.emailValidationRules = `required|email|emailWhitelist:${this.$config.agencyEmailDomainsWhitelist}`
  }

  next() {
    this.step += this.step < this.length ? 1 : 0
  }

  prev() {
    this.step -= this.step > 0 ? 1 : 0
  }

  get emailInputValid() {
    // Referencing this.recompute forces this.$refs.observer to be updated
    // eslint-disable-next-line no-unused-expressions
    this.recompute
    return this.$refs.observer instanceof ValidationObserver
      ? (this.$refs.observer as any).fields.email.valid || this.email === ''
      : false
  }

  get preSelected() {
    if (!this.$route.query.selected) return []
    if (!Array.isArray(this.$route.query.selected))
      return [this.$route.query.selected]
    return this.$route.query.selected
  }

  async addEmail(evt: KeyboardEvent | FocusEvent) {
    await (this.$refs.observer as any).validate()
    if (this.emailInputValid && this.email.length) {
      const email = this.email
      this.email = ''
      this.$nextTick(() => (this.$refs.observer as any).reset())
      if (!this.individualEmailAddresses.includes(email))
        this.individualEmailAddresses.push(email)
    }
  }

  removeEmail(index: number) {
    this.individualEmailAddresses.splice(index, 1)
  }

  async submit() {
    this.isLoading = true
    const collection = await this.$store.dispatch('user/createCollection', {
      name: this.name,
      documentIds: this.selectedDocs.map(d => d.id),
      individualEmailAddresses: this.individualEmailAddresses,
      agencyOfficersEmailAddresses: [], // TODO: implement
    })

    await snackbarStore.setParams({
      message: `${capitalize(
        this.$t('sharingComplete') as string,
      )}.\n${capitalize(this.$t('collectionCreatedConfirmation') as string)}`,
      actions: [
        {
          name: 'view',
          to: `/collections/${collection.id}`,
        },
      ],
    })

    this.$router.push(
      this.localeRoute({
        path: '/dashboard',
        query: {
          showSnack: 'true',
          tab: 'tab-collections',
        },
      }) as RawLocation,
    )
  }

  /**
   * Unfortunately we need this little hack to get emailInputValid to
   * recognise when ValidationObserver is added to the DOM
   */
  @Watch('step')
  recomputer() {
    setTimeout(() => {
      this.recompute = !this.recompute
    }, 500)
  }
}
</script>

<style lang="scss">
.v-window {
  height: 100vh;
  .v-toolbar {
    position: fixed;
    width: 100vw;
    z-index: 2;
  }
  .v-footer {
    background-color: var(--white);
    border-bottom: none;
    border-left: none;
    border-right: none;
    margin: 0 auto;
  }
  .window-container {
    padding-top: 5rem;
    margin: 0 auto 6rem auto;
  }
  .v-window-item.mobile .window-container {
    padding: 5rem 0 0 0;
  }
}
.v-card.invitee {
  background-color: var(--grey-2);
  max-width: 40rem;
}
</style>
