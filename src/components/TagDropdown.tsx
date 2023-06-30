import type { Tag } from "@prisma/client";
import { type ReactNode, useCallback, useMemo } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Select, { type MultiValue } from "react-select";
import TooltipComponent from "./Tooltip";
import Link from "next/link";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/solid";
import * as Popover from '@radix-ui/react-popover';

let tags = [] as { value: string; label: string, color: string }[];
let selectedTags = [] as { value: string; label: string, color: string }[];

export const TagsMultiselectDropdown: React.FC<{ savedTags: Tag[], type: "projects" | "crews" | "blueprints", onSetTags: (tags: Tag[]) => void }> = ({ savedTags, type, onSetTags }) => {

    const { data: allTags, isLoading, isError } = api.tags.getTagsToAdd.useQuery({ type });


    useMemo(() => {

        tags = [];
        selectedTags = [];

        const tagData = allTags?.map((tag) => {
            return {
                value: tag.id,
                label: tag.name,
                color: tag.backgroundColor
            };
        });

        // console.log("tag data", tagData);

        const selectedTagData = allTags?.filter((tag) => {
            return savedTags?.find((savedTag) => savedTag.id === tag.id);
        }).map((tag) => {
            return {
                value: tag.id,
                label: tag.name,
                color: tag.backgroundColor
            };
        });

        // console.log("saved tags", savedTags);
        // console.log("selected tag data", selectedTagData);

        selectedTags.push(...selectedTagData || []);
        tags.push(...tagData || []);

    }, [allTags, savedTags]);

    const onChange = useCallback((e: MultiValue<{
        value: string;
        label: string;
        color: string;
    }>) => {

        const tags = [] as Tag[]

        if (!allTags) return;

        e.forEach((tg) => {
            const tag = allTags.find((t) => t.id === tg.value);

            if (tag) {
                tags.push(tag);
            }
        });

        onSetTags(tags);

    }, [allTags, onSetTags]);


    if (isLoading) {
        return <div className="w-full" > <LoadingSpinner /></div>;
    }

    if (isError) {
        return <p>Error</p>;
    }


    return (
        <div className="flex gap-1 w-full text-zinc-800 ">
            <Select
                closeMenuOnSelect={false}
                defaultValue={selectedTags}
                isMulti
                name="currentTags"
                options={tags}
                classNamePrefix="select"
                className="w-full ring-2 ring-zinc-700 rounded outline-none hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 duration-100 transition-all focus:ring-2 focus:ring-amber-700 bg-zinc-800 text-zinc-300"
                onChange={(e) => { onChange(e) }}
                unstyled
                placeholder="Add Tags..."
                classNames={{
                    valueContainer(props) {
                        return `flex flex-wrap p-2 bg-zinc-800 rounded-l focus:bg-red-500 gap-1 ${props.selectProps.classNamePrefix ? props.selectProps.classNamePrefix + "-value-container" : ""}`;
                    },
                    multiValue({ data }) {
                        return `text-zinc-300 border border-zinc-300 px-2 rounded-xl px-1 flex items-center text-sm`;
                    },
                    container({ isFocused }) {
                        return `w-full bg-zinc-800 rounded ${isFocused ? "ring-2 ring-amber-700" : "hover:ring-zinc-600 hover:ring-2"} `;
                    },
                    menuList(props) {
                        return `bg-zinc-900 rounded text-zinc-200 p-1 border-2 border-zinc-500`;
                    },
                    option({ data }) {
                        return `hover:bg-zinc-700 hover:text-zinc-100 cursor-pointer rounded p-2 md:p-1`;
                    }
                }}
            />
            <TooltipComponent content="Tags..." side="bottom">
                <Link className="flex items-center w-6 justify-center rounded bg-zinc-700 text-zinc-100 p-2 hover:bg-zinc-600" href="/tags">
                    <TagIcon className="w-5 h-5 cursor-pointer" />
                </Link>
            </TooltipComponent>
        </div>
    );
}

export const TagsPopover: React.FC<{ savedTags: Tag[], type: "projects" | "crews" | "blueprints", onSetTags: (tags: Tag[]) => void, children: ReactNode }> = ({ savedTags, type, onSetTags, children }) => {

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className="flex w-[20rem] md:w-[40rem] gap-2 fade-y bg-black/40 backdrop-blur-sm p-2 drop-shadow-xl rounded border border-zinc-500">
                    <TagsMultiselectDropdown savedTags={savedTags} type={type} onSetTags={onSetTags} />
                    <Popover.Close >
                        <XMarkIcon className="w-5 h-5 cursor-pointer hover:text-red-500" />
                    </Popover.Close>
                    <Popover.Arrow className="fill-current text-zinc-500" />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
}

