import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FullScreenLoaderComponent } from "./full-screen-loader.component";



@NgModule({
    imports: [CommonModule],
    declarations: [FullScreenLoaderComponent],
    exports: [FullScreenLoaderComponent],
})
export class FullScreenLoaderModule {}