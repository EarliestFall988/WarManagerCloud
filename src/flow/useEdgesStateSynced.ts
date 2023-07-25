import { useCallback, useEffect, useState } from "react";
import {
  type Edge,
  applyEdgeChanges,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type EdgeChange,
  type EdgeAddChange,
  type EdgeResetChange,
  type EdgeRemoveChange,
} from "reactflow";

// import getDoc, { isLoaded } from "./flowDocument";
// import ydoc from "./ydoc";
import getDoc from "./ydoc";

// Please see the comments in useNodesStateSynced.ts.
// This is the same thing but for edges.
export const edgesMap = (id: string) => getDoc(id).getMap<Edge>("edges");

export const GetEdges = (id: string) => {
  return Array.from<Edge>(edgesMap(id).values());
};

const isEdgeAddChange = (change: EdgeChange): change is EdgeAddChange =>
  change.type === "add";
const isEdgeResetChange = (change: EdgeChange): change is EdgeResetChange =>
  change.type === "reset";
const isEdgeRemoveChange = (change: EdgeChange): change is EdgeRemoveChange =>
  change.type === "remove";

function useEdgesStateSynced(id: string): [Edge[], OnEdgesChange, OnConnect] {
  const [edges, setEdges] = useState<Edge[]>([]);

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // if (!isLoaded() || !edgesMap) throw new Error("doc is null");

      const currentEdges = Array.from<Edge>(edgesMap(id).values()).filter(
        (e) => e
      );
      const nextEdges = applyEdgeChanges(changes, currentEdges);
      changes.forEach((change: EdgeChange) => {
        if (isEdgeRemoveChange(change)) {
          edgesMap(id).delete(change.id);
        } else if (!isEdgeAddChange(change) && !isEdgeResetChange(change)) {
          edgesMap(id).set(
            change.id,
            nextEdges.find((n) => n.id === change.id) as Edge
          );
        }
      });
    },
    [id]
  );

  const onConnect = useCallback((params: Connection | Edge) => {
    // if (!isLoaded() || !edgesMap) throw new Error("doc is null");

    const { source, sourceHandle, target, targetHandle } = params;

    if (source == null || target == null) return;

    const id = `edge-${source}${sourceHandle || ""}-${target}${
      targetHandle || ""
    }`;

    edgesMap(id).set(id, {
      id,
      ...params,
    } as Edge);
  }, []);

  useEffect(() => {
    // if (!isLoaded() || !edgesMap) return;

    const observer = () => {
      setEdges(Array.from(edgesMap(id).values()));
    };

    setEdges(Array.from(edgesMap(id).values()));
    edgesMap(id).observe(observer);

    return () => edgesMap(id).unobserve(observer);
  }, [setEdges, id]);

  return [edges, onEdgesChange, onConnect];
}

export default useEdgesStateSynced;
