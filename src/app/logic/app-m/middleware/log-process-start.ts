import { of } from "rxjs"
import { concatMap, tap } from "rxjs/operators"
import { AppAlg_Dem } from "../exec"
import { ExecMiddleWare } from "../exec-middleware"

export const logProcessStart: ExecMiddleWare
    = e => core => h =>
        of({})
            .pipe(
                tap(_ => {
                    console.log(
                        `[Started] ${AppAlg_Dem(h)._tag}`,
                        core.currentState,
                        core
                    )
                })
                , concatMap(_ => e(core)(h))
            )
