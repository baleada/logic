import {
  pipe,
  slice, find,
  reduce
} from 'lazy-collections';
import { createMap } from './createMap'

import type { NumberFunction } from './types'
export type Potentiality<Outcome> = { outcome: Outcome, probability: number }

export function createDetermine<Outcome>(potentialities: Potentiality<Outcome>[]): NumberFunction<Outcome> {
  type Predicate = { outcome: Outcome; predicate: (determinant: number) => boolean; };

  const predicates = createMap<Potentiality<Outcome>, Predicate>(({ outcome, probability }, index) => {
    const lowerBound: number = index === 0
      ? 0
      : pipe(
        slice<Potentiality<Outcome>>(0, index - 1),
        reduce<number, Potentiality<Outcome>>((lowerBound, { probability }) => lowerBound + probability, 0)
      )(potentialities), upperBound = lowerBound + probability;

    return {
      outcome,
      predicate: determinant => (determinant >= lowerBound && determinant < upperBound)
        || determinant < 0 && index === 0
        || index === predicates.length - 1
    };
  })(potentialities);

  return determinant => (find<Predicate>(({ predicate }) => predicate(determinant))(predicates) as Predicate).outcome;
}
