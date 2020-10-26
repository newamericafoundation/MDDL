<template>
  <v-window v-model="step">
    <v-window-item>
      <v-toolbar v-model="step" app flat>
        <nuxt-link class="mr-2" :to="localePath('/dashboard')">
          <v-icon>$chevron-left</v-icon>
        </nuxt-link>
        <v-toolbar-title>{{ $t('selectFiles') }}</v-toolbar-title>
        <v-spacer />
        <v-btn
          color="primary"
          text
          :disabled="selectedDocs.length === 0"
          @click="next"
        >
          {{ $t('next') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container">
        <DocumentList v-model="selectedDocs" :selectable="true" />
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
          @click="next"
        >
          {{ $t('next') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container">
        <v-row>
          <v-col cols="auto" class="pr-0">
            <v-icon v-if="true" class="mb-2">$profile</v-icon>
          </v-col>
          <v-col class="capitalize font-weight-medium">
            {{ $t('individuals') }}
          </v-col>
        </v-row>
        <ValidationObserver ref="observer">
          <v-form @submit.prevent>
            <ValidationProvider
              v-slot="{ errors }"
              name="email"
              rules="required|email"
            >
              <v-text-field
                v-model="email"
                :error-messages="errors"
                outlined
                :placeholder="capitalize($t('enterEmailPlaceholder'))"
                type="email"
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
              <v-btn text icon @click="removeEmail(i)">
                <v-icon>$close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </div>
      <v-footer outlined fixed class="pa-8 d-flex">
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
        <v-btn color="primary" text :disabled="isLoading" @click="submit">
          {{ $t('done') }}
        </v-btn>
      </v-toolbar>
      <div class="window-container">
        <p class="capitalize font-weight-medium">{{ $t('filesToShare') }}:</p>
        <v-card
          v-for="(doc, i) in selectedDocs.slice(0, 5)"
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
        <p v-if="selectedDocs.length > 5" class="d-flex justify-end">
          + {{ selectedDocs.length - 5 }} {{ $t('more') }}
        </p>
        <p class="capitalize font-weight-medium">{{ $t('recipients') }}:</p>
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
        <p
          v-if="individualEmailAddresses.length > 5"
          class="d-flex justify-end"
        >
          + {{ individualEmailAddresses.length - 5 }} {{ $t('more') }}
        </p>
      </div>
      <v-footer outlined fixed class="pa-8">
        {{ capitalize($t('shareSettingsDisclaimer')) }}
      </v-footer>
    </v-window-item>
  </v-window>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { ValidationObserver, ValidationProvider } from 'vee-validate'
import { capitalize } from '@/assets/js/stringUtils'
import { Document } from 'api-client'
import SnackParams from '@/types/snackbar'
import { RawLocation } from 'vue-router'
import { snackbarStore } from '../../plugins/store-accessor'

@Component({
  layout: 'empty',
  components: {
    ValidationObserver,
    ValidationProvider,
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

  async mounted() {
    const collections = await this.$store.dispatch('user/getCollections')
    this.name = `Collection ${collections.length + 1}`
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

  addEmail(evt: KeyboardEvent | FocusEvent) {
    if (this.emailInputValid && this.email.length) {
      const email = this.email
      this.email = ''
      ;(this.$refs.observer as any).reset()
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
      message: `${this.$t('sharingComplete')}. ${capitalize(
        this.$t('collection') as string,
      )} "${this.name}" ${this.$t('created')}`,
      actions: [
        {
          name: 'view',
          to: `/collection/${collection.id}`,
        },
      ],
    })

    this.$router.push(
      this.localeRoute({
        path: '/dashboard',
        query: {
          showSnack: 'true',
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
    max-width: 40rem;
    margin: 0 auto;
  }
  .window-container {
    padding: 5rem 2rem 0 2rem;
    margin: 0 auto 12rem auto;
    max-width: 40rem;
  }
}
.v-card.invitee {
  background-color: var(--grey-2);
  max-width: 40rem;
}
</style>
