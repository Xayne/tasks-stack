import { CatList, CatNil, snoc as csnoc, uncons as cuncons, link as clink } from "./collections/cat-list"

export type CatListLw<v> = CatList<v>

export const empty: <v>() => CatListLw<v>
    = () => CatNil

export const snoc: <v>(l: CatListLw<v>) => (v: v) => CatListLw<v>
    = csnoc

export const uncons: <v>(l: CatListLw<v>) => undefined | [v, CatListLw<v>]
    = cuncons

export const link: <v>(l: CatListLw<v>) => (l: CatListLw<v>) => CatListLw<v>
    = clink
