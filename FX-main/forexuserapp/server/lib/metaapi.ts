import MetaApi from "metaapi.cloud-sdk";

const TOKEN = process.env.METAAPI_TOKEN;
const ACCOUNT_ID = process.env.METAAPI_ACCOUNT_ID;

let metaApi: MetaApi | null = null;
let rpcConnection: any = null;
let establishing: Promise<any> | null = null;

async function ensureConnection() {
  if (!TOKEN || !ACCOUNT_ID) {
    throw new Error("METAAPI_TOKEN and METAAPI_ACCOUNT_ID must be configured");
  }

  if (rpcConnection) {
    return rpcConnection;
  }

  if (establishing) {
    return establishing;
  }

  establishing = (async () => {
    metaApi = new MetaApi(TOKEN);
    const account = await metaApi.metatraderAccountApi.getAccount(ACCOUNT_ID);

    const deployedStates = ["DEPLOYING", "DEPLOYED"];
    if (!deployedStates.includes(account.state)) {
      await account.deploy();
    }

    await account.waitConnected();

    const connection = account.getRPCConnection();
    await connection.connect();
    await connection.waitSynchronized();

    // Reset cached connection on disconnect so we can re-initialize automatically
    connection.addDisconnectListener?.(() => {
      rpcConnection = null;
      establishing = null;
    });

    rpcConnection = connection;
    establishing = null;
    return rpcConnection;
  })().catch((error) => {
    establishing = null;
    throw error;
  });

  return establishing;
}

export async function getMetaApiConnection() {
  return ensureConnection();
}

export async function getMetaAccountInfo() {
  const connection = await getMetaApiConnection();
  return connection.getAccountInformation();
}
