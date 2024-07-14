import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoTestModule } from '../demo-test-module'
import { DashboardComponent } from './dashboard.component';
import { SalesComponent } from './dashboard-components/sales/sales.component';

import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { HttpClientModule } from '@angular/common/http';




@NgModule({
  declarations: [
    DashboardComponent,
    SalesComponent,

  ],
  imports: [
    CommonModule,
    DemoTestModule,
    FormsModule,
    NgApexchartsModule,
    FeatherModule.pick(allIcons),
    HttpClientModule
  ],
  exports: [
    DashboardComponent,
    SalesComponent,

  ]
})
export class DashboardModule { }
