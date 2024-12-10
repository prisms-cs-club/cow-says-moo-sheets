// Type definitions for firestore-google-apps-script
// Project: https://github.com/grahamearley/FirestoreGoogleAppsScript
// Definitions by: LaughDonor <https://github.com/LaughDonor>
// TypeScript Version: 3.9
/* eslint @typescript-eslint/triple-slash-reference: "off" */
/* eslint @typescript-eslint/no-unused-vars: "off" */

/// <reference path="Auth.d.ts"/>
/// <reference path="Common.d.ts"/>
/// <reference path="Query.d.ts"/>
/// <reference path="Test.d.ts"/>

import FirestoreAPI = gapi.client.firestore;
type Value = null | boolean | number | string | FirestoreAPI.LatLng | Date | ValueObject | ValueArray;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ValueObject extends Record<string, Value> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ValueArray extends Array<Value> {}

interface QueryCallback {
  (query: FirestoreApp.Query): Document[];
}

declare namespace FirestoreApp {
  /**
   * Firestore Document
   */
  class Document implements FirestoreAPI.Document, FirestoreAPI.MapValue {
    fields?: Record<string, FirestoreAPI.Value>;
    createTime?: string;
    updateTime?: string;
    readTime?: string;
    name?: string;
    /**
     *
     *
     * @param obj
     * @param name
     */
    constructor(obj: Value | FirestoreAPI.Document, name?: string | Document | FirestoreAPI.ReadOnly);
    get created(): Date;
    get updated(): Date;
    get read(): Date;
    get path(): string | undefined;
    /**
     * Extract fields from a Firestore document.
     *
     * @param {object} firestoreDoc the Firestore document whose fields will be extracted
     * @return {object} an object with the given document's fields and values
     */
    get obj(): Record<string, Value>;
    toString(): string;
    static unwrapValue(obj: FirestoreAPI.Value): Value;
    static unwrapObject(obj: FirestoreAPI.MapValue): ValueObject;
    static unwrapArray(wrappedArray?: FirestoreAPI.Value[]): Value[];
    static unwrapDate(wrappedDate: string): Date;
    static wrapValue(val: Value): FirestoreAPI.Value;
    static wrapString(string: string): FirestoreAPI.Value;
    static wrapObject(obj: ValueObject): FirestoreAPI.Value;
    static wrapMap(obj: ValueObject): FirestoreAPI.MapValue;
    static wrapNull(): FirestoreAPI.Value;
    static wrapBytes(bytes: string): FirestoreAPI.Value;
    static wrapRef(ref: string): FirestoreAPI.Value;
    static wrapNumber(num: number): FirestoreAPI.Value;
    static wrapInt(int: number): FirestoreAPI.Value;
    static wrapDouble(double: number): FirestoreAPI.Value;
    static wrapBoolean(boolean: boolean): FirestoreAPI.Value;
    static wrapDate(date: Date): FirestoreAPI.Value;
    static wrapLatLong(latLong: FirestoreAPI.LatLng): FirestoreAPI.Value;
    static wrapArray(array: any[]): FirestoreAPI.Value;
  }
  /**
   * Auth token is formatted to {@link https://developers.google.com/identity/protocols/oauth2/service-account#authorizingrequests}
   *
   * @private
   * @param email the database service account email address
   * @param key the database service account private key
   * @param authUrl the authorization url
   * @returns {string} the access token needed for making future requests
   */
  class Auth {
    email: string;
    key: string;
    authUrl: string;
    scope: string;
    jwtHeaderBase64_: string;
    constructor(email: string, key: string);
    /**
     * Fetch the access token
     *
     * @returns {string} The generated access token string
     */
    get accessToken(): string;
    /**
     * Creates the JSON Web Token for OAuth 2.0
     *
     * @returns {string} JWT to utilize
     */
    get createJwt_(): string;
    get jwtPayload_(): JwtClaim;
    get jwtHeader_(): JwtHeader;
    get options_(): RequestOptions;
  }
  /**
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Operator_1 FieldFilter Operator}
   */
  enum FieldFilterOps_ {
    "==" = "EQUAL",
    "===" = "EQUAL",
    "<" = "LESS_THAN",
    "<=" = "LESS_THAN_OR_EQUAL",
    ">" = "GREATER_THAN",
    ">=" = "GREATER_THAN_OR_EQUAL",
    "contains" = "ARRAY_CONTAINS",
    "containsany" = "ARRAY_CONTAINS_ANY",
    "in" = "IN",
  }
  /**
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Operator_2 UnaryFilter Operator}
   */
  enum UnaryFilterOps_ {
    "nan" = "IS_NAN",
    "null" = "IS_NULL",
  }
  /**
   * An internal object that acts as a Structured Query to be prepared before execution.
   * Chain methods to update query. Must call .execute to send request.
   *
   * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery Firestore Structured Query}
   */
  class Query implements FirestoreAPI.StructuredQuery {
    select?: FirestoreAPI.Projection;
    from?: FirestoreAPI.CollectionSelector[];
    where?: FirestoreAPI.Filter;
    orderBy?: FirestoreAPI.Order[];
    startAt?: FirestoreAPI.Cursor;
    endAt?: FirestoreAPI.Cursor;
    offset?: number;
    limit?: number;
    callback: QueryCallback;
    /**
     * @param {string} from the base collection to query
     * @param {QueryCallback} callback the function that is executed with the internally compiled query
     */
    constructor(from: string, callback: QueryCallback);
    fieldRef_(field: string): FirestoreAPI.FieldReference;
    fieldFilter_(field: string, operator: string, value: any): FirestoreAPI.FieldFilter;
    unaryFilter_(operator: string, field: string): FirestoreAPI.UnaryFilter;
    order_(field: string, dir?: string): FirestoreAPI.Order;
    validateFieldFilter_(val: string): val is FieldFilterOps_;
    validateUnaryFilter_(val: string): val is UnaryFilterOps_;
    filter_(field: string, operator: string | number | null, value: any): FirestoreAPI.Filter;
    /**
     * Select Query which can narrow which fields to return.
     * Can be repeated if multiple fields are needed in the response.
     *
     * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Projection Select}
     * @param {string} field The field to narrow down (if empty, returns name of document)
     * @return {this} this query object for chaining
     */
    Select(field?: string): this;
    /**
     * Filter Query by a given field and operator (or additionally a value).
     * Can be repeated if multiple filters required.
     * Results must satisfy all filters.
     *
     * @param {string} field The field to reference for filtering
     * @param {string} operator The operator to filter by. {@link fieldOps} {@link unaryOps}
     * @param {any} [value] Object to set the field value to. Null if using a unary operator.
     * @return {this} this query object for chaining
     */
    Where(field: string, operator: string | number | null, value?: any): this;
    /**
     * Orders the Query results based on a field and specific direction.
     * Can be repeated if additional ordering is needed.
     *
     * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1/StructuredQuery#Projection Select}
     * @param {string} field The field to order by.
     * @param {string} dir The direction to order the field by. Should be one of "asc" or "desc". Defaults to Ascending.
     * @return {this} this query object for chaining
     */
    OrderBy(field: string, dir?: string): this;
    /**
     * Offsets the Query results by a given number of documents.
     *
     * @param {number} offset Number of results to skip
     * @return {this} this query object for chaining
     */
    Offset(offset: number): this;
    /**
     * Limits the amount Query results returned.
     *
     * @param {number} limit Number of results limit
     * @return {this} this query object for chaining
     */
    Limit(limit: number): this;
    /**
     * Sets the range of Query results returned.
     *
     * @param {number} start Start result number (inclusive)
     * @param {number} end End result number (inclusive)
     * @return {this} this query object for chaining
     */
    Range(start: number, end: number): this;
    /**
     * Executes the query with the given callback method and the generated query.
     * Must be used at the end of any query for execution.
     *
     * @return {Document[]} The query results from the execution
     */
    Execute(): Document[];
  }
  /**
   * Extends Firestore class with private method
   */
  class FirestoreRead {
    /**
     * Get the Firestore document or collection at a given path.
     * If the collection contains enough IDs to return a paginated result, this method only returns the first page.
     *
     * @param {string} path the path to the document or collection to get
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} the JSON response from the GET request
     */
    get_(path: string, request: Request): Request;
    /**
     * Get a page of results from the given path.
     * If null pageToken is supplied, returns first page.
     *`
     * @param {string} path the path to the document or collection to get
     * @param {string} pageToken if defined, is utilized for retrieving subsequent pages
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} the JSON response from the GET request
     */
    getPage_(path: string, pageToken: string | null, request: Request): Request;
    /**
     * Get a list of the JSON responses received for getting documents from a collection.
     * The items returned by this function are formatted as Firestore documents (with types).
     *
     * @param {string} path the path to the collection
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} an array of Firestore document objects
     */
    getDocumentResponsesFromCollection_(path: string, request: Request): Record<string, any>[];
    /**
     * Get a list of all IDs of the documents in a collection.
     * Works with nested collections.
     *
     * @param {string} path the path to the collection
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} an array of IDs of the documents in the collection
     */
    getDocumentIds_(path: string, request: Request): string[];
    /**
     * Get a document.
     *
     * @param {string} path the path to the document
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} an object maexpping the document's fields to their values
     */
    getDocument_(path: string, request: Request): Document;
    /**
     * Get documents with given IDs.
     *
     * @see {@link https://firebase.google.com/docs/firestore/reference/rest/v1beta1/projects.databases.documents/batchGet Firestore Documents BatchGet}
     * @param {string} path the path to the document
     * @param {string} request the Firestore Request object to manipulate
     * @param {array} ids String array of document names
     * @return {object} an object mapping the document's fields to their values
     */
    getDocuments_(path: string, request: Request, ids: string[]): Document[];
    /**
     * Set up a Query to receive data from a collection
     *
     * @param {string} path the path to the document or collection to query
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} A FirestoreQuery object to set up the query and eventually execute
     */
    query_(path: string, request: Request): Query;
  }
  /**
   * Extends Firestore class with private method
   */
  class FirestoreWrite {
    /**
     * Create a document with the given ID and fields.
     *
     * @param {string} path the path where the document will be written
     * @param {object} fields the document's fields
     * @param {string} request the Firestore Request object to manipulate
     * @return {object} the Document object written to Firestore
     */
    createDocument_(path: string, fields: Record<string, any>, request: Request): Document;
    /**
     * Update/patch a document at the given path with new fields.
     *
     * @param {string} path the path of the document to update
     * @param {object} fields the document's new fields
     * @param {string} request the Firestore Request object to manipulate
     * @param {boolean|string[]} mask the update will mask the given fields,
     * if is an array (of field names), that array would be used as the mask. i.e. true: updates only specific fields, false: overwrites document with specified fields
     * see jsdoc of the `updateDocument` method in Firestore.ts for more details
     * @return {object} the Document object written to Firestore
     */
    updateDocument_(path: string, fields: Record<string, any>, request: Request, mask?: boolean | string[]): Document;
  }
  /**
   * Extends Firestore class with private method
   */
  class FirestoreDelete {
    /**
     * Delete the Firestore document at the given path.
     * Note: this deletes ONLY this document, and not any subcollections.
     *
     * @param {string} path the path to the document to delete
     * @param {Request} request the Firestore Request object to manipulate
     * @return {Request} the JSON response from the DELETE request
     */
    deleteDocument_(path: string, request: Request): FirestoreAPI.Empty;
  }
  /**
   * An authenticated interface to a Firestore project.
   */
  class Firestore implements FirestoreRead, FirestoreWrite, FirestoreDelete {
    auth: Auth;
    basePath: string;
    baseUrl: string;
    /**
     * Constructor
     *
     * @param {string} email the user email address (for authentication)
     * @param {string} key the user private key (for authentication)
     * @param {string} projectId the Firestore project ID
     * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1")
     * @return {Firestore} an authenticated interface with a Firestore project (constructor)
     */
    constructor(email: string, key: string, projectId: string, apiVersion?: Version);
    get authToken(): string;
    get_: (path: string, request: Request) => Request;
    getPage_: (path: string, pageToken: string | null, request: Request) => Request;
    getDocumentResponsesFromCollection_: (path: string, request: Request) => Record<string, any>[];
    /**
     * Get a document.
     *
     * @param {string} path the path to the document
     * @return {object} the document object
     */
    getDocument(path: string): Document;
    getDocument_: (path: string, request: Request) => Document;
    /**
     * Get a list of all documents in a collection.
     *
     * @param {string} path the path to the collection
     * @param {array} ids [Optional] String array of document names to filter. Missing documents will not be included.
     * @return {object} an array of the documents in the collection
     */
    getDocuments(path: string, ids?: string[]): Document[];
    getDocuments_: (path: string, request: Request, ids: string[]) => Document[];
    /**
     * Get a list of all IDs of the documents in a path
     *
     * @param {string} path the path to the collection
     * @return {object} an array of IDs of the documents in the collection
     */
    getDocumentIds(path: string): string[];
    getDocumentIds_: (path: string, request: Request) => string[];
    /**
     * Create a document with the given fields and an auto-generated ID.
     *
     * @param {string} path the path where the document will be written
     * @param {object} fields the document's fields
     * @return {object} the Document object written to Firestore
     */
    createDocument(path: string, fields?: Record<string, any>): Document;
    createDocument_: (path: string, fields: Record<string, any>, request: Request) => Document;
    /**
     * Update/patch a document at the given path with new fields.
     *
     * @param {string} path the path of the document to update. If document name not provided, a random ID will be generated.
     * @param {object} fields the document's new fields
     * @param {boolean|string[]} mask if true, the update will mask the given fields,
     * if is an array (of field names), that array would be used as the mask.
     * (that way you can, for example, include a field in `mask`, but not in `fields`, and by doing so, delete that field)
     * @return {object} the Document object written to Firestore
     */
    updateDocument(path: string, fields: Record<string, any>, mask?: boolean | string[]): Document;
    updateDocument_: (
      path: string,
      fields: Record<string, any>,
      request: Request,
      mask?: boolean | string[] | undefined
    ) => Document;
    /**
     * Delete the Firestore document at the given path.
     * Note: this deletes ONLY this document, and not any subcollections.
     *
     * @param {string} path the path to the document to delete
     * @return {object} the JSON response from the DELETE request
     */
    deleteDocument(path: string): FirestoreAPI.Empty;
    deleteDocument_: (path: string, request: Request) => FirestoreAPI.Empty;
    /**
     * Run a query against the Firestore Database and return an all the documents that match the query.
     * Must call .Execute() to send the request.
     *
     * @param {string} path to query
     * @return {object} the JSON response from the GET request
     */
    query(path: string): Query;
    query_: (path: string, request: Request) => Query;
  }
  type Version = "v1" | "v1beta1" | "v1beta2";
  /**
   * Get an object that acts as an authenticated interface with a Firestore project.
   *
   * @param {string} email the user email address (for authentication)
   * @param {string} key the user private key (for authentication)
   * @param {string} projectId the Firestore project ID
   * @param {string} apiVersion [Optional] The Firestore API Version ("v1beta1", "v1beta2", or "v1")
   * @return {Firestore} an authenticated interface with a Firestore project (function)
   */
  function getFirestore(email: string, key: string, projectId: string, apiVersion?: Version): Firestore;
}
