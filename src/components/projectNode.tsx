import { WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";
import HoverCardComponent from "./HoverCard";

interface crewNodeInput {
  data: {
    name: string;
    description: string;
    address: string;
    city: string;
    state: string;
    jobNumber: string;
    status: string;
    startDate: string;
    endDate: string;

    lastUpdated: string;
    totalCost: string;
  };
  selected: boolean;
}

const CrewNode = ({ data, selected }: crewNodeInput) => {
  if (!data) return <>err</>;

  if (typeof selected !== "boolean") return <>err</>;

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  return (
    <>
      <HoverCardComponent
        trigger={
          <div className="h-full w-full">
            <div className="flex h-full w-full cursor-move rounded-sm border-b-2 border-amber-700 bg-zinc-700 px-1 text-zinc-100 transition-all duration-100 hover:bg-zinc-600">
              <div className="h-full w-full">
                <WrenchScrewdriverIcon className="fixed bottom-0 right-0 z-10 h-3 w-3 -translate-x-1 -translate-y-1 text-amber-600/40" />
                <p className="z-30 w-full truncate text-[0.55rem]">
                  {data.name}
                </p>
                <p className="z-30 text-[0.5rem] italic tracking-tight text-white/70">
                  {data.status}
                </p>
              </div>
            </div>

            <NodeResizer
              color="#ff5555"
              isVisible={selected}
              minWidth={100}
              minHeight={30}
            />
          </div>
        }
        content={
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div className="flex justify-left items-center gap-3 ">
                <WrenchScrewdriverIcon className="h-12 w-12" />
                <div className="pb-5">
                  <div>{data.jobNumber}</div>
                  <div className="text-lg font-semibold">{data.name}</div>
                  <div className="flex truncate text-ellipsis text-sm italic tracking-tight text-zinc-300">
                    <p>
                      {data.address} {data.city}, {data.state}{" "}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-between gap-1 border-t border-zinc-700 text-sm font-normal">
              <div className="text-sm text-zinc-300">
                {data.status && (
                  <p>
                    <span className="font-thin text-zinc-400">Status</span>{" "}
                    {data.status}
                  </p>
                )}
                {(data.startDate || data.endDate) && (
                  <>
                    <p>
                      <span className="font-thin text-zinc-400">
                        Start Date
                      </span>{" "}
                      {startDate.toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-thin text-zinc-400">End Date</span>{" "}
                      {endDate.toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
              <div>
                {data.totalCost && (
                  <p>
                    <span className="font-thin text-zinc-400">Total</span> $
                    {data.totalCost}
                  </p>
                )}
                {!data.totalCost && (
                  <p>
                    <span className="font-thin text-zinc-400">Total</span> $(not
                    included)
                  </p>
                )}
                {data.lastUpdated && (
                  <p>
                    <span className="font-thin text-zinc-400">
                      Last Updated
                    </span>{" "}
                    {data.lastUpdated}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-zinc-700 text-sm text-zinc-300">
              <p className="font-thin text-zinc-400">Comments/Concerns</p>
              <p>{data.description}</p>
            </div>
          </div>
        }
      />
    </>
  );
};

export default memo(CrewNode);
