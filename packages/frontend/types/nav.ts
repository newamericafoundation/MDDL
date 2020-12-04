export interface NavItem {
  label?: string
  to?: string // string is converted to localepath and item renders as a nuxt-link
  click?: () => void // on click handler (choose either to or do)
  icon?: string
  divider?: boolean // makes it render as a v-divider
}

export interface Breadcrumb {
  title: string
  to?: string
}
