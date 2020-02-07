import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Listener,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  TransactionService,
  TransferTransaction,
  UInt64,
  TransactionHttp,
  ReceiptHttp,
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
            console.log('1', text);
            if (text !== '') {
              const qrJson = JSON.parse(text);
              console.log('2', text);
              console.log('3', qrJson.data.msg);
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

    const toAddr = 'TDONBHXA6T55L7BDZ2VRECPDA54Z2NZDE7RR4CP7';
    const amount: number = qrContent.data.amount / Math.pow(10, 6);
    const message: string = qrContent.data.msg;

    console.log(toAddr);
    console.log(amount);
    console.log(message);

    const networkType = NetworkType.TEST_NET;
    const cosignatoryPrivateKey = this.privateKey;
    const cosignatoryAccount = Account.createFromPrivateKey(cosignatoryPrivateKey, networkType);

    console.log(cosignatoryAccount);

    const multisigAccountPublicKey = this.publicKey;
    const multisigAccount = PublicAccount.createFromPublicKey(multisigAccountPublicKey, networkType);

    console.log(multisigAccount);

    const recipientAddress = Address.createFromRawAddress(toAddr);

    const networkCurrencyMosaicId = new MosaicId('51A99028058245A8');
    const networkCurrencyDivisibility = 6;

    const transferTransaction = TransferTransaction.create(
      Deadline.create(),
      recipientAddress,
      [new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(amount * Math.pow(10, networkCurrencyDivisibility)))],
      PlainMessage.create(message),
      networkType);

    const aggregateTransaction = AggregateTransaction.createBonded(
      Deadline.create(),
      [transferTransaction.toAggregate(multisigAccount)],
      networkType,
      ).setMaxFee(200);

    const networkGenerationHash = '45870419226A7E51D61D94AD728231EDC6C9B3086EF9255A8421A4F26870456A';
    const signedTransaction = cosignatoryAccount.sign(aggregateTransaction, networkGenerationHash);
    console.log(`aggregate tx: ${signedTransaction.hash}`);

    const hashLockTransaction = HashLockTransaction.create(
      Deadline.create(),
      new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
      UInt64.fromUint(480),
      signedTransaction,
      networkType,
      UInt64.fromUint(2000000));

    const signedHashLockTransaction = cosignatoryAccount.sign(hashLockTransaction, networkGenerationHash);
    console.log(`hashlock tx : ${signedHashLockTransaction.hash}`);


    const nodeUrl = 'http://api-xym-3-01.ap-southeast-1.nemtech.network:3000';
    const wsEndpoint = nodeUrl.replace('http', 'ws');

    const listener = new Listener(wsEndpoint, WebSocket);
    const transactionHttp = new TransactionHttp(nodeUrl);
    const receiptHttp = new ReceiptHttp(nodeUrl);
    const transactionService = new TransactionService(transactionHttp, receiptHttp);

    listener.open().then(() => {
      transactionService.announceHashLockAggregateBonded(signedHashLockTransaction, signedTransaction, listener).subscribe(x => {
        console.log(x);
        listener.close();
      }, err => {
        console.error(err);
        listener.close();
      });
    });


  }

}
