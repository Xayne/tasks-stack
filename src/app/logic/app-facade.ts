import { Observable, ReplaySubject } from "rxjs"
import { AppCore } from "./app-core"
import { AppM } from "./app-m/monad"
import { AppState } from "./app-state"

export type AppFacade = {
    state: Observable<AppState>
    run: <a>(m: AppM<a>) => Observable<a>
}

export const mkAppFacade: (core: AppCore) => AppFacade
    = core => {
        const state = new ReplaySubject<AppState>(1)
        state.next(core.currentState)
        // todo: sub is lost, since for now app facade and core is undisposable
        core.stateStream.subscribe(s => state.next(s))
        return { state, run: core.runAction }
    }

