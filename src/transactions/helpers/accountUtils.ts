import { AccountCreateTransaction, AccountId, Client, Hbar, PrivateKey, PublicKey } from "@hashgraph/sdk";
import { eurToHbar } from "../exchange/exchange";

export async function createAccount(pubkey: string): Promise<AccountId> {
    
    let client = Client.forTestNet();
    client.setOperator(
        AccountId.fromString(process.env.TESTNET_MANAGER_ACCOUNT_ID),
        PrivateKey.fromString(process.env.TESTNET_MANAGER_PRIV_KEY)
    );

    const currentTimestamp = new Date();
    //New accounts always starts with 10 euro balance
    const rate = await eurToHbar(currentTimestamp)
    const account = await new AccountCreateTransaction()
        .setKey(PublicKey.fromString(pubkey))
        .setInitialBalance(new Hbar(rate*10))
        .execute(client)
    const accountid = (await account.getReceipt(client)).accountId
    return accountid
}