import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { type Dispatch, type SetStateAction, memo, useCallback, useEffect, useState } from "react";
import { NodeResizer } from "reactflow";
import * as Popover from '@radix-ui/react-popover';
import { api } from "~/utils/api";
import { LoadingSpinner } from "./loading";

type NoteInput = {
    data: {
        id: string;
        name: string;
        description: string;
        blueprintId: string;
    },
    selected: boolean;

}

const NoteNode = ({ data, selected }: NoteInput) => {


    const [loading, setLoading] = useState(false);

    if (!data) return <>err</>;

    if (typeof selected !== "boolean") return <>err</>;

    const theme =
        "flex h-full w-full rounded bg-yellow-300 px-1 text-zinc-700 transition-all duration-100 hover:bg-yellow-200 cursor-move ";



    return (

        <div className="h-full w-full">
            <NodeResizer
                color="#ff5555"
                isVisible={selected}
                minWidth={100}
                minHeight={30}
            />
            <EditNoteDialog props={{ data, selected }} setLoading={setLoading} />
            <div className={theme}>
                <div className="h-8 w-28">
                    {loading ? (
                        <div className="h-full w-full flex justify-center items-center">
                            <div className="scale-50">
                                <LoadingSpinner />
                            </div>
                        </div>
                    ) : (
                        <>
                            <p className="text-[0.55rem] font-semibold">{data.name}</p>
                            <p className="text-[0.45rem] tracking-tight">
                                {data.description}
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};


const EditNoteDialog: React.FC<{ props: NoteInput, setLoading: Dispatch<SetStateAction<boolean>> }> = ({ props, setLoading }) => {


    console.log("editNoteDialog", props)

    const [title, setTitle] = useState(props.data.name);
    const [description, setDescription] = useState(props.data.description);

    const { mutate, isLoading } = api.notes.upsert.useMutation(
        {
            onSuccess: () => {
                console.log("success");
            },
            onError: (err) => {
                console.log(err);
            }
        }
    )

    useEffect(() => {
        isLoading ? setLoading(true) : setLoading(false)
    }, [isLoading, setLoading])

    const SaveChanges = useCallback(() => {
        mutate({
            blueprintId: props.data.blueprintId, //this is not right
            title: title,
            text: description,
            id: props.data.id,
        })
    }, [mutate, title, description, props.data.blueprintId, props.data.id])

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <div className="absolute top-0 right-0 h-3 w-3">
                    <PencilSquareIcon className="h-full w-full text-zinc-700 hover:text-zinc-500 cursor-pointer" />
                </div>
            </Popover.Trigger>
            <Popover.Content sideOffset={4} align="center" className="border-zinc-500 p-1 pt-0 bg-black/90 border rounded drop-shadow-lg">
                <div className="flex flex-col gap-1">
                    <div className="w-full">
                        <p className="text-zinc-300 text-[0.55em] translate-y-2 font-semibold">Title</p>
                        <input type="text" autoFocus value={title} onChange={(e) => { setTitle(e.currentTarget.value) }} className="text-[0.50rem] rounded px-1 bg-zinc-800 outline-none focus:ring-1 focus:ring-amber-700" />
                    </div>
                    <div className="w-full">
                        <p className="text-zinc-300 text-[0.55em] font-semibold">Note</p>
                        <textarea value={description} onChange={(e) => { setDescription(e.currentTarget.value) }} className="text-[0.45rem] w-full tracking-tight rounded p-1 text-zinc-300 bg-zinc-800 outline-none focus:ring-1 focus:ring-amber-700" />

                    </div>
                    <Popover.Close className="text-zinc-500 text-[0.55rem] hover:text-zinc-300 cursor-pointer" asChild >
                        <button onClick={() => { SaveChanges() }} className="bg-amber-700 rounded">
                            <p className="text-white">Save</p>
                        </button>
                    </Popover.Close>

                    <Popover.Arrow className="fill-current text-zinc-500"
                    />
                </div>
            </Popover.Content>
        </Popover.Root>
    )
}

export default memo(NoteNode);
