import { User } from "firebase/auth"
import { Observable } from "rxjs"
import { Maybe } from "src/lib/fp-essentials/data/maybe"
import { Free } from "src/lib/ts-free"
import { AppState } from "../app-state"
import { DbHandler } from "../firebase/db"
import { AppErr } from "./app-err"

export type AppAlg<a>
    = { _tag: 'AppAlg.Read', f: (st: AppState) => a }
    | { _tag: 'AppAlg.Set', st: AppState, v: a }
    | { _tag: 'AppAlg.LiftObs', o: Observable<a> }
    | { _tag: 'AppAlg.Throw', e: AppErr }
    | { _tag: 'AppAlg.TryCatch', try: Free<AppAlg<any>, a>, catch: (err: any) => Free<AppAlg<any>, a> }

    | { _tag: 'AppAlg.GetFirebaseUser', f: (u: Maybe<User>) => a }
    | { _tag: 'AppAlg.SignInWithGoogle', f: (r: SignInResult) => a }
    | { _tag: 'AppAlg.WithDb', f: (h: DbHandler) => Observable<a> }

export type SignInResult
    = { _tag: 'SignedIn' }
    | { _tag: 'SignInError', e: any /** todo */ }

