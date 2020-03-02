import { Component, OnInit } from '@angular/core';
import { SMS } from '@ionic-native/sms/ngx';

@Component({
  selector: 'app-send-mail',
  templateUrl: './send-mail.page.html',
  styleUrls: ['./send-mail.page.scss'],
})
export class SendMailPage implements OnInit {
  phoneNumber: string;
  hrefNumber: string;


  constructor(private sms: SMS) { }

  ngOnInit() {
  }

  sendSMS() {
    this.sms.send('08061341310', 'Hello world!');
  }

  ionViewWillEnter() {
   if ('phoneNumber' in localStorage) {
     if ('phoneNumber' in localStorage) {
      this.phoneNumber = localStorage.phoneNumber;
     }
     this.hrefNumber = 'sms:' + this.phoneNumber;
   }
  }
}
