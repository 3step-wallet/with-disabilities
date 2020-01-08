import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import {
  Account,
  Address,
  Deadline,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  TransactionHttp,
  TransferTransaction,
  UInt64,
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
    const networkType = NetworkType.TEST_NET;
    const networkCurrencyMosaicId = new MosaicId('75AF035421401EF0');
    const networkCurrencyDivisibility = 6;

    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
      recipientAddress,
      [new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(amount * Math.pow(10, networkCurrencyDivisibility)))],
      PlainMessage.create(message),
      networkType,
      UInt64.fromUint(2000000));

    const privateKey = this.privateKey;
    const account = Account.createFromPrivateKey(privateKey, networkType);
    const networkGenerationHash = 'CC42AAD7BD45E8C276741AB2524BC30F5529AF162AD12247EF9A98D6B54A385B';

    const signedTransaction = account.sign(transferTransaction, networkGenerationHash);

    const nodeUrl = 'https://jp5.nemesis.land:3001/';
    const transactionHttp = new TransactionHttp(nodeUrl);
    transactionHttp
        .announce(signedTransaction)
        .subscribe(x => console.log(x), err => console.error(err));

    console.log(signedTransaction.hash);


  }

}
