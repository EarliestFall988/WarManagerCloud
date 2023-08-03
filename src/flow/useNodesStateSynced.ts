import { useCallback, useEffect, useState } from "react";
import {
  applyNodeChanges,
  type Edge,
  getConnectedEdges,
  type Node,
  type NodeAddChange,
  type NodeChange,
  type NodeResetChange,
  type OnNodesChange,
} from "reactflow";

import { edgesMap } from "./useEdgesStateSynced";
import getDoc from "./ydoc";
import { blueprintNodes, setBlueprintNodes } from "./costing";
// import getDoc, { isLoaded } from "./flowDocument";

// We are using nodesMap as the one source of truth for the nodes.
// This means that we are doing all changes to the nodes in the map object.
// Whenever the map changes, we update the nodes state.

export const nodesMap = (id: string) => getDoc(id).getMap<Node>("nodes");

const isNodeAddChange = (change: NodeChange): change is NodeAddChange =>
  change.type === "add";
const isNodeResetChange = (change: NodeChange): change is NodeResetChange =>
  change.type === "reset";

export const initNodeChanges = (id: string, nodes: Node[]) => {
  nodesMap(id).clear();

  nodes.forEach((node) => {
    nodesMap(id).set(node.id, node);
  });
};

export const GetNodes = (id: string) => {
  return Array.from<Node>(nodesMap(id).values());
};

export const DeleteNode = (id: string, nodeId: string) => {

  const deletedNode = nodesMap(id).get(nodeId);
  nodesMap(id).delete(nodeId);

  if (edgesMap === undefined) throw new Error("edgesMap is null");

  // when a node is removed, we also need to remove the connected edges
  const edges = Array.from<Edge>(edgesMap(id).values()).map((e) => e);
  const connectedEdges = getConnectedEdges(
    deletedNode ? [deletedNode] : [],
    edges
  );

  connectedEdges.forEach((edge) => {
    if (edgesMap == undefined) throw new Error("edgesMap is null");

    edgesMap(id).delete(edge.id);
  });

  return GetNodes(id);
}

function useNodesStateSynced(id: string): [Node[], OnNodesChange] {
  const [nodes, setNodes] = useState<Node[]>([]);

  // The onNodesChange callback updates nodesMap.
  // When the changes are applied to the map, the observer will be triggered and updates the nodes state.
  const onNodesChanges: OnNodesChange = useCallback(
    (changes) => {
      // if (!isLoaded() || !nodesMap) throw new Error("doc is null");

      if (edgesMap === undefined) throw new Error("edgesMap is null");

      const nodes = Array.from<Node>(nodesMap(id).values());

      const nextNodes = applyNodeChanges(changes, nodes);
      changes.forEach((change: NodeChange) => {
        if (!isNodeAddChange(change) && !isNodeResetChange(change)) {
          const node = nextNodes.find((n) => n.id === change.id);

          if (node && change.type !== "remove") {
            nodesMap(id).set(change.id, node);
          } else if (change.type === "remove") {

            DeleteNode(id, change.id);

            // const deletedNode = nodesMap(id).get(change.id);
            // nodesMap(id).delete(change.id);

            // if (edgesMap === undefined) throw new Error("edgesMap is null");

            // // when a node is removed, we also need to remove the connected edges
            // const edges = Array.from<Edge>(edgesMap(id).values()).map((e) => e);
            // const connectedEdges = getConnectedEdges(
            //   deletedNode ? [deletedNode] : [],
            //   edges
            // );

            // connectedEdges.forEach((edge) => {
            //   if (edgesMap == undefined) throw new Error("edgesMap is null");

            //   edgesMap(id).delete(edge.id);
            // });
          }
        }
      });

      setBlueprintNodes(nodes);
    },
    [id]
  );

  // here we are observing the nodesMap and updating the nodes state whenever the map changes.
  useEffect(() => {
    // if (!isLoaded || !edgesMap || !nodesMap) return;

    const observer = () => {
      setNodes(Array.from(nodesMap(id).values()));
    };

    setNodes(Array.from(nodesMap(id).values()));
    nodesMap(id).observe(observer);

    return () => nodesMap(id).unobserve(observer);
  }, [setNodes, id]);

  return [nodes.filter((n) => n), onNodesChanges];
}

export default useNodesStateSynced;
