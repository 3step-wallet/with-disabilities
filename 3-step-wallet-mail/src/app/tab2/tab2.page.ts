import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import {
  Account,
  Address,
  Deadline,
  NetworkCurrencyMosaic,
  NetworkType,
  PlainMessage,
  TransactionHttp,
  TransferTransaction,
} from 'nem2-sdk';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {
  isOpen = false;
  scannedData: {};
  privateKey: string;
  publicKey: string;

  constructor(
    private qrScanner: QRScanner,
    private router: Router,
  ) {
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    if ('privateKey' in localStorage) {
      this.privateKey = JSON.parse(localStorage.privateKey);
    }
    if ('publicKey' in localStorage) {
      this.publicKey = JSON.parse(localStorage.publicKey);
    }
   }

  startScanner() {
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        if (status.authorized) {
          this.isOpen = true;

          // start scanning
          const scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);
            if (text !== '') {
              const qrJson = JSON.parse(text);
              console.log(text);
              console.log(qrJson.data.msg);
              this.sendMultisig(qrJson);
            }

            this.isOpen = false;
            this.qrScanner.hide().then();
            scanSub.unsubscribe();
            this.router.navigateByUrl('/send-mail');
          });

          this.qrScanner.show().then();


        } else if (status.denied) {
          // camera permission was permanently denied
          // you must use QRScanner.openSettings() method to guide the user to the settings page
          // then they can grant the permission from there
          this.qrScanner.openSettings();
        } else {
          // permission was denied, but not permanently. You can ask for permission again at a later time.
        }
      })
      .catch((e: any) => console.log('Error is', e));
  }

  async closeScanner() {
    try {
      const status = await this.qrScanner.destroy();
      console.log('destroy status', status);
      this.isOpen = false;
    } catch (e) {
      console.error(e);
    }
  }

  async sendMultisig(qrContent: any) {
    console.log(this.privateKey);
    console.log(qrContent.data.msg);

    const toAddr: string = qrContent.data.addr;
    const amount: number = qrContent.data.amount / Math.pow(10, 6);
    const message: string = qrContent.data.msg;

    const recipientAddress = Address.createFromRawAddress(toAddr);

    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
      recipientAddress,
      [NetworkCurrencyMosaic.createRelative(amount)],
      PlainMessage.create(message),
      NetworkType.MIJIN_TEST);

    const privateKey = this.privateKey;
    const account = Account.createFromPrivateKey(privateKey, NetworkType.TEST_NET);
    const networkGenerationHash = '53F0604E403333BAD330503C196FF435A1AF6A4C166F8B967C6E1716D959ED34';

    const signedTransaction = account.sign(transferTransaction, networkGenerationHash);


    const transactionHttp = new TransactionHttp('http://ec2-3-136-106-135.us-east-2.compute.amazonaws.com:3000');
    transactionHttp
        .announce(signedTransaction)
        .subscribe(x => console.log(x), err => console.error(err));

    console.log(signedTransaction.hash);


  }

}
