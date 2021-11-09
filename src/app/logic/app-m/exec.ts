import { defer, Observable, of, throwError } from "rxjs";
import { hot } from "src/lib/ts-free/hot";
import { AppCore } from "../app-core";
import { AppM } from "./monad";
import { concatMap } from 'rxjs/internal/operators/concatMap'
import { map } from 'rxjs/internal/operators/map'
import { GoogleAuthProvider } from "@firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { getCurrentUser } from "../firebase-abstract/get-current-user";
import { exists } from "src/lib/fp-essentials/data/maybe";
import { ExecMiddleWare } from "./exec-middleware";
import { id } from "src/lib/fp-essentials/utils/id";
import { Lazy } from "src/lib/fp-essentials/data/lazy";
import { AppAlg } from "./algebra";
import { catchError } from "rxjs/operators";

export const exec: (cfg: {
    core: AppCore,
    middleware?: ExecMiddleWare
}) => <v>(m: AppM<v>) => Observable<v>
    = cfg => {
        console.warn('exec ctor')
        const subExec = Lazy.from(() => exec(cfg))
        const e = (cfg.middleware || id)(_exec(subExec))(cfg.core)
        return m => m.fold(
            e,
            // todo fucking rxjs types
            x => of(x),
            // todo fucking rxjs types
            a => b => concatMap(a)(b)
        )
    }

export const AppAlg_Dem: <v>(h: hot<AppAlg<any>, v>) => AppAlg<v>
    = x => x as any

// todo reduce mess with SubExec
// todo remove hot<AppAlg<any>, v> from implementation of exec and from MiddleWare
const _exec
    : (subExec: Lazy<<v>(m: AppM<v>) => Observable<v>>) => (core: AppCore) => <v>(a: hot<AppAlg<any>, v>) => Observable<v>
    = se => core => h => {
        const a = AppAlg_Dem(h)
        switch (a._tag) {
            case 'AppAlg.LiftObs': return a.o
            case 'AppAlg.Throw': return throwError(a.e)
            case 'AppAlg.TryCatch': {
                return se.v(a.try).pipe(catchError(e => se.v(a.catch(e))))
            }
            case 'AppAlg.Read': return of(a.f(core.currentState))
            case 'AppAlg.Set': {
                return defer(() => {
                    core.setNewState(a.st)
                    return of(a.v)
                })
            }
            case 'AppAlg.GetFirebaseUser': {
                return getCurrentUser(core.firebase.auth).pipe(
                    map(x => a.f(exists(x)))
                )
            }
            case 'AppAlg.WithDb': {
                return a.f(core.firebase.dbHandler)
            }
            case 'AppAlg.SignInWithGoogle': {
                return defer(() => {
                    const auth = core.firebase.auth
                    auth.useDeviceLanguage()
                    const provider = new GoogleAuthProvider();
                    return signInWithPopup(auth, provider)
                        .then(x => {
                            return a.f({ _tag: 'SignedIn' })
                        }, e => {
                            return a.f({ _tag: 'SignInError', e })
                        })
                })
            }
        }
    }
