import { Observable } from "rxjs"
import { hot } from "src/lib/ts-free/hot"
import { Endo } from "src/lib/utils"
import { AppCore } from "../app-core"
import { AppAlg } from "./algebra"
import { AppAlg_Dem } from "./exec"

export type ExecMiddleWare = Endo<(core: AppCore) => <v>(a: hot<AppAlg<any>, v>) => Observable<v>>

export const middlewarePipe: (...p: ExecMiddleWare[]) => ExecMiddleWare
    = (...p) => exec => p.reduce(
        (a, f) => f(a)
        , exec
    )

export const middlewareConditional: (p: (a: AppAlg<any>) => boolean, m: ExecMiddleWare) => ExecMiddleWare
    = (p, m) => exec => core => a =>
        (p(AppAlg_Dem(a)) ? m(exec) : exec)(core)(a)
