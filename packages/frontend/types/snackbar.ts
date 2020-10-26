import { ThemeColor } from '@/types/theme'

export interface SnackAction {
  name: string
  do?: CallableFunction
  to?: string
}

export default interface SnackParams {
  message: string
  actions?: SnackAction[]
  dismissable?: boolean
  color?: ThemeColor
}
