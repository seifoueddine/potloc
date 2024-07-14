import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { DemoTestModule } from '../demo-test-module';
import { MenuComponent } from './menu/menu.component';
import { FormsModule } from '@angular/forms';



@NgModule({
  imports: [
    CommonModule,
    FeatherModule.pick(allIcons),
    DemoTestModule,
    MenuComponent,
    FormsModule
  ],
  exports: [
    MenuComponent,
  ]
})
export class ComponentsModule { }
