import {
  SignalSlashIcon,
  TruckIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";

// import * as HoverCard from "@radix-ui/react-hover-card";
import HoverCardComponent from "./HoverCard";
// import type { Tag } from "@prisma/client";
import { TagBubblesHandler } from "./TagComponent";

import useLiveData from "~/flow/databank";
import { LoadingSpinner } from "./loading";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import TooltipComponent from "./Tooltip";
import Link from "next/link";

interface crewNodeInput {
  data: {
    id: string;
  };
  selected: boolean;
}

const EquipmentNode = ({ data, selected }: crewNodeInput) => {
  const { equipmentData, isLoading, isError: error } = useLiveData();

  const [animationParent1] = useAutoAnimate({
    duration: 300,
    easing: "ease-in-out",
  });

  const info = equipmentData.find((crew) => crew.id == data.id);

  const theme = `${
    selected
      ? "bg-green-800 rounded-sm ring-0"
      : "ring-zinc-700 hover:ring rounded-lg hover:ring-zinc-600 bg-green-900"
  }`;

  const created = new Date(info?.createdAt || 0);

  return (
    <>
      <div className="h-full w-full">
        <div
          className={`flex h-full w-full cursor-move rounded-lg px-1 text-zinc-100 ${
            info ? "ring-2" : ""
          } transition duration-200 ${theme} `}
        >
          <div ref={animationParent1} className="cursor h-24 w-72">
            {isLoading || !equipmentData || !data || !info || error ? (
              <div className="flex h-full w-full items-center justify-center gap-2">
                <UserCircleIcon className="fixed bottom-0 right-0 h-5 w-5" />
                {error && (
                  <TooltipComponent
                    content="Error loading crew data"
                    side="top"
                  >
                    <SignalSlashIcon className="h-7 w-7 animate-pulse text-amber-500" />
                  </TooltipComponent>
                )}
                {!error && <LoadingSpinner />}
              </div>
            ) : (
              <>
                <HoverCardComponent
                  editURL={`/equipment/${data.id}`}
                  trigger={
                    <button className="fixed bottom-0 right-0 z-10 h-6 w-6 -translate-x-1 -translate-y-1 text-white/20">
                      <TruckIcon />
                    </button>
                  }
                  content={
                    <div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 15,
                        }}
                      >
                        <div className="flex items-center gap-3 pb-3">
                          <div className="h-12 w-12">
                            <TruckIcon className="h-12 w-12" />
                          </div>
                          <div className="flex flex-col">
                            <div>
                              <div className="text-lg font-semibold">
                                {info.name}
                              </div>
                              <div className="truncate text-ellipsis italic tracking-tight text-zinc-300">
                                {info.type}
                              </div>
                            </div>
                            <div className="max-h-[5rem] w-full">
                              {info.tags && (
                                <TagBubblesHandler
                                  tags={info.tags}
                                  mode={"equipment"}
                                  equipment={info}
                                />
                              )}
                            </div>
                            {/* <div>
                              {info.email && (
                                <div className="flex items-center gap-2">
                                  <IdentificationIcon className="h-4 w-4" />
                                  <div className="text-sm">{info.email}</div>
                                </div>
                              )}
                              {info.phone && (
                                <div className="flex items-center gap-2">
                                  <PhoneIcon className="h-4 w-4" />
                                  <div className="text-sm">{info.phone}</div>
                                </div>
                              )}
                              {!info.email && !info.phone && (
                                <div className="flex items-center gap-2">
                                  <div className="text-sm">
                                    <span className="font-thin text-zinc-400">
                                      Contact
                                    </span>{" "}
                                    (none)
                                  </div>
                                </div>
                              )}
                            </div> */}
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full justify-between gap-1 border-t border-zinc-700 pt-1">
                        <div className="text-zinc-300">
                          {info.condition && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Condition
                                </span>{" "}
                                {info.condition}
                              </div>
                            </div>
                          )}

                          {info.createdAt && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Registered
                                </span>{" "}
                                {created ? created.toDateString() : "unknown"}
                              </div>
                            </div>
                          )}

                          {info.equipmentId && (
                            <div className="text-sm">
                              <span className="font-thin text-zinc-400">
                                Identification #
                              </span>{" "}
                              {info.equipmentId}
                            </div>
                          )}
                        </div>
                        <div className="text-zinc-300">
                          {info.costPerHour != 0 && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Cost / Hour
                                </span>{" "}
                                ${info.costPerHour.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {info.gpsURL && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  GPS URL
                                </span>
                                <Link href={info.gpsURL}>
                                  <a
                                    target="_blank"
                                    className="text-blue-400 hover:underline"
                                  >
                                    {info.gpsURL}
                                  </a>
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex w-full justify-between gap-1 border-t border-zinc-700 pt-1">
                        {info.description && (
                          <div className="text-zinc-300">
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <p className="font-thin text-zinc-400">
                                  Notes{" "}
                                </p>
                                <p> {info.description}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  }
                />
                <p className="text-lg font-semibold">{info.name}</p>

                {info.tags && (
                  <div className="flex flex-wrap gap-2 rounded">
                    <p className="text-sm tracking-tight text-white/70">
                      {info.type}
                    </p>
                    <TagBubblesHandler
                      tags={info.tags}
                      mode={"equipment"}
                      equipment={info}
                      style="bg-zinc-800"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        <NodeResizer
          handleStyle={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: "#ccc",
            color: "#ccc",
            borderColor: "#ccc",
          }}
          lineStyle={{ borderColor: "#777", borderWidth: 2 }}
          isVisible={selected}
          minWidth={120}
          minHeight={50}
        />
        {/* <Handle type="source" position={Position.Top} id={"fanfan"} /> */}
      </div>
    </>
  );
};

export default memo(EquipmentNode);
