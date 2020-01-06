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
  hrefNumber: string;

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
     this.hrefNumber =  'tel:' + this.phoneNumber;
   }
  }

  addInfo() {
    localStorage.privateKey = JSON.stringify(this.privateKey);
    localStorage.publicKey = JSON.stringify(this.publicKey);
    localStorage.phoneNumber = JSON.stringify(this.phoneNumber);
    console.log(localStorage.privateKey);
    console.log(localStorage.publicKey);
    console.log(localStorage.phoneNumber);
  }

}
