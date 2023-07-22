import { Doc } from 'yjs';
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from 'y-webrtc';
// import { IndexeddbPersistence } from 'y-indexeddb';

const docName = 'some unique document name';

const ydoc = new Doc();
new WebrtcProvider(docName, ydoc);
// new IndexeddbPersistence(docName, ydoc);

export default ydoc;