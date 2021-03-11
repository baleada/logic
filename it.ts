import { Pipeable } from './src/pipes.ts'

console.log(new Pipeable(0).pipe(x => x + 1))
