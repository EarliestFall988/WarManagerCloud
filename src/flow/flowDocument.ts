import { Doc } from "yjs";
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from "y-webrtc";
import { Awareness } from "y-protocols/awareness";
import { IndexeddbPersistence } from "y-indexeddb";

const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";
const password = "af15571d-4f1b-4df1-92d2-70824c7fa0cf";

export let synced = false;

let docName = "some unique document name";

const ydoc = new Doc();

let hasSetName = false;
let wsProvider = null as WebrtcProvider | null;

const providerOptions = {
  signaling: [liveWebRTCConnection],
  password: password,
  awareness: new Awareness(ydoc),
};

export const setName = (name: string) => {
  if (hasSetName) return;

  docName = name;
   new IndexeddbPersistence(docName, ydoc);
  wsProvider = new WebrtcProvider(docName, ydoc, providerOptions);
  wsProvider.on("synced", () => {
    synced = true;
  });

  hasSetName = true;
};

export const Disconnect = () => {
  if (wsProvider == null) return;

  wsProvider.disconnect();
  synced = false;
};

export default ydoc;
