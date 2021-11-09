import { ExecMiddleWare, middlewareConditional, middlewarePipe } from "./app-m/exec-middleware"
import { logErrors } from "./app-m/middleware/log-errors"
import { logValuesFinish } from "./app-m/middleware/log-values-finish"

export const appCoreExecMiddleWare: ExecMiddleWare | undefined
    = middlewarePipe(
        middlewareConditional(
            x => x._tag === 'AppAlg.TryCatch',
            middlewarePipe(
                logValuesFinish,
            )
        ),
        logErrors
    )
