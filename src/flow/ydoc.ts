import { Doc } from "yjs";
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

const docName = "some unique document name";

const rootDoc = new Doc({ autoLoad: true });

new IndexeddbPersistence(docName, rootDoc);
new WebrtcProvider(docName, rootDoc);

// const ydoc = rootDoc.getMap().get(docName) as Doc || new Doc();

export default function getDoc(name: string) {
  console.log(name);

  let ydoc = rootDoc.getMap().get(name) as Doc;

  if (ydoc == null) {
    ydoc = new Doc();
    rootDoc.getMap().set(name, ydoc);
  }

  return ydoc;
}
