import { p } from "../fp-essentials/utils/apply-fn-pipe"

export type AddKvToRecord<r, k extends string, v> = H<r & { [kk in k]: v }>
type H<v> = (() => { [k in keyof v]: v[k] }) extends () => infer r ? r : never

type Monad<a> = any

type DoNota<r> = {
    $: <k extends string, v>(k: k, next: (r: r) => Monad<v>) => DoNota<AddKvToRecord<r, k, v>>
    _: <v>(next: (r: r) => Monad<v>) => DoNota<r>
    e: <v>(exit: (r: r) => Monad<v>) => Monad<v>
    pure: <v>(exit: (r: r) => v) => Monad<v>
}

export const mkDoNotationFor: (cfg: {
    pure: <v>(v: v) => Monad<v>
    bind: <a, b>(f: (a: a) => Monad<b>) => (m: Monad<a>) => Monad<b>
    map: <a, b>(f: (a: a) => b) => (m: Monad<a>) => Monad<b>
}) => DoNota<{}>
    = ({ pure, bind, map }) => {

        const mkNext: <r>(r: Monad<r>) => DoNota<r>
            = mr => ({
                $: (k, n) => mkNext(p(
                    mr,
                    bind(r => p(n(r as any),
                        map(v => Object.assign({}, r, { [k]: v } as { [kk in typeof k]: typeof v }))
                    ))
                )),
                _: n => mkNext(p(
                    mr, bind(r => p(n(r as any), map(_ => r)))
                )),
                e: e => p(mr, bind(r => e(r as any))),
                pure: e => p(mr, map(r => e(r as any)))
            })

        return {
            $: (k, n) => mkNext(
                p(n({}), map(v => ({ [k]: v }) as { [kk in typeof k]: typeof v }))
            ),
            _: n => mkNext(p(n({}), map(_ => ({})))),
            e: e => e({}),
            pure: e => pure(e({}))
        }
    }