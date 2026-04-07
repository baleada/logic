import { includes } from 'lazy-collections'
import { createFilter } from '../pipes'
import type { IDBEventMap } from './Listenable'
import { Listenable } from './Listenable'

export type OperateableOptions = Record<never, never>

export type OperateableStatus = (
  | 'ready'
  | 'operating'
  | 'operated'
  | 'errored'
)

type OperationAdd<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'add'
  value: StoredObject
  key?: IDBValidKey,
}

type OperationPut<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'put'
  value: StoredObject
  key?: IDBValidKey,
}

type OperationGet<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'get'
  query: IDBValidKey | IDBKeyRange
  effect?: (result: StoredObject) => void,
}

type OperationGetKey = {
  operation: 'getKey'
  query: IDBValidKey | IDBKeyRange
  effect?: (result: IDBValidKey | undefined) => void,
}

type OperationGetAll<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'getAll'
  query?: IDBValidKey | IDBKeyRange | null
  count?: number
  effect?: (result: StoredObject) => void,
}

type OperationGetAllKeys = {
  operation: 'getAllKeys'
  query?: IDBValidKey | IDBKeyRange | null
  count?: number
  effect?: (result: IDBValidKey[]) => void,
}

type OperationGetAllRecords<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'getAllRecords'
  query?: IDBValidKey | IDBKeyRange | null
  count?: number
  effect?: (result: StoredObject) => void,
}

type OperationDelete = {
  operation: 'delete'
  query: IDBValidKey | IDBKeyRange,
}

type OperationClear = {
  operation: 'clear',
}

type OperationCount = {
  operation: 'count'
  query?: IDBValidKey | IDBKeyRange
  effect?: (result: number) => void,
}

type OperationOpenCursor<StoredObject extends Record<any, any> = Record<any, any>> = {
  operation: 'openCursor'
  query?: IDBValidKey | IDBKeyRange | null
  direction?: IDBCursorDirection
  effect?: (cursor: DefinedIDBCursorWithValue<StoredObject> | null) => void,
}

type DefinedIDBCursorWithValue<StoredObject extends Record<any, any> = Record<any, any>> = (
    & Omit<IDBCursorWithValue, 'value'>
    & { value: StoredObject }
)

type OperationOpenKeyCursor = {
  operation: 'openKeyCursor'
  query?: IDBValidKey | IDBKeyRange | null
  direction?: IDBCursorDirection
  effect?: (cursor: IDBCursor | null) => void,
}

export type OperationDescriptor<
  StoredObject extends Record<any, any> = Record<any, any>,
  O extends Operation = Operation
> = O extends 'add'
  ? OperationAdd<StoredObject>
  : O extends 'put'
    ? OperationPut<StoredObject>
    : O extends 'get'
      ? OperationGet<StoredObject>
      : O extends 'getKey'
        ? OperationGetKey
        : O extends 'getAll'
          ? OperationGetAll<StoredObject>
          : O extends 'getAllKeys'
            ? OperationGetAllKeys
            : O extends 'getAllRecords'
              ? OperationGetAllRecords<StoredObject>
              : O extends 'delete'
                ? OperationDelete
                : O extends 'clear'
                  ? OperationClear
                  : O extends 'count'
                    ? OperationCount
                    : O extends 'openCursor'
                      ? OperationOpenCursor<StoredObject>
                      : O extends 'openKeyCursor'
                        ? OperationOpenKeyCursor
                          : never

export type Operation = (
  | 'add'
  | 'put'
  | 'get'
  | 'getKey'
  | 'getAll'
  | 'getAllKeys'
  | 'getAllRecords'
  | 'delete'
  | 'clear'
  | 'count'
  | 'openCursor'
  | 'openKeyCursor'
)

export type DefinedIDBObjectStore<StoredObject extends Record<any, any>> = (
  & Omit<IDBObjectStore, 'get'>
  & {
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<StoredObject>
  }
)

export function createDefineObjectStore<StoredObjectsByStoreName extends Record<string, any>> () {
  return <StoreName extends keyof StoredObjectsByStoreName>(transaction: IDBTransaction, storeName: StoreName) => {
    return transaction.objectStore(storeName as string) as DefinedIDBObjectStore<StoredObjectsByStoreName[StoreName]>
  }
}

export class Operateable<StoredObject extends Record<any, any>> {
  constructor (objectStore: DefinedIDBObjectStore<StoredObject>, options: OperateableOptions = {}) {
    this.computedObjectStore = objectStore
    this.ready()
  }
  private listenables: { [K in keyof IDBEventMap]: Listenable<K> }[keyof IDBEventMap][] = []
  private ready () {
    this.computedStatus = 'ready'
  }

  private computedObjectStore: DefinedIDBObjectStore<StoredObject>
  get objectStore () {
    return this.computedObjectStore
  }
  set objectStore (objectStore) {
    this.setObjectStore(objectStore)
  }
  private computedStatus: OperateableStatus
  get status () {
    return this.computedStatus
  }
  private computedError: Error
  get error () {
    return this.computedError
  }

  setObjectStore (objectStore: DefinedIDBObjectStore<StoredObject>) {
    this.stop()
    this.computedObjectStore = objectStore
    return this
  }

  operate (descriptors: OperationDescriptor<StoredObject, Operation>[]) {
    if (!descriptors.length) {
      this.operated()
      return this
    }

    this.operating()

    const [present, ...future] = descriptors,
          { operation } = present,
          request = (() => {
            switch (operation) {
              case 'add': {
                const { value, key } = present
                return this.objectStore.add(value, key)
              }
              case 'put': {
                const { value, key } = present
                return this.objectStore.put(value, key)
              }
              case 'get': {
                const { query } = present
                return this.objectStore.get(query)
              }
              case 'getKey': {
                const { query } = present
                return this.objectStore.getKey(query)
              }
              case 'getAll': {
                const { query, count } = present
                return this.objectStore.getAll(query, count)
              }
              case 'getAllKeys': {
                const { query, count } = present
                return this.objectStore.getAllKeys(query, count)
              }
              case 'getAllRecords': {
                const { query, count } = present
                return (this.objectStore as any).getAllRecords(query, count)
              }
              case 'delete': {
                const { query } = present
                return this.objectStore.delete(query)
              }
              case 'clear':
                return this.objectStore.clear()
              case 'count': {
                const { query } = present
                return this.objectStore.count(query)
              }
              case 'openCursor': {
                const { query, direction } = present
                return this.objectStore.openCursor(query, direction)
              }
              case 'openKeyCursor': {
                const { query, direction } = present
                return this.objectStore.openKeyCursor(query, direction)
              }
            }
          })(),
          listenables = [
            new Listenable('success')
              .listen(
                () => {
                  if (!operation.includes('Cursor') || !request.result) stopListenables()
                  if ('effect' in present) present.effect?.(request.result)

                  if (!future.length) {
                    this.operated()
                    return
                  }

                  this.operate(future)
                },
                { target: request }
              ),
            new Listenable('error')
              .listen(
                () => {
                  stopListenables()
                  this.computedError = request.error
                  this.errored()
                },
                { target: request }
              ),
          ],
          stopListenables = () => this.stopListenables(listenables)

    this.listenables.push(...listenables)

    return this
  }
  private operating () {
    this.computedStatus = 'operating'
  }
  private operated () {
    this.computedStatus = 'operated'
  }
  private errored () {
    this.computedStatus = 'errored'
  }

  add (descriptor: Omit<OperationDescriptor<StoredObject, 'add'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'add' }])
  }

  put (descriptor: Omit<OperationDescriptor<StoredObject, 'put'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'put' }])
  }

  get (descriptor: Omit<OperationDescriptor<StoredObject, 'get'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'get' }])
  }

  getKey (descriptor: Omit<OperationDescriptor<StoredObject, 'getKey'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'getKey' }])
  }

  getAll (descriptor: Omit<OperationDescriptor<StoredObject, 'getAll'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'getAll' }])
  }

  getAllKeys (descriptor: Omit<OperationDescriptor<StoredObject, 'getAllKeys'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'getAllKeys' }])
  }

  getAllRecords (descriptor: Omit<OperationDescriptor<StoredObject, 'getAllRecords'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'getAllRecords' }])
  }

  delete (descriptor: Omit<OperationDescriptor<StoredObject, 'delete'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'delete' }])
  }

  clear (descriptor: Omit<OperationDescriptor<StoredObject, 'clear'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'clear' }])
  }

  count (descriptor: Omit<OperationDescriptor<StoredObject, 'count'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'count' }])
  }

  openCursor (descriptor: Omit<OperationDescriptor<StoredObject, 'openCursor'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'openCursor' }])
  }

  openKeyCursor(descriptor: Omit<OperationDescriptor<StoredObject, 'openKeyCursor'>, 'operation'>) {
    return this.operate([{ ...descriptor, operation: 'openKeyCursor' }])
  }

  stop () {
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
