import { Injectable, OnModuleInit } from '@nestjs/common';
import { AccountId, Hbar, PublicKey, SubscriptionHandle, TopicMessage, TopicMessageQuery, TransactionReceiptQuery, TransactionRecordQuery, TransferTransaction } from '@hashgraph/sdk';
import { ListReceipts, PaymentsResponse, TransactionResponse } from 'src/typescript/transactions.pb';
import NodeClient from '@hashgraph/sdk/lib/client/NodeClient';
import { Client, ClientGrpc, RpcException, Transport } from '@nestjs/microservices';
import { AUTHENTICATED_MARKET_SERVICE_NAME, AuthenticatedMarketServiceClient, ListMatchResponse, ListUpdateMatch, MatchResponse, State, UpdateMatch, protobufPackage } from 'src/typescript/market.pb';
import { firstValueFrom } from 'rxjs';
import { AccountService } from './prisma/accounts.service';
import { authorizeNewMember, topic } from './helpers/topicUtils';
import { createAccount } from './helpers/accountUtils';
import { client } from './hedera/client';
import { eurToHbar, hbarToEur } from './exchange/exchange';
import { curlTransaction } from './hedera/curlDLT';
import { ChannelCredentials } from '@grpc/grpc-js';
import * as path from 'path';
import * as fs from 'fs';
import { Status } from '@grpc/grpc-js/build/src/constants';

@Injectable()
export class TransactionsService implements OnModuleInit {
    constructor(private readonly accountsService: AccountService) { }


    @Client({
        transport: Transport.GRPC,
        options: {
            url: 'market:50051',
            package: protobufPackage,
            protoPath: 'node_modules/grpc-protos/proto/market.proto',
            credentials: ChannelCredentials.createSsl(fs.readFileSync("/run/secrets/market_crt.pem"))
        },
    },
    )


    private readonly market: ClientGrpc;
    private marketService: AuthenticatedMarketServiceClient;
    private managerClient: NodeClient;

    private approach: number = 0;

    async onModuleInit() {
        this.marketService = this.market.getService<AuthenticatedMarketServiceClient>(AUTHENTICATED_MARKET_SERVICE_NAME);
        this.managerClient = client;
        new TopicMessageQuery()
            .setTopicId(topic)
            .subscribe(this.managerClient,
                (error) => { console.log(error) },
                (message) => this.parseTopicMessage(message)
            );
    }


    async getJsonPayments(id: string): Promise<ListMatchResponse> {
        /**Need to retrieve from Market Microservice */
        let pending = await firstValueFrom(this.marketService.retrieveMatches({
            buyerID: id,
            state: [State.Created, State.NotPaid]
        }));
        if (typeof pending === 'object' && !Array.isArray(pending) && Object.keys(pending).length === 0) {
            return { matches: [] }
        }


        let newPayment: ListMatchResponse = { matches: [] }
        //let testing: JsonResponse = {buyer:"teste",energy:0.12345,identifier:"15",price:300,seller:"servidor"}

        for await (let value of pending.matches) {

            try {
                value.buyerID = (await this.accountsService.account({ deviceID: value.buyerID })).accountID;

            } catch (e: any) {
                let returned: UpdateMatch[] = pending.matches.map(match => ({
                    matchID: match.id,
                    state: State.NotPaid,
                    message: "Buyer Wallet not Registered"
                }))

                await firstValueFrom(this.marketService.updateMatch({ matches: returned }))

                throw new RpcException({
                    code: Status.ABORTED,
                    message: "Missing Device Wallet."
                })
            }

            try {
                value.sellerID = (await this.accountsService.account({ deviceID: value.sellerID })).accountID;
            } catch (e: any) {
                let error: UpdateMatch = {
                    matchID: value.id,
                    state: State.NotPaid,
                    message: "Seller Wallet not Registered"
                }
                await firstValueFrom(this.marketService.updateMatch({ matches: [error] }))
                continue
            }

            try {
                let exchange = (await eurToHbar(value.timestamp))
                console.log("[" + new Date().toLocaleString() + "] Exchange = " + exchange + " At = " + value.timestamp)
                value.price = exchange * value.price * value.energy
                value.price = Number(value.price.toFixed(8))
                newPayment.matches.push(value)
            } catch (e: any) {
                let error: UpdateMatch = {
                    matchID: value.id,
                    state: State.NotPaid,
                    message: "Error fetching price from Web"
                }
                await firstValueFrom(this.marketService.updateMatch({ matches: [error] }))
                continue
            }

            const rate = (await eurToHbar(value.timestamp))
            console.log("[" + new Date().toLocaleString() + "] Payment "+value.id+" is due "+ value.price+" HBARS (Exchange rate "+rate+") "+value.timestamp)
        }
        return newPayment;
    }

    async getPayments(id: string): Promise<PaymentsResponse> {

        /**Direct JSON */
        if (this.approach === 0) {
            const jsonList = await this.getJsonPayments(id)
            return { approach: this.approach, json: jsonList.matches, transactions: [] }

            /** Transaction Service */
        } else if (this.approach === 1) {
            const txList = await this.getTransactionPayments(id)
            return { approach: this.approach, json: [], transactions: txList }
        }

        /** If some smart contract is in use */
        return { approach: this.approach, json: [], transactions: [] }

    }

    async getTransactionPayments(id: string): Promise<TransactionResponse[]> {
        const payments = await this.getJsonPayments(id);
        let array: TransactionResponse[];


        for await (let payment of payments.matches) {
            const transferTx = new TransferTransaction()
                .setTransactionMemo(`[${payment.id}] Energy transactioned: ${payment.energy}, at ${payment.timestamp}}`)
                .addHbarTransfer(AccountId.fromString(payment.buyerID), new Hbar(-Math.abs(payment.price)))
                .addHbarTransfer(AccountId.fromString(payment.sellerID), new Hbar(Math.abs(payment.price)));


            const pending = transferTx.freezeWith(this.managerClient);
            console.log("pending: " + pending)
            const signed = await pending.signWithOperator(this.managerClient);
            console.log("signed: " + signed)
            /* Must be saved and associated with Payment Identifier*/
            // pending.transactionId?.toString()

            const bytearray: TransactionResponse = { transaction: signed.toBytes() }
            array.push(bytearray)

        }

        console.log(`Transaction list: ${array}`)

        return array;
    }

    async addtxReceipt(request: ListReceipts) {
        /**Retrieve each match from Market service */
        let output: ListUpdateMatch = { matches: [] };
        await new Promise(f => setTimeout(f, 2000));
        for await (let value of request.receipts) {
            const payment = await firstValueFrom(this.marketService.retrieveMatches({ matchID: value.paymentID, state: [State.Sent] }))

            let match: UpdateMatch = { matchID: value.paymentID, transactionID: value.txID, state: null}

            const { id ,buyerID, sellerID, energy, price, timestamp } = payment.matches[0]

            /**Modified values to Tx ones */
            const buyerTx = (await this.accountsService.account({ deviceID: buyerID })).accountID
            const sellerTx = (await this.accountsService.account({ deviceID: sellerID })).accountID
            //const record = await new TransactionRecordQuery().setTransactionId(value.txID).execute(this.managerClient)
            let transaction;

            try{
                
                transaction = await curlTransaction(value.txID)
            }catch(e){
                match.state = State.Error;
                match.message = " Something went wrong when fetching transaction"
                output.matches.push(match)
                continue
            }
            
            const negativeTransfers = transaction.transfers.filter(transfer => transfer.amount < 0);
            const buyer = negativeTransfers[0].account
            let seller = null;
            for (const transfer of transaction.transfers) {
                if (transfer.account === sellerTx) {
                    seller = transfer.account;
                }
            }

            if (seller !== sellerTx) {
                //Check if the receiver counterpart corresponds to the prosumer 
                match.state = State.Error;
                match.message = " Sellers donnot match " +seller+" against transaction :"+sellerTx
                output.matches.push(match)
                continue
                
            }
            console.log("Buyer "+buyer);
            console.log("Seller:", seller);
            
            if (buyer !== buyerTx) {
                //Check if the buyer corresponds to the one that sent the transaction 
                match.state = State.Error;
                match.message = " Buyers donnot match " +buyer+" against transaction :"+buyerTx
                output.matches.push(match)
                continue
            }
            
            
            match.state = State.Paid
            output.matches.push(match)
        }
        await firstValueFrom(this.marketService.updateMatch(output))
        return {};
        
    }
    

    parseTopicMessage(message: TopicMessage) {
        const account = message.initialTransactionId?.accountId;
        if (account.equals(this.managerClient.operatorAccountId)) {

        }
        const content = Buffer.from(message.contents).toString()
        let ids = content.split(':');
        const timestamp = message.consensusTimestamp.toDate().toISOString()
        console.log("Account: " + account?.toString() + "; Content: " + content + "; Timestamp: " + timestamp)

        /* Remover do array de pagamentos a fazer/pendentes */
    }

    async createAccount(pubkey: string, deviceId: string) {
        console.log("[" + new Date().toLocaleString() + "] New account Creation: Device = " + deviceId)
        const id = await createAccount(pubkey)
        console.log("Account ID = " + id.toString())
        await this.accountsService.createAccounts({ accountID: id.toString(), deviceID: deviceId })

        await authorizeNewMember(PublicKey.fromString(pubkey), id, topic.toString())
    }
}
