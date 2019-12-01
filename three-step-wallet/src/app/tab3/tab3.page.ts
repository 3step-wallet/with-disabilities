import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  phoneNumber: string;
  hrefNumber: string;

  constructor() { }

  ionViewWillEnter() {
    if ('phoneNumber' in localStorage) {
      this.phoneNumber = JSON.parse(localStorage.phoneNumber);
      this.hrefNumber =  'tel:' + this.phoneNumber;
    }
  }


}
