import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";
import HoverCardComponent from "./HoverCard";
import { TagBubble } from "./TagComponent";

import useLiveData from "~/flow/databank";
import { LoadingSpinner } from "./loading";

interface IProjectInput {
  data: {
    id: string;
  };
  selected: boolean;
}

// name: string;
//     description: string;
//     address: string;
//     city: string;
//     state: string;
//     jobNumber: string;
//     status: string;
//     startDate: string;
//     endDate: string;

//     lastUpdated: string;
//     totalCost: string;
//     tags: Tag[];

const ProjectNode = ({ data, selected }: IProjectInput) => {
  const { projectData, isLoading } = useLiveData();

  const info = projectData.find((node) => node.id == data.id);

  if (!data || isLoading) return <LoadingSpinner />;

  if (!info) return <div className="rounded-sm bg-red-500/30 p-2">err</div>;

  if (typeof selected !== "boolean") return <>err</>;

  const startDate = new Date(info.startDate);
  const endDate = new Date(info.endDate);

  const updated = new Date(info.updatedAt || info.createdAt);
  // const created = new Date(info.createdAt);

  const total =
    info.otherCost +
    info.laborCost +
    info.materialCost +
    info.equipmentCost +
    info.subContractorCost;

  return (
    <>
      <div className="h-full w-full">
        <div className="flex h-full w-full cursor-move rounded-lg bg-zinc-700 px-1 text-zinc-100 ring-2 ring-zinc-700 transition-all duration-100 hover:ring hover:ring-zinc-700">
          <div className="h-16 w-72">
            <HoverCardComponent
              editURL={`/projects/${data.id}`}
              trigger={
                <button className="fixed bottom-0 right-0 z-10 h-6 w-6 -translate-x-1 -translate-y-1 text-amber-600/40">
                  <WrenchScrewdriverIcon />
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
                    <div className="flex items-center justify-start gap-3 ">
                      <div className="">
                        <WrenchScrewdriverIcon className="h-12 w-12" />
                      </div>
                      <div className="pb-2">
                        <div>{info.jobNumber}</div>
                        <div className="text-lg font-semibold">{info.name}</div>
                        <div className="flex truncate text-ellipsis text-sm italic tracking-tight text-zinc-300">
                          <p>
                            {info.address} {info.city}, {info.state}
                          </p>
                        </div>
                        {info.tags && (
                          <div className="flex w-[15vw] flex-wrap gap-1">
                            {info.tags.map((tag) => (
                              <TagBubble
                                key={tag.id}
                                tag={tag}
                                style="text-xs"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between gap-1 border-t border-zinc-700 text-sm font-normal">
                    <div className="text-sm text-zinc-300">
                      {info.status && (
                        <p>
                          <span className="font-thin text-zinc-400">
                            Status
                          </span>{" "}
                          {info.status}
                        </p>
                      )}
                      {(info.startDate || info.endDate) && (
                        <>
                          <p>
                            <span className="font-thin text-zinc-400">
                              Start Date
                            </span>{" "}
                            {startDate.toLocaleDateString()}
                          </p>
                          <p>
                            <span className="font-thin text-zinc-400">
                              End Date
                            </span>{" "}
                            {endDate.toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      {total && (
                        <p>
                          <span className="font-thin text-zinc-400">Total</span>{" "}
                          ${total}
                        </p>
                      )}
                      {/* {!info.totalCost && (
                          <p>
                            <span className="font-thin text-zinc-400">Total</span> $(not
                            included)
                          </p>
                        )} */}
                      {info.updatedAt && (
                        <p>
                          <span className="font-thin text-zinc-400">
                            Last Updated
                          </span>{" "}
                          {updated.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-zinc-700 text-sm text-zinc-300">
                    <p className="font-thin text-zinc-400">Comments/Concerns</p>
                    <p>{info.description}</p>
                  </div>
                </div>
              }
            />
            <p className="z-30 w-full truncate text-lg font-semibold">
              {info.name}
            </p>
            {info.tags && (
              <div className="flex flex-wrap items-center justify-start gap-2 rounded">
                {info.city && info.state && (
                  <p className="z-30 italic tracking-tight text-white/70">
                    {info.city}, {info.state}
                  </p>
                )}
                {info.tags.map((tag) => (
                  <TagBubble
                    key={tag.id}
                    tag={tag}
                    style="text-[0.3rem] bg-zinc-900"
                    tooltipDelayDuration={500}
                  />
                ))}
              </div>
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
      </div>
    </>
  );
};

export default memo(ProjectNode);
