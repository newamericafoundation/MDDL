<template>
  <div tabindex="0">
    <div v-for="(activity, idx) in activities" :key="idx">
      <v-card class="activity-card mx-auto" rounded="0">
        <v-card-title
          v-if="isNewDate(activity.date, idx)"
          class="activity-card__title text-heading-3 d-flex grey-2"
        >
          <span class="text-heading-3">{{ activityDate(activity.date) }}</span>
        </v-card-title>
        <hr v-else-if="!isDuplicate(activity, idx)" />
        <v-list-item v-if="!isDuplicate(activity, idx)" three-line>
          <v-list-item-avatar size="38" color="primary" class="mr-3">
            <v-icon class="pa-1" size="30" color="white">
              {{ actionIcon(activity.type) }}
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content class="mt-2">
            <v-list-item-title class="menu-2 mb-2" style="white-space: normal">
              <template v-if="canShowActionResult(activity)">
                <span class="text-heading-3 primary--text">
                  {{ principalName(activity.principal) }}
                </span>
                <span class="text-heading-3">{{ action(activity.type) }}</span>
              </template>

              <template v-if="activity.relatedResources">
                <span
                  class="text-heading-3"
                  v-html="actionResultTranslator(activity)"
                />
              </template>
              <template v-else-if="activity.resource">
                <span class="text-heading-3">1 file</span>
              </template>
            </v-list-item-title>
            <v-list-item-subtitle>
              <div class="text-subtitle-2 grey-7--text mb-2">
                {{ activityTime(activity.date) }}
              </div>
            </v-list-item-subtitle>

            <!-- Agent(s) that resource(s) have been shared to -->
            <div
              v-if="activity.relatedResources"
              class="resources"
              :class="{ 'resources--desktop': $vuetify.breakpoint.smAndUp }"
            >
              <div
                v-for="(document, idx2) in splitFirst(
                  relatedDocuments(activity.relatedResources),
                )"
                :key="idx2"
                class="resources__item"
              >
                <v-icon size="20" class="mr-4" color="primary">$file</v-icon>
                <span class="text-body-3 grey-9--text text-truncate">
                  {{ document.name }}
                </span>
              </div>

              <a
                v-if="relatedDocuments(activity.relatedResources).length > 5"
                :ref="`showMoreDocumentsLink-${idx}`"
                href="#"
                class="show-more-link"
                @click.prevent="showMore(idx, 'Documents')"
                @keydown.prevent.enter="showMore(idx, 'Documents')"
              >
                +
                {{
                  splitLast(relatedDocuments(activity.relatedResources)).length
                }}
                more
              </a>

              <div
                v-if="
                  splitLast(relatedDocuments(activity.relatedResources)).length
                "
                :ref="`showMoreDocuments-${idx}`"
                :style="{ display: 'none' }"
              >
                <div
                  v-for="(document, idx3) in splitLast(
                    relatedDocuments(activity.relatedResources),
                  )"
                  :key="idx3"
                  class="resources__item"
                >
                  <v-icon size="20" class="mr-4" color="primary">$file</v-icon>
                  <span class="text-body-3 grey-9--text text-truncate">
                    {{ document.name }}
                  </span>
                </div>
              </div>
              <div v-if="agent(activity.relatedResources).length">
                <hr />
                <div
                  v-for="(item, idx4) in splitFirst(
                    agent(activity.relatedResources),
                  )"
                  :key="idx4"
                  class="resources__item"
                >
                  <v-icon size="20" class="mr-4" color="primary">
                    $profile
                  </v-icon>
                  <span class="text-body-3 grey-9--text">{{ item.name }}</span>
                </div>
                <a
                  v-if="agent(activity.relatedResources).length > 5"
                  :ref="`showMorePeopleLink-${idx}`"
                  href="#"
                  class="show-more-link"
                  @click.prevent="showMore(idx, 'People')"
                  @keydown.prevent.enter="showMore(idx, 'People')"
                >
                  +
                  {{ splitLast(agent(activity.relatedResources)).length }}
                  more
                </a>
              </div>
              <div
                v-if="splitLast(agent(activity.relatedResources)).length"
                :ref="`showMorePeople-${idx}`"
                :style="{ display: 'none' }"
              >
                <div
                  v-for="(item, idx5) in splitLast(
                    agent(activity.relatedResources),
                  )"
                  :key="idx5"
                  class="resources__item"
                >
                  <v-icon size="20" class="mr-4" color="primary">
                    $profile
                  </v-icon>
                  <span class="text-body-3 grey-9--text">{{ item.name }}</span>
                </div>
              </div>
            </div>
            <div v-else-if="activity.resource" class="resources">
              <div class="resources__item">
                <v-icon size="16" class="mr-4" color="primary">$file</v-icon>
                <span class="text-body-3">{{ document.name }}</span>
              </div>
            </div>
          </v-list-item-content>
        </v-list-item>
      </v-card>
    </div>
    <infinite-loading @infinite="fetchActivities">
      <div slot="spinner">
        <v-progress-circular
          :title="`${$t('navigation.loading')}`"
          indeterminate
          color="primary"
          class="my-10"
        />
      </div>

      <div slot="no-results">
        <div class="text-body-3 my-5">End of activity</div>
      </div>
      <div slot="no-more">
        <div class="text-body-3 my-5">End of activity</div>
      </div>
    </infinite-loading>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'
import { userStore } from '@/plugins/store-accessor'
import {
  ActivityResourceTypeEnum,
  ActivityActionTypeEnum,
  Activity,
  ActivityResource,
  ActivityPrincipal,
} from 'api-client'
import InfiniteLoading, { StateChanger } from 'vue-infinite-loading'
import {
  ActivityResourceTypeEnumMessageMap,
  ActivityResourceTypeEnumIconMap,
  RegisteredActivityActionTypes,
  ResourceMetadata,
} from '@/types/activity'
import { format, getUnixTime, parseISO } from 'date-fns'
import { cloneDeep, isEqual } from 'lodash'

@Component({
  components: { InfiniteLoading },
})
export default class ActivityList extends Vue {
  activities: Activity[] = []
  newDate = ''
  token = ''

  async fetchActivities($state: StateChanger) {
    const data = await this.$store.dispatch('user/getActivity', {
      id: userStore.userId,
      token: this.token,
    })

    if (data.activity.length) {
      // filter and sort activity history
      const arr = data.activity.filter((item: Activity) =>
        RegisteredActivityActionTypes.includes(item.type),
      )
      this.sortActivities(arr)

      this.activities.push(...arr)
      this.token = data.nextToken
      $state.loaded()
    } else {
      $state.complete()
    }
  }

  /**
   * Returns action type as UI label
   * @param action {ActivityActionTypeEnum}
   */
  action(action: ActivityActionTypeEnum) {
    return ActivityResourceTypeEnumMessageMap.get(action)
  }

  /**
   * Returns action icon
   * @param action {ActivityActionTypeEnum}
   */
  actionIcon(action: ActivityActionTypeEnum) {
    return ActivityResourceTypeEnumIconMap.get(action)
  }

  /**
   * Displays an resulting action message to the UI specific to the action type
   * @param activity {Activity}
   */
  actionResultTranslator(activity: Activity) {
    if (
      [
        ActivityActionTypeEnum.COLLECTIONCREATED,
        ActivityActionTypeEnum.DOCUMENTCREATED,
        ActivityActionTypeEnum.DOCUMENTDELETED,
        ActivityActionTypeEnum.DOCUMENTACCESSED,
      ].includes(activity.type)
    ) {
      return this.itemsNumLabel(
        this.relatedDocuments(activity?.relatedResources),
      )
    } else if (
      [ActivityActionTypeEnum.DOCUMENTEDITED].includes(activity.type)
    ) {
      return `<span class='primary--text'>${activity.resource.name}</span>`
    } else if (
      [ActivityActionTypeEnum.DELEGATEDUSERINVITED].includes(activity.type)
    ) {
      return `<span class='primary--text'>${
        activity.resource.name
      }</span> ${this.$t('activity.delegateInvited')}`
    } else if (
      [ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED].includes(
        activity.type,
      )
    ) {
      return `<span class='primary--text'>${
        activity.resource.name
      }</span> ${this.$t('activity.delegateAccepted')}`
    } else if (
      [ActivityActionTypeEnum.DELEGATEDUSERDELETED].includes(activity.type)
    ) {
      return `<span class='primary--text'>${
        activity.resource.name
      }</span> ${this.$t('activity.delegateDeleted')}`
    }
    return false
  }

  /**
   * Display logic to exclude some action types (e.g. some Delegate actions)
   * @param activity {Activity}
   */
  canShowActionResult(activity: Activity) {
    return (
      activity.relatedResources &&
      activity.type !== ActivityActionTypeEnum.DELEGATEDUSERINVITEACCEPTED &&
      activity.type !== ActivityActionTypeEnum.DELEGATEDUSERDELETED
    )
  }

  /**
   * Finds duplicate accessed resource against previous items displayed;
   * uniqueness based on principal id, resource id and exact time.
   * @param activity {Activity}
   * @param index {number}
   */
  isDuplicate(activity: Activity, index: number) {
    const metadata: ResourceMetadata = {
      principalId: activity.principal.id,
      resourceId: activity.resource.id,
      date: getUnixTime(parseISO(activity.date)),
    }

    const arr = cloneDeep(this.activities.slice(0, index))

    const found = arr.find((item) => {
      if ([ActivityActionTypeEnum.DOCUMENTACCESSED].includes(item.type)) {
        const itemMetadata: ResourceMetadata = {
          principalId: item.principal.id,
          resourceId: item.resource.id,
          date: getUnixTime(parseISO(item.date)),
        }
        return isEqual(itemMetadata, metadata)
      } else {
        return false
      }
    })
    return !!found
  }

  /**
   * Returns formatted current or past date, e.g. "Sep 3"
   * @param date {string}
   */
  activityDate(date: string) {
    const activityDate = date.split('T')[0]
    const currentDate = new Date().toISOString().split('T')[0]
    return currentDate === activityDate
      ? this.$t('activity.today')
      : format(new Date(date), 'MMM d')
  }

  /**
   * Format activity time, e.g. "2:43PM"
   * @param date {string}
   */
  activityTime(date: string) {
    return format(new Date(date), 'h:mma')
  }

  agent(resources: ActivityResource[]) {
    return resources.filter(
      (r: ActivityResource) =>
        r.type === ActivityResourceTypeEnum.COLLECTIONINDIVIDUALEMAILGRANT,
    )
  }

  document(resource: ActivityResource) {
    return resource
  }

  /**
   * Determines a new date to display or suppress current date
   * @param date {string}
   */
  isNewDate(date: string, index: number) {
    if (index !== 0) {
      const activityDate = date.split('T')[0]
      const prevDate = this.activities[index - 1].date.split('T')[0]
      return activityDate !== prevDate
    }
    return true
  }

  itemsNumLabel(resources?: ActivityResource[]) {
    const num = resources ? resources.length : 0
    const itemLabel =
      num > 1 ? this.$t('activity.files') : this.$t('activity.file')
    return `${num} ${itemLabel}`
  }

  /**
   * Returns principal name or matches to current user id and returns personalized string
   * @param principal {ActivityPrincipal}
   */
  principalName(principal: ActivityPrincipal) {
    const { id, name } = principal
    return id === userStore.userId ? this.$t('activity.you') : name
  }

  relatedDocuments(resources?: ActivityResource[]) {
    return resources?.filter((r) =>
      [
        ActivityResourceTypeEnum.DOCUMENT,
        ActivityResourceTypeEnum.DOCUMENTFILE,
      ].includes(r.type),
    )
  }

  /**
   * Sort activities by date descending
   * @param activities {Activity}
   */
  sortActivities(activities: Activity[]) {
    activities.sort(
      (a, b) => getUnixTime(parseISO(b.date)) - getUnixTime(parseISO(a.date)),
    )
    return activities
  }

  /**
   * Display logic for 'show more' elements
   * @param: ref {string} - unique DOM reference id
   * @param: type {string} - differentiate between resources and people shared to
   */
  showMore(ref: string, type: string) {
    ;(this.$refs[`showMore${type}-${ref}`] as any)[0].style.display = 'block' // eslint-disable-line
    ;(this.$refs[`showMore${type}Link-${ref}`] as any)[0].style.display = 'none'
  }

  /**
   * UI helper to flag highlight text
   * @param actionType {ActivityActionTypeEnum}
   */
  shouldHighlight(actionType: ActivityActionTypeEnum) {
    return actionType === ActivityActionTypeEnum.DOCUMENTEDITED
  }

  /**
   * Helper to return first 5 items in initial visible block of resources
   * @param resources {ActivityResource[]}
   */
  splitFirst(resources: ActivityResource[]) {
    const arr = cloneDeep(resources)
    return arr.splice(0, 5)
  }

  /**
   * Helper to return remaining resource items in hidden block
   * @param resources {ActivityResource[]}
   */
  splitLast(resources: ActivityResource[]) {
    const arr = cloneDeep(resources)
    return arr.splice(5)
  }
}
</script>

<style scoped lang="scss">
.activity-card__title {
  height: rem(38px);
  padding: 0 0 0 rem(20px);
}
.resources {
  width: 100%;
}
.resources--desktop {
  margin-left: 50px;
  // account for 50px left margin
  width: calc(100% - 50px);
}
.resources__item {
  margin: 8px 0;
  display: flex;
  align-items: center;
  width: inherit;
}
.show-more-link {
  text-decoration: none;
  margin-left: 36px;
  font-size: 15px;
}
</style>
