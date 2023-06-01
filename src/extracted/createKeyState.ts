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
  createPredicateKeycomboDown,
  createPredicateKeycomboMatch,
  createKeyStatuses,
  fromComboToAliases,
} from '../extracted'
import { createFilter } from '../pipes/array'

export function createKeyState (
  {
    keycomboOrKeycombos,
    unsupportedAliases,
    toKey,
    toAliases,
    getRequest,
  }: {
    keycomboOrKeycombos: string | string[],
    unsupportedAliases: string[],
    toKey: Parameters<typeof createPredicateKeycomboDown>[1]['toKey'],
    toAliases: Parameters<typeof createPredicateKeycomboMatch>[1]['toAliases'],
    getRequest: () => number,
  }
) {
  const narrowedKeycombos = createFilter<string>(
          keycombo => !some<string>(
            alias => includes(alias)(unsupportedAliases) as boolean
          )(fromComboToAliases(keycombo))
        )(Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos]),
        createPredicateKeycomboDownOptions = { toKey },
        downPredicatesByKeycombo = (() => {
          const predicates: [string, ReturnType<typeof createPredicateKeycomboDown>][] = []

          for (const keycombo of narrowedKeycombos) {
            predicates.push([
              keycombo,
              createPredicateKeycomboDown(
                keycombo,
                createPredicateKeycomboDownOptions
              ),
            ])
          }

          return predicates
        })(),
        createPredicateKeycomboMatchOptions = { ...createPredicateKeycomboDownOptions, toAliases },
        matchPredicatesByKeycombo = (() => {
          const predicates: { [keycombo: string]: ReturnType<typeof createPredicateKeycomboMatch> } = {}

          for (const keycombo of narrowedKeycombos) {
            predicates[keycombo] = createPredicateKeycomboMatch(
                keycombo,
                createPredicateKeycomboMatchOptions
            )
          }

          return predicates
        })(),
        validAliases = pipe<typeof narrowedKeycombos>(
          flatMap<typeof narrowedKeycombos[0], string[]>(fromComboToAliases),
          unique(),
          toArray(),
        )(narrowedKeycombos) as string[],
        getDownCombos = () => pipe(
          filter<typeof downPredicatesByKeycombo[0]>(([, predicate]) => predicate(statuses)),
          map<typeof downPredicatesByKeycombo[0], [string, string[]]>(([keycombo]) => [keycombo, fromComboToAliases(keycombo)]),
          sort<string>(([,aliasesA], [,aliasesB]) => aliasesB.length - aliasesA.length),
          map<string[], string>(([keycombo]) => keycombo),
          toArray()
        )(downPredicatesByKeycombo) as typeof narrowedKeycombos,
        predicateValid = (event: KeyboardEvent) => {
          const aliases = toAliases(event)

          return some<typeof validAliases[0]>(
            validAlias => includes<string>(validAlias)(aliases) as boolean
          )(validAliases) as boolean
        },
        cleanup = () => {
          window.cancelAnimationFrame(getRequest())
        },
        statuses = createKeyStatuses()

  return {
    narrowedKeycombos,
    createPredicateKeycomboDownOptions,
    downPredicatesByKeycombo,
    createPredicateKeycomboMatchOptions,
    matchPredicatesByKeycombo,
    validAliases,
    getDownCombos,
    predicateValid,
    cleanup,
    statuses,
  }
}
