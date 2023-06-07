import {
  IdentificationIcon,
  PaperAirplaneIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";
import { memo } from "react";
import { NodeResizer } from "reactflow";

// import * as HoverCard from "@radix-ui/react-hover-card";
import HoverCardComponent from "./HoverCard";

interface crewNodeInput {
  data: {
    name: string;
    description: string;
    position: string;
    email: string;
    phone: string;
    rating: number;
    travel: string;
    wage: string;
    burden: string;
    createdAt: string;
    lastReviewDate: string;
  };
  selected: boolean;
}

const CrewNode = ({ data, selected }: crewNodeInput) => {
  if (!data) return <>err</>;

  if (typeof selected !== "boolean") return <>err</>;

  let theme =
    "flex h-full w-full rounded-sm bg-zinc-700 px-1 text-zinc-100 transition-all duration-100 hover:bg-zinc-600 cursor-move ";

  if (data.position.includes("Foreman"))
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-amber-700 to-red-700 px-1 text-zinc-100 transition-all duration-100 cursor-move";

  if (data.position == "Superintendent")
    theme =
      "flex h-full w-full rounded-sm bg-gradient-to-r from-purple-700 to-blue-700 px-1 text-zinc-100 transition-all duration-100 cursor-move";

  const created = new Date(data.createdAt);
  const lastReview = new Date(data.lastReviewDate);

  const wageNumber = Number(data.wage);
  const burdenNumber = Number(data.burden);

  return (
    <>
      <HoverCardComponent
        trigger={
          <div className="w-full h-full">
            {/* <Handle type="target" position={Position.Bottom} id={"fanfan"} /> */}
            <div className={theme}>
              <div className="h-8 w-28">
                <UserCircleIcon className="fixed bottom-0 right-0 z-10 h-3 w-3 -translate-x-1 -translate-y-1 text-white/20" />
                <p className="text-[0.55rem]">{data.name}</p>
                <p className="text-[0.5rem] tracking-tight text-white/70">
                  {data.position}
                </p>
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
        }
        content={
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div className="flex items-center gap-3 pb-3">
                <UserCircleIcon className="h-12 w-12" />
                <div>
                  <div className="text-lg font-semibold">{data.name}</div>
                  <div className="truncate text-ellipsis italic tracking-tight text-zinc-300">
                    {data.position}
                  </div>
                </div>
                <div>
                  {data.email && (
                    <div className="flex items-center gap-2">
                      <IdentificationIcon className="h-4 w-4" />
                      <div className="text-sm">{data.email}</div>
                    </div>
                  )}
                  {data.phone && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="h-4 w-4" />
                      <div className="text-sm">{data.phone}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex w-full justify-between gap-1 border-t border-zinc-700 pt-1">
              <div className="text-zinc-300">
                {data.rating && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-thin text-zinc-400">Rating</span>{" "}
                      {data.rating}
                    </div>
                  </div>
                )}
                {!data.rating && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-thin text-zinc-400">Rating</span>{" "}
                      (unrated)
                    </div>
                  </div>
                )}

                {(data.createdAt || data.lastReviewDate) && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-thin text-zinc-400">Joined</span>{" "}
                      {created.toLocaleDateString()}
                    </div>
                  </div>
                )}

                {data.lastReviewDate && (
                  <div className="text-sm">
                    <span className="font-thin text-zinc-400">Last Review</span>{" "}
                    {lastReview.toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="text-zinc-300">
                {data.travel && data.travel === "true" && (
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
                  ))}
                {wageNumber != 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-thin text-zinc-400">Wage</span> $
                      {wageNumber.toLocaleString()}
                    </div>
                  </div>
                )}
                {wageNumber != 0 && (
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <span className="font-thin text-zinc-400">Burden</span> $
                      {burdenNumber.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex w-full justify-between gap-1 border-t border-zinc-700 pt-1">
              {data.description && (
                <div className="text-zinc-300">
                  <div className="flex items-center gap-2">
                    <div className="text-sm">
                      <p className="font-thin text-zinc-400">Notes </p>
                      <p> {data.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        }
      />
    </>
  );
};

export default memo(CrewNode);
