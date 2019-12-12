import { Component, OnInit } from '@angular/core';
import { SMS } from '@ionic-native/sms/ngx';

@Component({
  selector: 'app-send-mail',
  templateUrl: './send-mail.page.html',
  styleUrls: ['./send-mail.page.scss'],
})
export class SendMailPage implements OnInit {

  constructor(private sms: SMS) { }

  ngOnInit() {
  }

  sendMessage() {
    this.sms.send('08061341310', 'Hello world!');
  }
}
