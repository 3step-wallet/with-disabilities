import { Component } from '@angular/core';
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


@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  isOpen = false;
  scannedData: {};
  privateKey: string;
  publicKey: string;

  constructor(
    private qrScanner: QRScanner,
  ) {
  }

  ionViewWillEnter() {
    if ('privateKey' in localStorage) {
      this.privateKey = JSON.parse(localStorage.privateKey);
    }
    if ('publicKey' in localStorage) {
      this.publicKey = JSON.parse(localStorage.publicKey);
    }
   }

  openScanner() {
    this.qrScanner.prepare()
      .then((status: QRScannerStatus) => {
        console.log(status);
        if (status.authorized) {
          this.isOpen = true;

          // start scanning
          const scanSub = this.qrScanner.scan().subscribe((text: string) => {
            console.log('Scanned something', text);
            if (text !== '') {
              // tslint:disable-next-line:prefer-const
              let qrJson = JSON.parse(text);
              console.log(text);
              console.log(qrJson.data.msg);
              this.sendMultisig(qrJson);
            }

            this.isOpen = false;
            this.qrScanner.hide().then();
            scanSub.unsubscribe();
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
      .catch((e: any) => console.error(e));
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
    // ここでlocalstorageに保存した内容をロード:TODO
    console.log(this.privateKey);
    console.log(qrContent.data.msg);

    // QRで読み取った情報を代入
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
    const account = Account.createFromPrivateKey(privateKey, NetworkType.MIJIN_TEST);
    const networkGenerationHash = 'C053E2FFF5BD10D563962B44919D1F3E51D15BEA4602EB4CDB78BF3C211FF030';

    const signedTransaction = account.sign(transferTransaction, networkGenerationHash);
    /* end block 02 */

    /* start block 03 */
    const transactionHttp = new TransactionHttp('http://ec2-18-191-249-192.us-east-2.compute.amazonaws.com:3000');
    transactionHttp
        .announce(signedTransaction)
        .subscribe(x => console.log(x), err => console.error(err));
  }
}
