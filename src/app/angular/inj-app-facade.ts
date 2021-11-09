import { InjectionToken } from "@angular/core";
import { AppFacade } from "../logic/app-facade";


export const injAppFacade = new InjectionToken<AppFacade>('AppFacade')