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
import { createFilter } from '../pipes'

export function createKeyState (
  {
    keycomboOrKeycombos,
    unsupportedAliases,
    toDownKeys,
    toAliases,
    getRequest,
  }: {
    keycomboOrKeycombos: string | string[],
    unsupportedAliases: string[],
    toDownKeys: Parameters<typeof createPredicateKeycomboDown>[1]['toDownKeys'],
    toAliases: Parameters<typeof createPredicateKeycomboMatch>[1]['toAliases'],
    getRequest: () => number,
  }
) {
  const narrowedKeycombos = createFilter<string>(
          keycombo => !some<string>(
            alias => includes(alias)(unsupportedAliases) as boolean
          )(fromComboToAliases(keycombo))
        )(Array.isArray(keycomboOrKeycombos) ? keycomboOrKeycombos : [keycomboOrKeycombos]),
        createPredicateKeycomboDownOptions = { toDownKeys },
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
          const aliases = toAliases(event)

          return some<typeof validAliases[number]>(
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
