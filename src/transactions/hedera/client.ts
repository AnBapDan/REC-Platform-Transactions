import { AccountId, Client, PrivateKey } from "@hashgraph/sdk";

const mirror = "10.255.33.18:5600"

export const node = { "10.255.33.18:50211" : new AccountId(3) };
export let client = Client.forNetwork(node).setMirrorNetwork(mirror);
// export const test = Client.forTestnet();
export let ed25519_client = Client.forNetwork(node).setMirrorNetwork(mirror); 

/**DevNet */
client.setOperator(
  AccountId.fromString("0.0.2"),
  PrivateKey.fromString(
    "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"
  )
);

ed25519_client.setOperator(
  AccountId.fromString(process.env.TESTNET_MANAGER_ACCOUNT_ID),
  PrivateKey.fromString(process.env.TESTNET_MANAGER_PRIV_KEY)
  );