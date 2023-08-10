import {
  IdentificationIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";

// import * as HoverCard from "@radix-ui/react-hover-card";
import HoverCardComponent from "./HoverCard";
// import type { Tag } from "@prisma/client";
import { TagBubble } from "./TagComponent";

import useLiveData from "~/flow/databank";
import { LoadingSpinner } from "./loading";

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
  const { crewData, isLoading } = useLiveData();

  const info = crewData.find((crew) => crew.id == data.id);

  if (!data || isLoading) return <LoadingSpinner />;

  if (!info) return <div>err</div>;

  if (typeof selected !== "boolean") return <>err</>;

  let theme =
    "flex h-full w-full rounded-sm bg-zinc-700 px-1 text-zinc-100 border border-transparent hover:border-amber-800 transition-all duration-100 cursor-move ";

  if (info.position.includes("Foreman"))
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-amber-700 to-red-700 px-1 text-zinc-100 transition-all border border-transparent hover:border-white duration-100 cursor-move";

  if (info.position == "Superintendent")
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-purple-700 to-blue-700 px-1 text-zinc-100 transition-all duration-100 cursor-move";

  const created = new Date(info.createdAt);
  const lastReview = new Date(info.lastReviewDate || info.createdAt);

  const wageNumber = Number(info.wage);
  const burdenNumber = Number(info.burden);

  return (
    <>
      <div className="h-full w-full">
        {/* <Handle type="target" position={Position.Bottom} id={"fanfan"} /> */}
        <div className={theme}>
          <div className="h-10 w-32">
            <HoverCardComponent
              editURL={`/crewmember/${data.id}`}
              trigger={
                <button className="fixed bottom-0 right-0 z-10 h-3 w-3 -translate-x-1 -translate-y-1 text-white/20">
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
                            <div className="flex w-full flex-wrap gap-1">
                              {info.tags.map((tag) => (
                                <TagBubble
                                  key={tag.id}
                                  tag={tag}
                                  style="text-xs"
                                />
                              ))}
                              {info.medicalCardExpDate &&
                                info.medicalCardExpDate > new Date() &&
                                info.medicalCardSignedDate && (
                                  <TagBubble
                                    tag={{
                                      authorId: "sys",
                                      createdAt: new Date(),
                                      id: Math.random().toString(36),
                                      type: "crew",
                                      updatedAt: new Date(),
                                      description: `${
                                        info.name
                                      } has a valid medical card on file. (Expires: ${info.medicalCardExpDate.toLocaleDateString()}).`,
                                      name: "Medical Card",
                                      backgroundColor: "#77ee77",
                                      systemTag: false,
                                    }}
                                    style="text-xs"
                                  />
                                )}
                            </div>
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
                          {lastReview ? lastReview.toDateString() : "unknown"}
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
                      {wageNumber != 0 && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm">
                            <span className="font-thin text-zinc-400">
                              Burden
                            </span>{" "}
                            ${burdenNumber.toLocaleString()}
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
                            <p className="font-thin text-zinc-400">Notes </p>
                            <p> {info.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              }
            />
            <p className="text-[0.55rem]">{info.name}</p>

            {info.tags && (
              <div className="flex flex-wrap gap-[2px] rounded">
                <p className="text-[0.4rem] tracking-tight text-white/70">
                  {info.position}
                </p>
                {info.tags.map((tag) => (
                  <TagBubble
                    key={tag.id}
                    tag={tag}
                    style="text-[0.3rem] bg-zinc-900"
                    tooltipDelayDuration={500}
                  />
                ))}
                {info.medicalCardExpDate &&
                  info.medicalCardExpDate > new Date() &&
                  info.medicalCardSignedDate && (
                    <TagBubble
                      tag={{
                        authorId: "sys",
                        createdAt: new Date(),
                        id: Math.random().toString(36),
                        type: "crew",
                        updatedAt: new Date(),
                        description: `${
                          info.name
                        } has a valid medical card on file. (Expires: ${info.medicalCardExpDate.toLocaleDateString()}).`,
                        name: "Medical Card",
                        backgroundColor: "#77ee77",
                        systemTag: false,
                      }}
                      style="fade-y-long bg-zinc-900 text-[0.3rem] hover:text-[0.31rem] duration-200 transition"
                    />
                  )}
              </div>
            )}
          </div>
        </div>
        <NodeResizer
          color="#ff5555"
          isVisible={selected}
          minWidth={100}
          minHeight={30}
        />
        {/* <Handle type="source" position={Position.Top} id={"fanfan"} /> */}
      </div>
    </>
  );
};

export default memo(CrewNode);
