import type { Tag } from "@prisma/client";
import { type ReactNode, useCallback, useMemo } from "react";
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";
import Select, { type MultiValue } from "react-select";
import TooltipComponent from "./Tooltip";
import Link from "next/link";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/solid";
import * as Popover from '@radix-ui/react-popover';

let tags = [] as { value: string; label: string }[];
let selectedTags = [] as { value: string; label: string }[];

export const TagsMultiselectDropdown: React.FC<{ savedTags: Tag[], type: "projects" | "crews" | "blueprints", onSetTags: (tags: Tag[]) => void }> = ({ savedTags, type, onSetTags }) => {

    const { data: allTags, isLoading, isError } = api.tags.getTagsToAdd.useQuery({ type });


    useMemo(() => {

        tags = [];
        selectedTags = [];

        const tagData = allTags?.map((tag) => {
            return {
                value: tag.id,
                label: tag.name,
            };
        });

        // console.log("tag data", tagData);

        const selectedTagData = allTags?.filter((tag) => {
            return savedTags?.find((savedTag) => savedTag.id === tag.id);
        }).map((tag) => {
            return {
                value: tag.id,
                label: tag.name,
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
        <div className="flex gap-1 w-full text-zinc-800">
            <Select
                closeMenuOnSelect={false}
                defaultValue={selectedTags}
                isMulti
                name="currentTags"
                options={tags}
                classNamePrefix="select"
                className="w-full rounded outline-none"
                onChange={(e) => { onChange(e) }}
            />
            <TooltipComponent content="Edit Tags..." side="bottom">
                <Link className="flex items-center justify-center rounded bg-zinc-100 text-amber-700 p-2 hover:bg-zinc-50 border" href="/tags">
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
                <Popover.Content className="flex gap-2 fade-y w-[40rem] bg-black/40 backdrop-blur-sm p-2 drop-shadow-xl rounded border border-zinc-500">
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

