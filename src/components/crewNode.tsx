import {
  IdentificationIcon,
  PhoneIcon,
  SignalSlashIcon,
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

interface crewNodeInput {
  data: {
    id: string;
  };
  selected: boolean;
}

// name: string;
//     description: string;
//     position: string;
//     email: string;
//     phone: string;
//     rating: number;
//     travel: string;
//     wage: string;
//     burden: string;
//     createdAt: string;
//     lastReviewDate: string;
//     tags: Tag[];

const CrewNode = ({ data, selected }: crewNodeInput) => {
  const { crewData, isLoading, isError: error } = useLiveData();

  const [animationParent1] = useAutoAnimate({
    duration: 300,
    easing: "ease-in-out",
  });

  const info = crewData.find((crew) => crew.id == data.id);

  let theme = `${
    selected
      ? "bg-zinc-600 rounded-sm ring-0"
      : "ring-zinc-700 hover:ring rounded-lg hover:ring-zinc-600 bg-zinc-800"
  }`;

  if (
    info?.position.includes("Foreman") ||
    info?.position.includes("District Division Technician")
  )
    theme = `${
      selected
        ? "bg-gradient-to-r from-amber-600 to-red-600 rounded-sm ring-0"
        : "bg-gradient-to-r from-amber-800 to-red-800 ring-amber-700 hover:ring hover:ring-amber-600"
    }`;

  if (
    info?.position == "Superintendent" ||
    info?.position == "Investor Metrics Specialist"
  )
    theme = `${
      selected
        ? "bg-gradient-to-r from-blue-600 to-purple-600 rounded-sm ring-0"
        : "bg-gradient-to-r from-blue-800 to-purple-800 ring-blue-700 hover:ring hover:ring-blue-600"
    }`;

  const created = new Date(info?.createdAt || 0);
  const lastReview = new Date(info?.lastReviewDate || info?.createdAt || 0);

  const wageNumber = Number(info?.wage);
  const burdenNumber = Number(info?.burden);

  return (
    <>
      <div className="h-full w-full">
        {/* <Handle type="target" position={Position.Bottom} id={"fanfan"} /> */}
        <div
          className={`flex h-full w-full cursor-move rounded-lg px-1 text-zinc-100 ${
            info ? "ring-2" : ""
          } transition duration-200 ${theme} `}
        >
          <div ref={animationParent1} className="cursor h-24 w-72">
            {isLoading || !crewData || !data || !info || error ? (
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
                  editURL={`/crewmember/${data.id}`}
                  trigger={
                    <button className="fixed bottom-0 right-0 z-10 h-6 w-6 -translate-x-1 -translate-y-1 text-white/20">
                      <UserCircleIcon />
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
                            <UserCircleIcon className="h-12 w-12" />
                          </div>
                          <div className="flex flex-col">
                            <div>
                              <div className="text-lg font-semibold">
                                {info.name}
                              </div>
                              <div className="truncate text-ellipsis italic tracking-tight text-zinc-300">
                                {info.position}
                              </div>
                            </div>
                            <div className="max-h-[5rem] w-full">
                              {info.tags && (
                                <TagBubblesHandler
                                  tags={info.tags}
                                  mode={"crew"}
                                  crew={info}
                                />
                              )}
                            </div>
                            <div>
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
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex w-full justify-between gap-1 border-t border-zinc-700 pt-1">
                        <div className="text-zinc-300">
                          {info.rating && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Rating
                                </span>{" "}
                                {info.rating}
                              </div>
                            </div>
                          )}
                          {!info.rating && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Rating
                                </span>{" "}
                                (unrated)
                              </div>
                            </div>
                          )}

                          {(info.createdAt || info.lastReviewDate) && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Joined
                                </span>{" "}
                                {created ? created.toDateString() : "unknown"}
                              </div>
                            </div>
                          )}

                          {info.lastReviewDate && (
                            <div className="text-sm">
                              <span className="font-thin text-zinc-400">
                                Last Review
                              </span>{" "}
                              {lastReview
                                ? lastReview.toDateString()
                                : "unknown"}
                            </div>
                          )}
                        </div>
                        <div className="text-zinc-300">
                          {/* {data.travel && data.travel === "true" && (
                           <div className="flex items-center gap-2">
                             <PaperAirplaneIcon className="h-4 w-4" />
                           </div>
                         )} 
                         {!data.travel ||
                           (data.travel !== "true" && (
                             <div className="text-sm">
                               <span className="font-thin text-zinc-400">Travel?</span>{" "}
                               No
                             </div>
                           ))} */}
                          {wageNumber != 0 && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Wage
                                </span>{" "}
                                ${wageNumber.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {burdenNumber != 0 && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Burden
                                </span>{" "}
                                ${burdenNumber.toLocaleString()}
                              </div>
                            </div>
                          )}
                          {info.medicalCardExpDate && (
                            <div className="flex items-center gap-2">
                              <div className="text-sm">
                                <span className="font-thin text-zinc-400">
                                  Med Card Exp.
                                </span>{" "}
                                {info.medicalCardExpDate.toLocaleDateString()}
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
                      {info.position}
                    </p>
                    <TagBubblesHandler
                      tags={info.tags}
                      mode={"crew"}
                      crew={info}
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

export default memo(CrewNode);
