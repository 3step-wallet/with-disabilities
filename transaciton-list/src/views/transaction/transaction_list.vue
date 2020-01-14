<template>
    <div>
        <h1>トランザクションのリスト！！</h1>
        <button @click="onClick">Get TransactionList</button>
        <p>{{ greet }}</p>
        <p>{{ age }}</p>
        <button @click="getAccountInfo" class="button--grey">getAccountInfo</button>
        <pre style="text-align: left; font-size: xx-small;">{{ accountInfo }}</pre>
    </div>
</template>

<script lang="ts">
    import {Component, Vue} from "vue-property-decorator";
    import {
        AccountHttp,
        Address,
        QueryParams
    } from "nem2-sdk";

    @Component
    export default class TransactionList extends Vue {
        greet: any[] = [];
        age: number = 19;
        accountInfo: any = null

        public onClick() {
            // alert("hello world")
            const rawAddress = 'TBULEA-UG2CZQ-ISUR44-2HWA6U-AKGWIX-HDABJV-IPS4';
            const address = Address.createFromRawAddress(rawAddress);

            const nodeUrl = 'http://api-harvest-20.ap-northeast-1.nemtech.network:3000';
            const accountHttp = new AccountHttp(nodeUrl);

            const pageSize = 100;

            const greet = accountHttp
                .getAccountTransactions(address, new QueryParams(pageSize))
                .subscribe((transactions) => console.log(transactions), (err) => console.error(err));

        }
    }


</script>