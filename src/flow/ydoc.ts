import { Doc, UndoManager } from "yjs";
// For this example we use the WebrtcProvider to synchronize the document
// between multiple clients. Other providers are available.
// You can find a list here: https://docs.yjs.dev/ecosystem/connection-provider
import { WebrtcProvider } from "y-webrtc";
import { IndexeddbPersistence } from "y-indexeddb";

// const docName = "document webrtc for war manager";
const rootDoc = new Doc();
let undoManager = null as UndoManager | null;

let currentName = null as string | null;

let currentSubDoc = null as Doc | null;

let indexdbProvider = null as IndexeddbPersistence | null;

let provider = null as WebrtcProvider | null;

// const ydoc = rootDoc.getMap().get(docName) as Doc || new Doc();

export function Undo() {
  if (undoManager != null && undoManager.canUndo()) undoManager.undo();
}

export function Redo() {
  if (undoManager != null && undoManager.canRedo()) undoManager.redo();
}

export default function getDoc(name: string) {
  // console.log("fetching doc", name);

  let ydoc = rootDoc.getMap().get(name) as Doc;

  if (ydoc == null) {
    ydoc = new Doc();
    rootDoc.getMap().set(name, ydoc);
  }

  if (currentName != name) {
    Disconnect();
  }

  currentName = name;

  if (provider !== null) return ydoc;

  provider = new WebrtcProvider(name, ydoc, {
    signaling: ["wss://yjswebrtc.gigalixirapp.com/"],
  });

  if (undoManager == null) {
    undoManager = new UndoManager(ydoc.getMap("nodes"));
  } else {
    undoManager.clear();
  }

  indexdbProvider = new IndexeddbPersistence(name, ydoc);

  window.addEventListener("beforeunload", () => {
    Disconnect();
  });

  ydoc.load();

  currentSubDoc = ydoc;

  return ydoc;
}

export const Disconnect = () => {
  if (provider != null) {
    if (currentSubDoc != null) {
      currentSubDoc.destroy();
      currentSubDoc = null;
    }

    if (undoManager != null) {
      undoManager.clear();
      undoManager = null;
    }

    void indexdbProvider?.destroy();
    indexdbProvider = null;

    provider.disconnect();
    provider = null;
  }
};
