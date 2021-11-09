import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { Maybe, mbMap } from "src/lib/fp-essentials/data/maybe";
import { id } from "src/lib/fp-essentials/utils/id";
import { morph } from "src/lib/fp-essentials/utils/record";
import { AppState } from "../app-state";
import { Uid } from "../firebase/data/uid";
import { DbHandler } from "../firebase/db";
import { SignInResult } from "./algebra";
import { AppErr, wrapToAppErr } from "./app-err";
import { AppM, asMonad } from "./monad";

//--------------------------------------------------------------
// State

export const readState: AppM<AppState>
    = asMonad({ _tag: 'AppAlg.Read', f: id })

export const setState: (s: AppState) => AppM<{}>
    = st => asMonad({ _tag: 'AppAlg.Set', st, v: {} })

export const updateState: (s: Partial<AppState>) => AppM<{}>
    = pst => readState.map(morph(pst)).flatMap(setState)

export const modifyState: (f: (s: AppState) => AppState) => AppM<{}>
    = f => readState.flatMap(s => setState(f(s)))


//--------------------------------------------------------------
// Auth

export const getUserUid: AppM<Maybe<Uid>>
    = asMonad({ _tag: 'AppAlg.GetFirebaseUser', f: mbMap(x => ({ uid: x.uid })) })

export const signInWithGoogle: AppM<SignInResult>
    = asMonad({ _tag: 'AppAlg.SignInWithGoogle', f: id })

//--------------------------------------------------------------

export const liftObs: <a>(o: Observable<a>) => AppM<a>
    = o => asMonad({ _tag: 'AppAlg.LiftObs', o })

export const sleep: (ms: number) => AppM<{}>
    = ms => liftObs(of({}).pipe(delay(ms)))

export const throwErr: <a>(e: AppErr) => AppM<a>
    = e => asMonad({ _tag: 'AppAlg.Throw', e })

export const tryCatch: <a>(m: AppM<a>, _catch: (e: AppErr) => AppM<a>) => AppM<a>
    = (m, c) => asMonad({ _tag: 'AppAlg.TryCatch', try: m, catch: e => c(wrapToAppErr(e)) })

export const withDb: <a>(f: (h: DbHandler) => Observable<a>) => AppM<a>
    = <a>(f: (h: DbHandler) => Observable<a>) => asMonad<a>({ _tag: 'AppAlg.WithDb', f })
