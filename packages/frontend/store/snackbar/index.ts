import { Module, VuexModule, Mutation, Action } from 'vuex-module-decorators'
import SnackParams from '@/types/snackbar'
import { ThemeColor } from '@/types/theme'

@Module({
  name: 'snackbar',
  stateFactory: true,
  namespaced: true,
})
export default class Snackbar extends VuexModule {
  _params: SnackParams = {
    message: '',
    dismissable: true,
    color: ThemeColor.PRIMARY,
  }

  visible = false
  _progress: number | null = null

  _timeout: number = 0

  get isVisible() {
    return this.visible
  }

  get message() {
    return this._params.message
  }

  get linkActions() {
    return this._params.actions
      ? this._params.actions.filter((a) => a.to !== undefined)
      : []
  }

  get clickActions() {
    return this._params.actions
      ? this._params.actions.filter((a) => a.do !== undefined)
      : []
  }

  get isDismissable() {
    return this._params.dismissable === undefined
      ? true
      : this._params.dismissable
  }

  get color() {
    return this._params.color ?? ThemeColor.PRIMARY
  }

  get progress() {
    return this._progress
  }

  @Action
  async setParams(payload: SnackParams) {
    await this.context.commit('_setParams', payload)
    await this.context.commit('_setTimeout', 0)
    if (
      this._params.timeoutMilliseconds &&
      this._params.timeoutMilliseconds > 0
    ) {
      await this.context.commit(
        '_setTimeout',
        window.setTimeout(() => {
          this.context.commit('setVisible', false)
        }, this._params.timeoutMilliseconds),
      )
    }
  }

  @Mutation
  _setTimeout(timeout: number) {
    if (timeout === 0) {
      window.clearTimeout(this._timeout)
      this._timeout = 0
    } else {
      this._timeout = timeout
    }
  }

  @Mutation
  _setParams(payload: SnackParams) {
    this._params = payload
    this._params.timeoutMilliseconds = payload.timeoutMilliseconds ?? 5000
    this._progress = null
  }

  @Mutation
  setVisible(payload: boolean) {
    this.visible = payload
  }

  @Mutation
  setProgress(payload: number) {
    this._progress = payload
  }
}
