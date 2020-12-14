export interface EmailSender {
  /**
   * The name of the email sender, e.g "Datalocker"
   */
  name: string
  /**
   * The address of the email sender, e.g "notifications@datalocker.com"
   */
  address: string
}
