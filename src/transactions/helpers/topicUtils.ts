import {
  AccountId,
  Client,
  Key,
  KeyList,
  PrivateKey,
  PublicKey,
  TopicCreateTransaction,
  TopicId,
  TopicInfoQuery,
  TopicMessageSubmitTransaction,
  TopicUpdateTransaction,
} from "@hashgraph/sdk";

export const topic: TopicId = TopicId.fromString("0.0.1032")

export async function createTopic(memo: string): Promise<TopicId> {
  const mirror = "10.255.33.18:5600"
  const node = { "10.255.33.18:50211": new AccountId(3) };
  let client = Client.forNetwork(node).setMirrorNetwork(mirror);
  client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));

  const transaction = new TopicCreateTransaction()
    .setTopicMemo(memo)
    .setAdminKey(client.operatorPublicKey)
    .setSubmitKey(new KeyList([client.operatorPublicKey],1))

  const txResponse = await transaction.execute(client);

  const topicId = (await txResponse.getReceipt(client)).topicId;
  console.log("TOPIC ID _> "+topicId.toString())
  return topicId
}

export async function retrieveMembers(address: string): Promise<KeyList> {
  const mirror = "10.255.33.18:5600"
  const node = { "10.255.33.18:50211": new AccountId(3) };
  let client = Client.forNetwork(node).setMirrorNetwork(mirror);
  client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));
  const topic = await new TopicInfoQuery().setTopicId(address).execute(client)
  console.log(topic.submitKey as KeyList)
  return topic.submitKey as KeyList
}

export function updateMembers(oldKeys: KeyList, newKeys: Key[]): KeyList {
  if(oldKeys === null){
    oldKeys = new KeyList(newKeys).setThreshold(1)
    return oldKeys
  }

  newKeys.forEach(key => {
    oldKeys.push(key)
  })
  return oldKeys
}

export async function authorizeNewMember(key: PublicKey, member: AccountId, address: string) {
  const mirror = "10.255.33.18:5600"
  const node = { "10.255.33.18:50211": new AccountId(3) };
  let client = Client.forNetwork(node).setMirrorNetwork(mirror);
  client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));
  const oldMembers = await retrieveMembers(address)
  const newKeys = updateMembers(oldMembers , [key])
  console.log(newKeys)
  const update = await new TopicUpdateTransaction()
    .setTopicId(address)
    .setSubmitKey(newKeys)
    .execute(client)
  console.log((await update.getReceipt(client)).status.toString())
  await submitMessage(address, `new Member: ${member.toString()} `)
}

export async function submitMessage(address: string, message: string) {
  const mirror = "10.255.33.18:5600"
  const node = { "10.255.33.18:50211": new AccountId(3) };
  let client = Client.forNetwork(node).setMirrorNetwork(mirror);
  client.setOperator(AccountId.fromString("0.0.2"), PrivateKey.fromString("302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137"));
  const submit = await new TopicMessageSubmitTransaction().setTopicId(address).setMessage(message).execute(client)
  console.log((await submit.getReceipt(client)).status.toString())
}