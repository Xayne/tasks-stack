import { Just, mbFilter, mbBind, None, mbMap, Maybe } from "../fp-essentials/data/maybe"
import { p } from "../fp-essentials/utils/apply-fn-pipe"
import { recTryGet } from "../fp-essentials/utils/record"
import { Matcher } from "./matcher"


export const pmNumber: Matcher<unknown, number>
    = v => p(Just(Number(v)), mbFilter(x => !isNaN(x)))

export const pmString: Matcher<unknown, string>
    = v => typeof v === 'string' ? Just(v) : None

export const pmAnd: <a, b>(m1: Matcher<unknown, a>, m2: Matcher<a, b>) => Matcher<unknown, b>
    = (m1, m2) => v => p(v, m1, mbBind(m2))

export const pmGuard: <a>(predicate: (a: a) => boolean) => Matcher<a, a>
    = predicate => v => predicate(v) ? Just(v) : None

export const pmConst: <v>(val: v) => Matcher<unknown, v>
    = val => v => v === val ? Just(val) : None

export const pmArray: <v>(m: Matcher<unknown, v>) => Matcher<unknown, v[]>
    = m => v => {
        if (!(v instanceof Array)) {
            return None
        }
        var result: any[] = []
        for (var i = 0; i < v.length; i++) {
            var r = m(v[i])
            if (r.hasVal) {
                result.push(r.val)
            } else {
                return None
            }
        }
        return Just(result)
    }

//---------------------------------------------------
//--------- Record Matcher

type PMRec = Record<string | number, Matcher<unknown, any>>
type UnboxedPMRec<MR extends PMRec> = { [k in keyof MR]: MR[k] extends Matcher<any, infer V> ? V : never }

/** only matched fields will be in result, given record might contain more fields than matched */
export const pmRec: <rec extends PMRec>(rec: rec) => Matcher<any, UnboxedPMRec<rec>>
    = rec => obj => {
        if (typeof obj !== 'object' || obj === null) {
            return None
        }
        let matchers = Object.entries(rec)
        return matchers.reduce((acc, [key, valuePMatcher]) =>
            p(acc, mbBind(
                valsRec => p(
                    obj, recTryGet(key),
                    mbBind(valuePMatcher),
                    // MUTATION WARNING
                    mbMap(val => Object.assign(valsRec, { [key]: val }))
                )
            ))
            , Just({} as UnboxedPMRec<typeof rec>))
    }
