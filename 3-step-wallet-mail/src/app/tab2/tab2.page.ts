import { Component, OnInit } from '@angular/core';
import { QRScanner, QRScannerStatus } from '@ionic-native/qr-scanner/ngx';
import {
  Account,
  Address,
  AggregateTransaction,
  Deadline,
  HashLockTransaction,
  Mosaic,
  MosaicId,
  NetworkType,
  PlainMessage,
  PublicAccount,
  TransactionService,
  TransferTransaction,
  UInt64,
} from 'nem2-sdk';
import {RepositoryFactoryHttp} from 'nem2-sdk/dist/src/infrastructure/RepositoryFactoryHttp';
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
    if (localStorage.getItem('privateKey')) {
      this.privateKey = localStorage.getItem('privateKey');
    }
    if (localStorage.getItem('publicKey')) {
      this.publicKey = localStorage.getItem('publicKey');
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
    console.log('5', this.privateKey);
    console.log('6', qrContent.data.msg);

    const toAddr = 'TDONBHXA6T55L7BDZ2VRECPDA54Z2NZDE7RR4CP7';
    const amount: number = qrContent.data.amount / Math.pow(10, 6);
    const message: string = qrContent.data.msg;

    const networkType = NetworkType.TEST_NET;
    const cosignatoryPrivateKey = this.privateKey;
    const cosignatoryAccount = Account.createFromPrivateKey(cosignatoryPrivateKey, networkType);

    console.log('7', cosignatoryAccount);

    const multisigAccountPublicKey = this.publicKey;
    const multisigAccount = PublicAccount.createFromPublicKey(multisigAccountPublicKey, networkType);

    console.log('8', multisigAccount);

    const recipientAddress = Address.createFromRawAddress(toAddr);

    const networkCurrencyMosaicId = new MosaicId('75AF035421401EF0');
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
      []).setMaxFee(2000);

    const networkGenerationHash = 'CC42AAD7BD45E8C276741AB2524BC30F5529AF162AD12247EF9A98D6B54A385B';
    const signedTransaction = cosignatoryAccount.sign(aggregateTransaction, networkGenerationHash);
    console.log('9', signedTransaction.hash);

    const hashLockTransaction = HashLockTransaction.create(
      Deadline.create(),
      new Mosaic (networkCurrencyMosaicId,
        UInt64.fromUint(10 * Math.pow(10, networkCurrencyDivisibility))),
      UInt64.fromUint(480),
      signedTransaction,
      networkType,
      UInt64.fromUint(2000000));

    console.log('10', hashLockTransaction);

    const signedHashLockTransaction = cosignatoryAccount.sign(hashLockTransaction, networkGenerationHash);

    console.log('11', signedHashLockTransaction);

    const nodeUrl = 'http://api-harvest-20.eu-west-1.nemtech.network:3000';
    console.log('12', nodeUrl);

    const wsEndpoint = nodeUrl.replace('http', 'ws');
    console.log('13', wsEndpoint);

    const repositoryFactory = new RepositoryFactoryHttp(wsEndpoint, networkType, networkGenerationHash);
    console.log('14', repositoryFactory);

    const listener = repositoryFactory.createListener();
    console.log('15', listener);

    const receiptHttp = repositoryFactory.createReceiptRepository();
    console.log('16', receiptHttp);

    const transactionHttp = repositoryFactory.createTransactionRepository();
    console.log('17', transactionHttp);

    const transactionService = new TransactionService(transactionHttp, receiptHttp);
    console.log('18', transactionService);

    listener.open().then(() => {
      transactionService.announceHashLockAggregateBonded(signedHashLockTransaction, signedTransaction, listener).subscribe(x => {
        console.log('19', x);
        listener.close();
      }, err => {
        console.error('20', err);
        listener.close();
      });
    }, err => {
      console.error('21', err);
    });

  }

}
