import { Body, Controller, Res } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TransactionsService } from './transactions.service';
import { DeviceInfo, IssuerId, ListReceipts, PaymentsResponse, TransactionsServiceController, TransactionsServiceControllerMethods } from 'src/typescript/transactions.pb';
import { Empty } from 'src/typescript/market.pb';

@Controller('transactions')
@TransactionsServiceControllerMethods()
export class TransactionsController implements TransactionsServiceController {

    constructor(private readonly transactionsService: TransactionsService){}
    addAccount(request: DeviceInfo): Empty | Promise<Empty> | Observable<Empty> {
        return this.transactionsService.createAccount(request.pubkey, request.deviceId)
    }


    getPayments(@Body() {id}: IssuerId): PaymentsResponse | Observable<PaymentsResponse> | Promise<PaymentsResponse> {
        return this.transactionsService.getPayments(id);
    }

    /**Method that receives Receipts (topic alternative) */
    addTxReceipt(request: ListReceipts): Empty | Promise<Empty> | Observable<Empty> {
        return this.transactionsService.addtxReceipt(request);
    }
}

