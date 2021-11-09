import { combineLatest, of } from "rxjs"
import { delay } from "rxjs/operators"
import { p } from "../fp-essentials/utils/apply-fn-pipe"
import { doObs } from "./do.rxjs"


export const runTest = () => {
    const t1 = doObs
        .$('a', _ => of('a'))
        .$('line', z => of(z.a.length, 23))
        .$('react', z => p(of(z), delay(500)))
        .$('otvet', z => of(z.line + 1, z.line + 2, z.line + 3))
        .pure(z => z)

    t1.subscribe(z => console.log('got:', z))
    combineLatest([]).subscribe(z => console.log('CL', z))
}