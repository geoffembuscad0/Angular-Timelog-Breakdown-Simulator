import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MyTesterComponent } from './my-tester/my-tester.component';

const routes: Routes = [
  {
    path: 'my-tester',
    component: MyTesterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
