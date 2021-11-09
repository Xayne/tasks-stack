import { AppFacade } from "../logic/app-facade";
import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from "./app.module";
import { injAppFacade } from "./inj-app-facade";


export const bootstrapAngularApp: (af: AppFacade, prodMode: boolean) => {}
    = (af, prodMode) => {

        if (prodMode) {
            enableProdMode()
        }

        platformBrowserDynamic([
            { provide: injAppFacade, useValue: af }
        ])
            .bootstrapModule(AppModule)
            .catch(err => console.error(err))

        return {}
    }
