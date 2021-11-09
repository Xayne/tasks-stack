import { tap } from "rxjs/operators"
import { AppAlg_Dem } from "../exec"
import { ExecMiddleWare } from "../exec-middleware"

export const logValuesFinish: ExecMiddleWare
    = e => core => h => {
        return e(core)(h).pipe(
            tap(v => console.log(
                `[Executed] ${AppAlg_Dem(h)._tag}`,
                v,
                core.currentState,
                core
            ))
        )
    }

