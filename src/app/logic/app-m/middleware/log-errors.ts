import { throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import { AppAlg_Dem } from "../exec"
import { ExecMiddleWare } from "../exec-middleware"

export const logErrors: ExecMiddleWare
    = e => core => h => {
        return e(core)(h).pipe(
            catchError(e => {
                console.log(
                    `[Executed with Error!] ${AppAlg_Dem(h)._tag}`,
                    e,
                    core.currentState,
                    core
                )
                return throwError(e)
            })
        )
    }
