import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SendMailPage } from './send-mail.page';

const routes: Routes = [
  {
    path: '',
    component: SendMailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SendMailPageRoutingModule {}
