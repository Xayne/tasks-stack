import { mbMap } from '../fp-essentials/data/maybe';
import { p } from '../fp-essentials/utils/apply-fn-pipe';
import { Matcher } from './matcher';

type PatternMatching<v> = {
    with: <mbVal, r>(pm: Matcher<v, mbVal>, succes: (v: mbVal) => r) => FixedPatternMatching<v, r>,
    otherwise: <r>(fn: () => r) => r,
}

type FixedPatternMatching<v, r> = {
    with: <mbVal>(pm: Matcher<v, mbVal>, succes: (v: mbVal) => r) => FixedPatternMatching<v, r>,
    otherwise: (fn: () => r) => r,
    /** 
     * defines current matchin cunstruction as exhaustive (i.e. no 'otherWise' case needed) 
     * 
     * may throw in runTime 'not-exhaustive' error. 
     */
    exhaustive: () => r,
}

const resolvedMatching: <v, r>(r: r) => FixedPatternMatching<v, r>
    = r => {
        const result = {
            with: () => result,
            otherwise: () => r,
            exhaustive: () => r
        }
        return result
    }


const unResolvedMatching: <v, r>(v: v) => FixedPatternMatching<v, r>
    = v => ({
        with: (pm, succes) => {
            let r = p(pm(v), mbMap(succes))
            return r.hasVal ? resolvedMatching(r.val) : unResolvedMatching(v)
        },
        otherwise: fn => fn(),
        exhaustive: () => { throw new Error('Not Exhaustive pattern Matching') }
    })

export const match: <v>(v: v) => PatternMatching<v>
    = unResolvedMatching as any // bad type inference


