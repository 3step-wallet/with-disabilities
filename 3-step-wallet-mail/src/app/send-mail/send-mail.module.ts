import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SendMailPageRoutingModule } from './send-mail-routing.module';

import { SendMailPage } from './send-mail.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SendMailPageRoutingModule
  ],
  declarations: [SendMailPage]
})
export class SendMailPageModule {}
