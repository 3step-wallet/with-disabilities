import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  title = 'アカウントの設定';
  privateKey: string;
  publicKey: string;
  phoneNumber: string;

  constructor() { }

  ngOnInit() {
  }

  ionViewWillEnter() {
   if ('privateKey' in localStorage) {
     this.privateKey = JSON.parse(localStorage.privateKey);
   }
   if ('publicKey' in localStorage) {
     this.publicKey = JSON.parse(localStorage.publicKey);
   }
   if ('phoneNumber' in localStorage) {
     this.phoneNumber = JSON.parse(localStorage.phoneNumber);
   }
  }

  addInfo() {
    localStorage.privateKey = JSON.stringify(this.privateKey);
    localStorage.publicKey = JSON.stringify(this.publicKey);
    localStorage.phoneNumber = JSON.stringify(this.phoneNumber);
  }

}
