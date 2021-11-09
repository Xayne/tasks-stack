export type CatListLw<v> = {
    v: v[]
}

export const empty: <v>() => CatListLw<v>
    = () => ({ v: [] })

export const snoc: <v>(l: CatListLw<v>) => (v: v) => CatListLw<v>
    = ({ v }) => a => ({ v: v.concat([a]) })

export const uncons: <v>(l: CatListLw<v>) => undefined | [v, CatListLw<v>]
    = l => {
        if (l.v.length === 0) {
            return undefined
        }
        const ml = l.v.slice()
        return [ml.shift() as any, { v: ml }]
    }

export const link: <v>(l: CatListLw<v>) => (l: CatListLw<v>) => CatListLw<v>
    = ({ v: a }) => ({ v: b }) => ({
        v: a.concat(b)
    })

