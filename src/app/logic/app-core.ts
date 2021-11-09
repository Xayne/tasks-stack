import { Auth } from "@firebase/auth";
import { Firestore } from "@firebase/firestore";
import { Observable, Subject } from "rxjs";
import { shareReplay } from "rxjs/internal/operators/shareReplay";
import { appCoreExecMiddleWare } from "./app-core.exec-middleware";
import { exec } from "./app-m/exec";
import { middlewareConditional, middlewarePipe } from "./app-m/exec-middleware";
import { logProcessStart } from "./app-m/middleware/log-process-start";
import { logValuesFinish } from "./app-m/middleware/log-values-finish";
import { AppM } from "./app-m/monad";
import { AppState, initialAppState } from "./app-state";
import { initFirebase } from "./firebase/app";
import { DbHandler, mkDbHandler } from "./firebase/db";


export type AppCore = {
    currentState: AppState
    stateStream: Observable<AppState>
    setNewState: (s: AppState) => void
    runAction: <a>(m: AppM<a>) => Observable<a>

    firebase: {
        auth: Auth
        firestore: Firestore,
        dbHandler: DbHandler
    }
}

export const mkAppCore: () => AppCore
    = () => {
        const [auth, firestore] = initFirebase()
        // signOut(auth)
        const c = class {
            exec = exec({
                core: this,
                middleware: appCoreExecMiddleWare
            })

            firebase = { auth, firestore, dbHandler: mkDbHandler(firestore) }

            currentState = initialAppState
            stateStream = new Subject<AppState>()
            setNewState
                = (s: AppState) => {
                    this.currentState = s
                    this.stateStream.next(s)
                }
            runAction: <a>(m: AppM<a>) => Observable<a>
                = m => {
                    const r = this.exec(m).pipe(shareReplay(1))
                    r.subscribe()
                    return r
                }
        }
        return new c()
    }
