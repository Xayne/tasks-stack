import { where } from "@firebase/firestore";
import { pmRec, pmString } from "src/lib/generalized-pattern-matching/base-matchers";
import { createFsHandler, collectionTypes } from "../firebase-abstract/firestore-handler";
import { initFirebase } from "./app";

export const testDb
    = createFsHandler({
        test: {
            nameInDb: 'test',
            types: collectionTypes<{ value1: string }, { value: string }>({
                readAs: pmRec({
                    value: pmString
                }),
                writeAs: v => v
            })
            // sub: {
            //     subtest: {
            //         collectionName: 'test',
            //         scheme: pmRec({
            //             value: pmString
            //         }),
            //     }
            // }
        },
        test_s: {
            nameInDb: 'test',
            types: collectionTypes<{ value1: string }, { value: string }>({
                readAs: pmRec({
                    value: pmString
                }),
                writeAs: v => v
            }),
            sub: {
                subtest: {
                    nameInDb: 'test',
                    types: collectionTypes<{ v41: string }, { v42: string }>({
                        readAs: pmRec({
                            v42: pmString
                        }),
                        writeAs: v => v
                    }),
                }
            }
        }
    })

export const doTesting = () => {
    const [_, fs] = initFirebase()

    const ctr = testDb(fs)

    ctr.test.get('EksWtYRbTWDQbOvzk0UX????')
        .subscribe(x => {
            console.log('get:', x.hasVal ? x.val.value : 0)
        })

    ctr.test_s.sub('MARYgUuuo4QMIqRxVxsu').subtest.query(where('abs', '==', 11))
        .subscribe(x => {
            console.log('sub getAll:', x)

        })

    // ctr.test.getAll()
    //     .subscribe(x => {
    //         console.log('getAll:', x)
    //     })

    // ctr.test.set(undefined, { value: 'lol' })
    //     .subscribe(x => {
    //         console.log('set:', x.uid)
    //     })

    // ctr.test.set('XWKv7HiQPvqgx31T24g4', { value: 'jobbbo' })
    //     .subscribe(x => {
    //         console.log('update:', x.uid)
    //     })
}
