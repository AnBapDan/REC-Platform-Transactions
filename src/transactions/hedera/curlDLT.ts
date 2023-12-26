import axios from 'axios';


export async function curlTransaction(txID:string){
    const parts = txID.split('@');
    parts[1] = parts[1].replace(".","-")
    const tx = parts[0]+"-"+parts[1]
    console.log(tx)
    const response = await axios.get(
        `https://testnet.mirrornode.hedera.com/api/v1/transactions/${tx}`
    )
    return response.data.transactions[0]
}