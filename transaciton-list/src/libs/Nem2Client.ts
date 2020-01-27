import { Address, AccountHttp } from 'nem2-sdk';

export default class Nem2Client {
  static async getAccountInfo(addressStr: string) {
    const accountHttp = new AccountHttp('http://api-harvest-20.ap-northeast-1.nemtech.network:3000');
    const address = Address.createFromRawAddress(addressStr);
    const result = await accountHttp.getAccountInfo(address).toPromise();
    return result;
  }
}