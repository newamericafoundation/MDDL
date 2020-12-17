import { ThemeColor } from '@/types/theme'
import { Location } from 'vue-router'

export interface SnackAction {
  name: string
  do?: CallableFunction
  to?: string
  query?: Location['query']
}

export default interface SnackParams {
  message: string
  actions?: SnackAction[]
  dismissable?: boolean
  color?: ThemeColor
  timeoutMilliseconds?: number
}
