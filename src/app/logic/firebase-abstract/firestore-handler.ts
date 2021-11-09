import { addDoc, collection, doc, DocumentData, Firestore, getDoc, getDocs, query, QueryConstraint, QueryDocumentSnapshot, setDoc } from "firebase/firestore"
import { defer, Observable, of, throwError } from "rxjs"
import { map } from "rxjs/internal/operators/map"
import { catchError, concatMap } from "rxjs/operators"
import { Just, Maybe, None } from "src/lib/fp-essentials/data/maybe"
import { p } from "src/lib/fp-essentials/utils/apply-fn-pipe"
import { recMap } from "src/lib/fp-essentials/utils/record"
import { Matcher } from "src/lib/generalized-pattern-matching/matcher"
import { FirestoreDoc } from "./firestore-doc"
import { FromProxy, Proxy } from './proxy'

export type FirestoreHandler<D extends Descriptors> = {
    [k in keyof D]: CollectionHandler<D[k]>
}

export type CollectionHandler<D extends CollectionDescriptor> = {
    getAll: () => Observable<FirestoreDoc<GetO<D>>[]>
    set: (uid: string | undefined, data: GetI<D>) =>
        Observable<FirestoreDoc<{}>>
    get: (uid: string) => Observable<Maybe<GetO<D>>>
    query: (...constrains: QueryConstraint[]) => Observable<FirestoreDoc<GetO<D>>[]>

    sub: D['sub'] extends Descriptors
    ? (uid: string) => FirestoreHandler<D['sub']>
    : never
}

export type CollectionTypes<I, O> = {
    i: Proxy<I>,
    o: Proxy<O>,
    writeAs: ((v: I) => unknown)
    readAs: DocSchemeDescriptor<O>
}

export type CollectionDescriptor = {
    nameInDb: string
    types: CollectionTypes<any, any>
    sub?: Descriptors
}

// -----------------------------------------

type DocSchemeDescriptor<V> = Matcher<Record<string, unknown>, V>

type Descriptors = Record<string, CollectionDescriptor>

type GetI<D extends CollectionDescriptor> = FromProxy<D['types']['i']>
type GetO<D extends CollectionDescriptor> = FromProxy<D['types']['o']>

// -----------------------------------------

export const collectionTypes: <I, O>(cfg: {
    writeAs: ((v: I) => unknown)
    readAs: DocSchemeDescriptor<O>
}) => CollectionTypes<I, O>
    = cfg => cfg as any

// -----------------------------------------


export const createFsHandler =
    <D extends Descriptors>
        (descr: D) =>
        (store: Firestore): FirestoreHandler<D> =>
            _createFsHandler(descr, undefined)(store)

const _createFsHandler =

    <D extends Descriptors>
        (descr: D, prevPath: string | undefined) =>
        (store: Firestore): FirestoreHandler<D> => {

            // todo
            // const settings = { /* ... */ timestampsInSnapshots: true };
            // store.settings(settings)

            const addToPath = prevPath ? `${prevPath}/` : ''


            let handler = p(descr as Descriptors,
                recMap(d => {

                    const fullPath = addToPath + d.nameInDb
                    const readDocData = applyMatcher(d.types.readAs)
                    const readDocsData = applyMatchersToMany(d.types.readAs)(fullPath)

                    const coll = collection(store, fullPath)
                    const ch: CollectionHandler<any> = {
                        sub: d.sub === undefined
                            ? undefined as never
                            : uid => _createFsHandler(d.sub!, addToPath + d.nameInDb + `/${uid}`)(store)
                        ,
                        getAll: () => defer(() =>
                            getDocs(coll).then(x => x.docs)
                        )
                            .pipe(
                                wrapErrorToFirestoreErr,
                                concatMap(readDocsData)
                            ),
                        query: (...cns) => defer(() =>
                            getDocs(query(coll, ...cns)).then(x => x.docs)
                        )
                            .pipe(
                                wrapErrorToFirestoreErr,
                                concatMap(readDocsData)
                            ),
                        get: uid => p(
                            defer(() =>
                                getDoc(
                                    doc(coll, uid)
                                )
                            ),
                            wrapErrorToFirestoreErr,
                            concatMap(x =>
                                x.exists()
                                    ? readDocData(`${fullPath}/${uid}`)(x.data()).pipe(map(Just))
                                    : of(None)
                            )
                        ),
                        set: (uid, data) => defer(
                            () => {
                                const _data = d.types.writeAs(data as any) as any // todo who's fucked up?
                                return (uid === undefined
                                    ? addDoc(coll, _data)
                                    : setDoc(doc(coll, uid), _data)
                                )
                                    .then(x => ({
                                        uid: x ? x.id : uid!,
                                        doc: {}
                                    }))
                            }
                        ).pipe(wrapErrorToFirestoreErr),
                    }
                    return ch
                })
            )

            return handler as FirestoreHandler<D> // type warning
        }

const wrapErrorToFirestoreErr: <v>(o: Observable<v>) => Observable<v>
    = catchError(err => throwError({
        _tag: 'FHE.FirestoreErr',
        err
    }))

const applyMatcher: <v>(m: Matcher<any, v>) => (path: string) => (v: DocumentData) => Observable<v>
    = m => p => v => {
        const r = m(v)
        return r.hasVal ? of(r.val) : throwError({
            _tag: 'FHE.PatternMatchingFail',
            docPath: p,
            gotInstead: v
        })
    }

const applyMatchersToMany
    : <v>(m: Matcher<any, v>) => (path: string) => (s: QueryDocumentSnapshot<DocumentData>[]) => Observable<FirestoreDoc<v>[]>
    = m => p => snapshots => {
        const results = [] as FirestoreDoc<any>[]
        for (var s of snapshots) {
            const r = m(s.data())
            if (r.hasVal) {
                results.push({
                    uid: s.id,
                    doc: r.val
                })
            } else {
                return throwError({
                    _tag: 'FHE.PatternMatchingFail',
                    docPath: `${p}/${s.id}`,
                    gotInstead: s.data()
                })
            }
        }
        return of(results)
    }
