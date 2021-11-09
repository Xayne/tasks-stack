import { initApp } from "./actions/init";
import { mkAppCore } from "./app-core";
import { AppFacade, mkAppFacade } from "./app-facade";

export const bootstrapApp: () => AppFacade
    = () => {
        const core = mkAppCore()
        core.runAction(initApp)
        const af = mkAppFacade(core)
        return af
    }
