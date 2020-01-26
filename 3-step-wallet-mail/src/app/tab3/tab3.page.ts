import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit {
  title = 'Settings Account';
  privateKey: string;
  publicKey: string;
  phoneNumber: string;
  hrefNumber: string;

  constructor() {}

  ngOnInit() {
  }

  ionViewWillEnter() {
     this.privateKey = localStorage.getItem('privateKey');
     this.publicKey = localStorage.getItem('publicKey');
     this.phoneNumber = localStorage.getItem('phoneNumber');
     if (this.phoneNumber) {
      this.hrefNumber = 'tel:' + this.phoneNumber;
     }
  }

  addInfo() {
    localStorage.setItem('privateKey', this.privateKey);
    localStorage.setItem('publicKey', this.publicKey);
    localStorage.setItem('phoneNumber', this.phoneNumber);
    console.log(localStorage.privateKey);
    console.log(localStorage.publicKey);
    console.log(localStorage.phoneNumber);
  }

}
