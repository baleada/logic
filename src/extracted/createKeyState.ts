import {
  filter,
  sort,
  map,
  pipe,
  toArray,
  unique,
  some,
  flatMap,
  includes,
} from 'lazy-collections'
import {
  createKeycomboDown,
  createKeycomboMatch,
  createKeyStatusesValue,
  createKeyStatusesSet,
  createKeyStatusesClear,
  createKeyStatusesDelete,
  fromComboToAliases,
} from '../extracted'
import type { KeyStatuses } from '../extracted'
import { createFilter } from '../pipes/array'

export function createKeyState (
  {
    keycomboOrKeycombos,
    unsupportedAliases,
    toDownCodes,
    toAliases,
    getRequest,
  }: {
    keycomboOrKeycombos: string | string[],
    unsupportedAliases: string[],
    toDownCodes: Parameters<typeof createKeycomboDown>[1]['toDownCodes'],
    toAliases: Parameters<typeof createKeycomboMatch>[1]['toAliases'],
    getRequest: () => number,
  }
) {
  const narrowedKeycombos = createFilter<string>(
          keycombo => !some<string>(
            alias => includes(alias)(unsupportedAliases) as boolean
          )(fromComboToAliases(keycombo))
        )(Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos]),
        createKeycomboDownOptions = { toDownCodes },
        downPredicatesByKeycombo = (() => {
          const predicates: [string, ReturnType<typeof createKeycomboDown>][] = []

          for (const keycombo of narrowedKeycombos) {
            predicates.push([
              keycombo,
              createKeycomboDown(
                keycombo,
                createKeycomboDownOptions
              ),
            ])
          }

          return predicates
        })(),
        createKeycomboMatchOptions = { ...createKeycomboDownOptions, toAliases },
        matchPredicatesByKeycombo = (() => {
          const predicates: { [keycombo: string]: ReturnType<typeof createKeycomboMatch> } = {}

          for (const keycombo of narrowedKeycombos) {
            predicates[keycombo] = createKeycomboMatch(
                keycombo,
                createKeycomboMatchOptions
            )
          }

          return predicates
        })(),
        validAliases = pipe<typeof narrowedKeycombos>(
          flatMap<typeof narrowedKeycombos[number], string[]>(fromComboToAliases),
          unique(),
          toArray(),
        )(narrowedKeycombos) as string[],
        getDownCombos = () => pipe(
          filter<typeof downPredicatesByKeycombo[number]>(([, predicate]) => predicate(statuses)),
          map<typeof downPredicatesByKeycombo[number], [string, string[]]>(([keycombo]) => [keycombo, fromComboToAliases(keycombo)]),
          sort<string>(([,aliasesA], [,aliasesB]) => aliasesB.length - aliasesA.length),
          map<string[], string>(([keycombo]) => keycombo),
          toArray()
        )(downPredicatesByKeycombo) as typeof narrowedKeycombos,
        predicateValid = (event: KeyboardEvent) => {
          const aliases = toAliases(event.code)

          return some<typeof validAliases[number]>(
            validAlias => includes<string>(validAlias)(aliases) as boolean
          )(validAliases) as boolean
        },
        cleanup = () => {
          window.cancelAnimationFrame(getRequest())
        },
        statuses: KeyStatuses = [],
        toStatus = (...params: Parameters<typeof createKeyStatusesValue>) => createKeyStatusesValue(...params)(statuses),
        setStatus = (...params: Parameters<typeof createKeyStatusesSet>) => createKeyStatusesSet(...params)(statuses),
        clearStatuses = (...params: Parameters<typeof createKeyStatusesClear>) => createKeyStatusesClear(...params)(statuses),
        deleteStatus = (...params: Parameters<typeof createKeyStatusesDelete>) => createKeyStatusesDelete(...params)(statuses)

  return {
    narrowedKeycombos,
    createKeycomboDownOptions,
    downPredicatesByKeycombo,
    createKeycomboMatchOptions,
    matchPredicatesByKeycombo,
    validAliases,
    getDownCombos,
    predicateValid,
    cleanup,
    statuses,
    toStatus,
    setStatus,
    clearStatuses,
    deleteStatus,
  }
}
