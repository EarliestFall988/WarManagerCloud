import { Doc } from "yjs";
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

// const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";
// const password = "af15571d-4f1b-4df1-92d2-70824c7fa0cf";

// let synced = false;

let docName = "some unique document name";

const rootDoc = new Doc({ autoLoad: true });
let subDoc = null as Doc | null;

let hasSetName = false;
let wsProvider = null as WebrtcProvider | null;

let provider = null as IndexeddbPersistence | null;

const providerOptions = {};

export const setName = (name: string) => {
  if (hasSetName) return;

  console.log("Connecting");

  docName = name;

  let doc = rootDoc.getMap().get(name);
  if (doc == null) {
    doc = new Doc();
    rootDoc.getMap().set(name, doc);
  }

  subDoc = doc as Doc;

  wsProvider = new WebrtcProvider(name, subDoc, providerOptions);
  provider = new IndexeddbPersistence(docName, subDoc);
  hasSetName = true;
};

export const Disconnect = () => {
  if (wsProvider == null) return;

  wsProvider.disconnect();
  void provider?.destroy();

  console.log("Disconnecting");

  if (subDoc != null) {
    subDoc.destroy();
    subDoc = null;
  }
};

export default rootDoc;
