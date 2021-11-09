import { hot } from "./hot"
import { CatListLw, link, empty, snoc, uncons } from "./internal2"

export class Free<f, v> {

    static Of<f, v>(v: v): Free<f, v> {
        return new Free<f, v>({ type: FreeDataTag.Pure, v }, empty())
    }

    static Lift<f, v>(f: hot<f, v>): Free<f, v> {
        return new Free<f, v>(
            { type: FreeDataTag.Bind, v: f, next: Free.Of },
            empty()
        )
    }

    private constructor(
        private readonly data: FreeData<f, _, _>,
        private readonly expr: CatListLw<(a: _) => Free<f, _>>
        // last is always (a: _) => Free<f, v>, or if list is empty data is FreeData<f, _, v>
    ) { }


    flatMap<o>(f: (v: v) => Free<f, o>): Free<f, o> {
        return new Free(this.data, snoc(this.expr)(f))
    }

    map<o>(f: (v: v) => o): Free<f, o> {
        return this.flatMap(x => Free.Of(f(x)))
    }

    exec(unbx: <a>(f: hot<f, a>) => a): v {
        let d = this.ibx()
        while (true) {
            if (d.type === FreeDataTag.Pure) {
                return d.v
            }
            d = d.next(unbx(d.v)).ibx()
        }
    }

    fold<mv, ma>(
        /** actually: ```<a> f a -> m a``` */ 
        nat: <a>(f: hot<f, a>) => ma,
        /** actually: ```<a> a -> m a``` */
        pure: (v: v) => mv,
        /** actually: ```(a -> m b) -> m a -> m b``` */
        // fmap: <a, ma, mb>(f: (a: a) => mb) => (ma: ma) => mb
        fmap: (f: (a: v) => mv) => (ma: mv) => mv
    ): mv {
        const d = this.ibx()
        if (d.type === FreeDataTag.Pure) {
            return pure(d.v)
        }
        return fmap(v => d.next(v).fold(nat, pure, fmap))(nat(d.v) as any)
    }


    private ibx(): FreeData<f, _, v> {
        const d = this.data
        if (d.type === FreeDataTag.Pure) {
            const nexp = uncons(this.expr)
            if (nexp === undefined) {
                return d
            }
            const [e, list] = nexp
            // todo tramplin instead of addexp
            return e(d.v).addexp(list).ibx()
        }
        return {
            type: FreeDataTag.Bind,
            v: d.v,
            next: a => d.next(a).addexp(this.expr)
        }
    }

    private addexp(exp: CatListLw<(a: _) => Free<f, _>>): Free<f, _> {
        return new Free(this.data, link(this.expr)(exp))
    }

}


type _ = any

type FreeData<f, a, b>
    = Pure<b>
    | Bind<f, a, b>

enum FreeDataTag { Pure, Bind }

type Pure<v> = {
    type: FreeDataTag.Pure
    v: v
}

type Bind<f, a, b> = {
    type: FreeDataTag.Bind
    v: hot<f, a>
    next: (a: a) => Free<f, b>
}
