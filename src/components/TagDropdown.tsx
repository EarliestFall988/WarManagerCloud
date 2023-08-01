import type { Sector, Tag } from "@prisma/client";
import { type ReactNode, useCallback, useMemo, useEffect } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Select, { type MultiValue } from "react-select";
import TooltipComponent from "./Tooltip";
import Link from "next/link";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/solid";
import * as Popover from "@radix-ui/react-popover";

import { useState } from "react";

export type DropdownTagType = {
    value: string;
    label: string;
    color: string;
};

let tags = [] as DropdownTagType[];
let selectedTags = [] as DropdownTagType[];

export const TagsMultiselectDropdown: React.FC<{
    savedTags: Tag[];
    savedSectors?: Sector[];
    type: "projects" | "crews" | "blueprints" | "projects and sectors" | "crews and sectors";
    onSetTags: (tags: Tag[]) => void;
    onSetSectors?: (sectors: Sector[]) => void;
}> = ({ savedTags, savedSectors, type, onSetTags, onSetSectors }) => {
    const { data: sectors } = api.sectors.getByName.useQuery({ name: "" });
    const [canUseSectors, setCanUseSectors] = useState(false);
    const [tagType, setTagType] = useState("projects");

    useEffect(() => {
        if (type === "projects and sectors") {
            setTagType("projects");
            setCanUseSectors(true);
        } else if (type === "crews and sectors") {
            setTagType("crews");
            setCanUseSectors(true);
        }
        else {
            setTagType(type);
        }
    }, [type]);

    const {
        data: allTags,
        isLoading,
        isError,
    } = api.tags.getTagsToAdd.useQuery({ type: tagType });

    useMemo(() => {
        tags = [];
        selectedTags = [];

        const tagData = allTags?.map((tag) => {
            return {
                value: tag.id,
                label: tag.name,
                color: tag.backgroundColor,
            };
        });

        const selectedTagData = allTags
            ?.filter((tag) => {
                return savedTags?.find((savedTag) => savedTag.id === tag.id);
            })
            .map((tag) => {
                return {
                    value: tag.id,
                    label: tag.name,
                    color: tag.backgroundColor,
                };
            });

        if (sectors && sectors.length > 0 && canUseSectors) {
            const sectorData = sectors?.map((sector) => {
                return {
                    value: "s:" + sector.id,
                    label: "🏢 " + sector.name,
                    color: "#eee",
                };
            });

            tags.push(...(sectorData || []));
        }

        const selectedSectorData = sectors
            ?.filter((sector) => {
                return savedSectors?.find((saved) => saved.id === sector.id);
            })
            .map((sector) => {
                return {
                    value: "s:" + sector.id,
                    label: "🏢 " + sector.name,
                    color: "#eee",
                };
            });

        // console.log(selectedSectorData);

        selectedTags.push(...(selectedSectorData || []));

        // console.log("saved tags", savedTags);
        // console.log("selected tag data", selectedTagData);

        selectedTags.push(...(selectedTagData || []));
        tags.push(...(tagData || []));
    }, [allTags, savedTags, sectors, canUseSectors, savedSectors]);

    const onChange = useCallback(
        (
            e: MultiValue<{
                value: string;
                label: string;
                color: string;
            }>
        ) => {
            const tags = [] as Tag[];
            const sectorResult = [] as Sector[];

            if (!allTags) return;

            e.forEach((tg) => {
                // console.log(tg);

                if (tg?.value !== undefined && tg?.value.startsWith("s:")) {
                    const sector = sectors?.find(
                        (s) => s.id === tg.value.replace("s:", "")
                    );

                    if (sector) {
                        sectorResult.push(sector);
                    }
                }

                const tag = allTags.find((t) => t.id === tg.value);

                if (tag) {
                    tags.push(tag);
                }
            });

            onSetTags(tags);
            if (onSetSectors) onSetSectors(sectorResult);
        },
        [allTags, onSetTags, sectors, onSetSectors]
    );

    if (isLoading) {
        return (
            <div className="w-full">
                {" "}
                <LoadingSpinner />
            </div>
        );
    }

    if (isError) {
        return <p>Error</p>;
    }

    return (
        <div className="flex w-full gap-1 text-zinc-800 ">
            <Select
                closeMenuOnSelect={false}
                defaultValue={selectedTags}
                isMulti
                name="currentTags"
                options={tags}
                classNamePrefix="select"
                className="w-full rounded bg-zinc-800 text-zinc-300 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
                onChange={(e) => {
                    onChange(e);
                }}
                unstyled
                placeholder="Add Tags..."
                styles={{
                    option: (provided, state) => ({
                        color: state.data.color,
                        borderWidth: state.data.color === "#eee" ? "0" : "1px",
                        borderColor: state.data.color,
                        borderRadius: "1rem",
                        marginTop: "0.125rem",
                        marginBottom: "0.125rem",
                        padding: "0.125rem 0.5rem",
                    }),
                    multiValue: (provided, state) => ({
                        color: state.data.color,
                        borderWidth: state.data.color === "#eee" ? "1px" : "1px",
                        borderColor: state.data.color,
                        borderRadius: "1rem",
                        padding: "0.125rem 0.5rem",
                    }),
                }}
                classNames={{
                    valueContainer(props) {
                        return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${props.selectProps.classNamePrefix
                                ? props.selectProps.classNamePrefix + "-value-container"
                                : ""
                            }`;
                    },
                    multiValue() {
                        return `text-zinc-300 border border-zinc-300 px-2 rounded-xl px-1 flex items-center text-sm`;
                    },
                    container({ isFocused }) {
                        return `w-full bg-zinc-800 rounded ${isFocused
                                ? "ring-2 ring-amber-700"
                                : "hover:ring-zinc-600 hover:ring-2"
                            } `;
                    },
                    menuList() {
                        return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
                    },
                    option() {
                        return `hover:bg-zinc-700 hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
                    },
                }}
            />
            <TooltipComponent content="Tags..." side="bottom">
                <Link
                    className="flex w-6 items-center justify-center rounded bg-zinc-700 p-2 text-zinc-100 hover:bg-zinc-600"
                    href="/tags"
                >
                    <TagIcon className="h-5 w-5 cursor-pointer" />
                </Link>
            </TooltipComponent>
        </div>
    );
};

export const TagsPopover: React.FC<{
    savedTags: Tag[];
    savedSectors?: Sector[];
    type: "projects" | "crews" | "blueprints" | "projects and sectors" | "crews and sectors";
    onSetTags: (tags: Tag[]) => void;
    onSetSectors?: (sectors: Sector[]) => void;
    children: ReactNode;
}> = ({ savedTags, savedSectors, type, onSetTags, onSetSectors, children }) => {
    return (
        <Popover.Root>
            <Popover.Trigger asChild>{children}</Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="fade-y flex w-[20rem] gap-2 rounded border border-zinc-500 bg-black/40 p-2 drop-shadow-xl backdrop-blur-sm md:w-[40rem]">
                    <TagsMultiselectDropdown
                        savedTags={savedTags}
                        savedSectors={savedSectors}
                        type={type}
                        onSetTags={onSetTags}
                        onSetSectors={(data) => {
                            if (onSetSectors) {
                                onSetSectors(data);
                            }
                        }}
                    />
                    <Popover.Close>
                        <XMarkIcon className="h-5 w-5 cursor-pointer hover:text-red-500" />
                    </Popover.Close>
                    <Popover.Arrow className="fill-current text-zinc-500" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};
