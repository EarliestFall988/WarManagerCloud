import type { NextPage } from "next";
import { useRouter } from "next/router";

import * as db from "y-indexeddb";

import * as Y from "yjs";
const doc = new Y.Doc();

const provider = new db.IndexeddbPersistence("blueprints", doc);
const ytext = doc.getText("blueprints");
const undoManager = new Y.UndoManager(ytext);

provider.on("synced", () => {
  console.log("synced");
});

const BlueprintPage: NextPage = () => {
  const query = useRouter().query;
  const id = query.id as string;


  console.log(ytext.toString())

  return (
    <div>
      <h1> {id} </h1>
      <textarea 
      value={ytext.toString()}
      onChange={(e) => {
        ytext.insert(0, e.target.value)
      }}
      />
    </div>
  );
};

export default BlueprintPage;
