import { includes } from 'lazy-collections'
import { createFilter } from '../pipes'
import type { IDBEventMap } from './Listenable'
import { Listenable } from './Listenable'

export type TransactableOptions = Record<never, never>

export type TransactableStatus = (
  | 'constructing'
  | 'ready'
  | 'opening'
  | 'opened'
  | 'openblocked'
  | 'openerrored'
  | 'upgradeneeded'
  | 'closing'
  | 'closed'
  | 'transacting'
  | 'transacted'
  | 'transacterrored'
  | 'transactaborted'
  | 'deleting'
  | 'deleteerrored'
  | 'deleted'
)

export type TransactEffect = (transaction: IDBTransaction) => any

export type OpenOptions = {
  version?: number
  upgradeEffect?: (db: IDBDatabase) => void
}

export type TransactOptions = (
  & {
    effect?: TransactEffect
    storeNames?: Parameters<IDBDatabase['transaction']>[0],
    mode?: Parameters<IDBDatabase['transaction']>[1],
  }
  & IDBTransactionOptions
)

export class Transactable {
  constructor (name: string, options: TransactableOptions = {}) {
    this.constructing()
    this.computedName = name

    this.ready()
  }
  private constructing () {
    this.computedStatus = 'constructing'
  }
  private computedStatus: TransactableStatus
  private listenables: { [K in keyof IDBEventMap]: Listenable<K> }[keyof IDBEventMap][] = []
  private ready () {
    this.computedStatus = 'ready'
  }

  get name () {
    return this.computedName
  }
  set name (name) {
    this.setName(name)
  }
  private computedDb: IDBDatabase
  get db() {
    return this.computedDb
  }
  private computedError: Error
  get error () {
    return this.computedError
  }
  get status () {
    return this.computedStatus
  }

  private computedName: string
  setName (name: string) {
    this.stop()
    this.computedName = name
    return this
  }

  open (options: OpenOptions = {}) {
    const { version } = options,
          status = this.status

    this.opening()

    switch (status) {
      // IDB is not open-ish, IDB is not expected to open
      case 'constructing':
      case 'ready':
      case 'openerrored':
      case 'closed':
      case 'deleted':
      case 'closing':
      case 'deleteerrored':
      case 'deleting':
        this.requestOpen(options)
        return this
        break
      // IDB is not open-ish, IDB is expected to open
      case 'opening':
        return this
      // IDB is open-ish
      case 'openblocked':
      case 'opened':
      case 'transacting':
      case 'transacted':
      case 'transacterrored':
      case 'transactaborted':
      case 'upgradeneeded':
        if (version ?? -1 > this.db.version) {
          this.requestOpen(options)
          return this
        }

        this[status]()
        return this
    }
  }
  private requestOpen (options: OpenOptions) {
    const { version, upgradeEffect } = options,
          request = indexedDB.open(this.computedName, version),
          listenables = [
            new Listenable('success')
              .listen(
                () => {
                  stopListenables()
                  switch (this.status) {
                    case 'closing':
                      request.result.close()
                      this.closed()
                      return
                    case 'deleting':
                      const db = request.result
                      db.close()
                      this.requestDelete()
                      return
                    default:
                      this.computedDb = request.result
                      this.opened()
                      return
                  }
                },
                { target: request }
              ),
            new Listenable('blocked')
              .listen(
                () => {
                  switch (this.status) {
                    case 'closing':
                      request.result.close()
                      this.closed()
                      stopListenables()
                      return
                    case 'deleting':
                      const db = request.result
                      db.close()
                      this.requestDelete()
                      stopListenables()
                      return
                    default:
                      this.openblocked()
                      return
                  }
                },
                { target: request }
              ),
            new Listenable('error')
              .listen(
                () => {
                  stopListenables()
                  switch (this.status) {
                    case 'closing':
                      request.result?.close()
                      this.closed()
                      return
                    case 'deleting':
                      const db = request.result
                      db?.close()
                      this.requestDelete()
                      return
                    default:
                      this.computedError = request.error
                      this.openerrored()
                      return
                  }
                },
                { target: request }
              ),
            new Listenable('upgradeneeded')
              .listen(
                () => {
                  switch (this.status) {
                    case 'closing':
                      request.result.close()
                      // Don't set closed here: the abort triggers an error event
                      // which will handle the closing → closed transition
                      return
                    case 'deleting':
                      const db = request.result
                      db.close()
                      this.requestDelete()
                      return
                    default:
                      this.computedDb = request.result
                      this.upgradeneeded()
                      upgradeEffect?.(request.result)
                      return
                  }
                },
                { target: request }
              ),
          ],
          stopListenables = () => this.stopListenables(listenables)

    this.listenables.push(...listenables)
  }
  private opening () {
    this.computedStatus = 'opening'
  }
  private opened () {
    this.computedStatus = 'opened'
  }
  private openblocked () {
    this.computedStatus = 'openblocked'
  }
  private openerrored () {
    this.computedStatus = 'openerrored'
  }
  private upgradeneeded () {
    this.computedStatus = 'upgradeneeded'
  }

  transact (effect: TransactEffect, options: TransactOptions = {}) {
    const {
            storeNames = [],
            mode = 'readonly',
            ...transactionOptions
          } = options,
          transaction = this.db.transaction(storeNames, mode, transactionOptions),
          listenables = [
            new Listenable('complete')
              .listen(
                () => {
                  switch (this.status) {
                    case 'closing':
                      this.closed()
                      break
                    default:
                      this.transacted()
                      break
                  }

                  stopListenables()
                },
                { target: transaction }
              ),
            new Listenable('error')
              .listen(
                () => {
                  this.transacterrored()
                  this.computedError = transaction.error
                  stopListenables()
                },
                { target: transaction }
              ),
            new Listenable('abort')
              .listen(
                () => {
                  this.transactaborted()
                  stopListenables()
                },
                { target: transaction }
              ),
          ],
          stopListenables = () => this.stopListenables(listenables)

    this.listenables.push(...listenables)

    this.transacting()
    effect(transaction)

    return this
  }
  private transacted () {
    this.computedStatus = 'transacted'
  }
  private transacterrored () {
    this.computedStatus = 'transacterrored'
  }
  private transactaborted () {
    this.computedStatus = 'transactaborted'
  }
  private transacting () {
    this.computedStatus = 'transacting'
  }

  readonly (effect: TransactEffect, options: Omit<TransactOptions, 'mode'> = {}) {
    return this.transact(effect, { ...options, mode: 'readonly' })
  }

  readwrite (effect: TransactEffect, options: Omit<TransactOptions, 'mode'> = {}) {
    return this.transact(effect, { ...options, mode: 'readwrite' })
  }

  versionchange (effect: TransactEffect, options: Omit<TransactOptions, 'mode'> = {}) {
    return this.transact(effect, { ...options, mode: 'versionchange' })
  }

  close () {
    const status = this.status
    this.closing()

    switch (status) {
      // IDB is not closed, IDB is not expected to close
      case 'opened':
      case 'transacting':
      case 'transacted':
      case 'transacterrored':
      case 'transactaborted':
        this.db.close()
        this.closed()
        return this
      // IDB is not closed, IDB is expected to close & update status
      case 'opening':
      case 'openblocked':
      case 'upgradeneeded':
      case 'closing':
        return this
      // IDB is expected to close & delete
      case 'deleting':
        this.deleting()
        return this
      // IDB is closed
      case 'constructing':
      case 'ready':
      case 'openerrored':
      case 'closed':
      case 'deleted':
      case 'deleteerrored':
        this.closed()
        return this
    }
  }
  private closing () {
    this.computedStatus = 'closing'
  }
  private closed () {
    this.computedStatus = 'closed'
  }

  delete () {
    const status = this.status
    this.deleting()

    switch (status) {
      // IDB is neither closed nor deleted, IDB is not expected to close nor delete
      case 'opened':
      case 'transacting':
      case 'transacted':
      case 'transacterrored':
      case 'transactaborted':
        this.db.close()
        this.closed()
        this.requestDelete()
        return this
      // IDB is neither closed nor deleted, IDB is expected to close & delete & update status
      case 'opening':
      case 'openblocked':
      case 'upgradeneeded':
      case 'deleting':
        return this
      // IDB is closed, not deleted, IDB is not expected to delete
      case 'constructing':
      case 'ready':
      case 'openerrored':
      case 'closed':
      case 'deleteerrored':
        this.requestDelete()
        return this
      // IDB is closed & deleted
      case 'deleted':
        this.deleted()
        return this
      // Precluded
      case 'closing':
        return this
    }
  }
  private requestDelete () {
    const request = indexedDB.deleteDatabase(this.computedName),
          listenables = [
            new Listenable('success')
              .listen(
                () => {
                  this.deleted()
                  stopListenables()
                },
                { target: request }
              ),
            new Listenable('error')
              .listen(
                () => {
                  this.computedError = request.error
                  this.deleteerrored()
                  stopListenables()
                },
                { target: request }
              ),
          ],
          stopListenables = () => this.stopListenables(listenables)

    this.listenables.push(...listenables)
  }
  private deleting () {
    this.computedStatus = 'deleting'
  }
  private deleteerrored () {
    this.computedStatus = 'deleteerrored'
  }
  private deleted () {
    this.computedStatus = 'deleted'
  }

  stop () {
    switch (this.status) {

    }

    this.stopListenables(this.listenables)

    return this
  }

  private stopListenables (listenables: typeof this.listenables) {
    for (const listenable of listenables) listenable.stop()
    this.listenables = createFilter<typeof this.listenables[number]>(
      l => !includes(l)(listenables)
    )(this.listenables)
  }
}
