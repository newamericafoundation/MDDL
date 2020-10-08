/* tslint:disable */
/* eslint-disable */

/**
 *
 * @export
 * @interface Agency
 */
export interface Agency {
  /**
   *
   * @type {string}
   * @memberof Agency
   */
  id: string
  /**
   *
   * @type {string}
   * @memberof Agency
   */
  name: string
}
/**
 *
 * @export
 * @interface AgencyList
 */
export interface AgencyList {
  /**
   *
   * @type {Array<Agency>}
   * @memberof AgencyList
   */
  agencies: Array<Agency>
}
/**
 *
 * @export
 * @interface Document
 */
export interface Document {
  /**
   *
   * @type {string}
   * @memberof Document
   */
  id: string
  /**
   * Document name (system or user provided)
   * @type {string}
   * @memberof Document
   */
  name: string
  /**
   *
   * @type {string}
   * @memberof Document
   */
  createdDate: string
  /**
   *
   * @type {Array<DocumentFile>}
   * @memberof Document
   */
  files: Array<DocumentFile>
  /**
   *
   * @type {object}
   * @memberof Document
   */
  links: object
}
/**
 *
 * @export
 * @interface DocumentCreate
 */
export interface DocumentCreate {
  /**
   * Document name (system or user provided)
   * @type {string}
   * @memberof DocumentCreate
   */
  name: string
  /**
   *
   * @type {Array<DocumentCreateFile>}
   * @memberof DocumentCreate
   */
  files: Array<DocumentCreateFile>
}
/**
 *
 * @export
 * @interface DocumentCreateFile
 */
export interface DocumentCreateFile {
  /**
   * File original name
   * @type {string}
   * @memberof DocumentCreateFile
   */
  name: string
  /**
   *
   * @type {FileContentTypeEnum}
   * @memberof DocumentCreateFile
   */
  contentType: FileContentTypeEnum
  /**
   * SHA256 Checksum of file content
   * @type {string}
   * @memberof DocumentCreateFile
   */
  sha256Checksum: string
}
/**
 *
 * @export
 * @interface DocumentFile
 */
export interface DocumentFile {
  /**
   *
   * @type {string}
   * @memberof DocumentFile
   */
  id: string
  /**
   * File original name
   * @type {string}
   * @memberof DocumentFile
   */
  name: string
  /**
   *
   * @type {FileContentTypeEnum}
   * @memberof DocumentFile
   */
  contentType: FileContentTypeEnum
  /**
   * SHA256 Checksum of file content
   * @type {string}
   * @memberof DocumentFile
   */
  sha256Checksum: string
  /**
   *
   * @type {string}
   * @memberof DocumentFile
   */
  createdDate: string
  /**
   *
   * @type {object}
   * @memberof DocumentFile
   */
  links: object
}
/**
 *
 * @export
 * @interface DocumentGrant
 */
export interface DocumentGrant {
  /**
   *
   * @type {string}
   * @memberof DocumentGrant
   */
  id: string
  /**
   *
   * @type {DocumentGrantType}
   * @memberof DocumentGrant
   */
  type: DocumentGrantType
  /**
   *
   * @type {string}
   * @memberof DocumentGrant
   */
  createdDate: string
  /**
   *
   * @type {DocumentGrantAgencyDetails}
   * @memberof DocumentGrant
   */
  agencyDetails: DocumentGrantAgencyDetails
  /**
   *
   * @type {object}
   * @memberof DocumentGrant
   */
  links: object
}
/**
 *
 * @export
 * @interface DocumentGrantAgencyDetails
 */
export interface DocumentGrantAgencyDetails {
  /**
   * The ID of the agency
   * @type {string}
   * @memberof DocumentGrantAgencyDetails
   */
  id?: string
  /**
   *
   * @type {object}
   * @memberof DocumentGrantAgencyDetails
   */
  links?: object
}
/**
 *
 * @export
 * @interface DocumentGrantCreate
 */
export interface DocumentGrantCreate {
  /**
   *
   * @type {DocumentGrantType}
   * @memberof DocumentGrantCreate
   */
  type: DocumentGrantType
  /**
   *
   * @type {DocumentGrantCreateAgencyDetails}
   * @memberof DocumentGrantCreate
   */
  agencyDetails: DocumentGrantCreateAgencyDetails
}
/**
 *
 * @export
 * @interface DocumentGrantCreateAgencyDetails
 */
export interface DocumentGrantCreateAgencyDetails {
  /**
   * The ID of the agency
   * @type {string}
   * @memberof DocumentGrantCreateAgencyDetails
   */
  id?: string
}
/**
 *
 * @export
 * @interface DocumentGrantList
 */
export interface DocumentGrantList {
  /**
   *
   * @type {Array<DocumentGrant>}
   * @memberof DocumentGrantList
   */
  documentGrants: Array<DocumentGrant>
}
/**
 * Document Grant Type
 * @export
 * @enum {string}
 */
export enum DocumentGrantType {
  AGENCYACCESS = 'AGENCY_ACCESS',
}

/**
 *
 * @export
 * @interface DocumentList
 */
export interface DocumentList {
  /**
   *
   * @type {Array<DocumentListItem>}
   * @memberof DocumentList
   */
  documents: Array<DocumentListItem>
}
/**
 *
 * @export
 * @interface DocumentListItem
 */
export interface DocumentListItem {
  /**
   *
   * @type {string}
   * @memberof DocumentListItem
   */
  id: string
  /**
   *
   * @type {string}
   * @memberof DocumentListItem
   */
  name: string
  /**
   *
   * @type {string}
   * @memberof DocumentListItem
   */
  createdDate: string
  /**
   *
   * @type {object}
   * @memberof DocumentListItem
   */
  links: object
}
/**
 *
 * @export
 * @interface DocumentUpdate
 */
export interface DocumentUpdate {
  /**
   * Document description
   * @type {string}
   * @memberof DocumentUpdate
   */
  name: string
}
/**
 * File content type
 * @export
 * @enum {string}
 */
export enum FileContentTypeEnum {
  ApplicationPdf = 'application/pdf',
  ImageJpeg = 'image/jpeg',
  ImagePng = 'image/png',
  ImageTiff = 'image/tiff',
}

/**
 *
 * @export
 * @interface User
 */
export interface User {
  /**
   *
   * @type {string}
   * @memberof User
   */
  id: string
  /**
   *
   * @type {string}
   * @memberof User
   */
  givenName: string
  /**
   *
   * @type {string}
   * @memberof User
   */
  familyName: string
  /**
   *
   * @type {object}
   * @memberof User
   */
  links: object
}
/**
 *
 * @export
 * @interface UserDelegatedAccess
 */
export interface UserDelegatedAccess {
  /**
   *
   * @type {string}
   * @memberof UserDelegatedAccess
   */
  email: string
  /**
   *
   * @type {User}
   * @memberof UserDelegatedAccess
   */
  allowsAccessToUser?: User
  /**
   *
   * @type {string}
   * @memberof UserDelegatedAccess
   */
  createdDate: string
  /**
   *
   * @type {object}
   * @memberof UserDelegatedAccess
   */
  links: object
}
/**
 *
 * @export
 * @interface UserDelegatedAccessCreate
 */
export interface UserDelegatedAccessCreate {
  /**
   *
   * @type {string}
   * @memberof UserDelegatedAccessCreate
   */
  email: string
}
/**
 *
 * @export
 * @interface UserDelegatedAccessList
 */
export interface UserDelegatedAccessList {
  /**
   *
   * @type {Array<UserDelegatedAccess>}
   * @memberof UserDelegatedAccessList
   */
  delegatedAccess: Array<UserDelegatedAccess>
}
