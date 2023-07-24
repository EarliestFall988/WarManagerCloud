import { Doc } from "yjs";
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from "y-webrtc";
// import { IndexeddbPersistence } from "y-indexeddb";
import { type Edge, type Node } from "reactflow";

const liveWebRTCConnection = "wss://definitive-obese-condor.gigalixirapp.com/";
// const password = "af15571d-4f1b-4df1-92d2-70824c7fa0cf";

// let synced = false;

export let docName = "some unique document name";

let doc = null as Doc | null;
// let subDoc = null as Doc | null;

let isSetupFinished = false;
let wsProvider = null as WebrtcProvider | null;

// let provider = null as IndexeddbPersistence | null;

const providerOptions = {
  signaling: [liveWebRTCConnection],
};

export const Init = (name: string, nodes: Node[], edges: Edge[]) => {
  if (isSetupFinished) return;

  console.log("Connecting");

  doc = new Doc({ autoLoad: true });

  doc.getMap<Node[]>("nodes").set("nodes", nodes);
  doc.getMap<Edge[]>("edges").set("edges", edges);

  // subDoc = new Doc();
  // subDoc.getMap().set("nodes", content);
  docName = name;
  wsProvider = new WebrtcProvider(name, doc, providerOptions);
  wsProvider.on("synced", () => {
    console.log("Synced");
    // synced = true;
  });

  // provider = new IndexeddbPersistence("wm doc", rootDoc);
  isSetupFinished = true;
  console.log("Connected");

  console.log("doc", doc);
};

const getDoc = () => {

  if(doc == null) throw new Error("doc is null");

  return doc;
};

export const isLoaded = () => {
  return isSetupFinished && doc !== null && doc != undefined;
};

// export const setName = (name: string) => {
//   if (isSetupFinished) return;

//   console.log("Connecting");

//   docName = name;

//   let doc = rootDoc.getMap().get(name);
//   if (doc == null) {
//     doc = new Doc();
//     rootDoc.getMap().set(name, doc);
//   }

//   // toast.loading("Loading document", { duration: 1000 });

//   // subDoc = doc as Doc;
//   // if (!subDoc.isLoaded) {
//   //   void subDoc.whenLoaded.then(() => {
//   //     toast.success("Document loaded");
//   //   });

//   //   subDoc.load();
//   // }

//   wsProvider = new WebrtcProvider(name, subDoc, providerOptions);
//   // provider = new IndexeddbPersistence("wm doc", rootDoc);
//   isSetupFinished = true;
// };

export const Disconnect = () => {
  // if (wsProvider == null) return;

  wsProvider?.disconnect();
  // // void provider?.destroy();
  // // wsProvider = null;
  // // provider = null;

  // // if (subDoc != null) {
  // //   subDoc.destroy();
  // //   subDoc = null;
  // // }

  doc?.destroy();
  docName = "";

  console.log("Disconnecting");
};

export default getDoc;
