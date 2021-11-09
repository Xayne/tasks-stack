import { bootstrapAngularApp } from './app/angular/bootstrap-angular'
import { bootstrapApp } from './app/logic/bootstrap'
import { environment } from './environments/environment'



const af = bootstrapApp()

bootstrapAngularApp(af, environment.production)



// import { doTesting } from "./app/logic/firebase/test-db"
// console.log('DOING FB TESTS!')
// doTesting()

// import { runTest } from "./lib/do-notation-generic/do.rxjs.test";
// runTest()
