import {
  ArrowPathRoundedSquareIcon,
  ChevronUpDownIcon,
  CodeBracketSquareIcon,
  DocumentIcon,
  EllipsisVerticalIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { NextPage } from "next";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import TooltipComponent from "~/components/Tooltip";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import type { Tag } from "@prisma/client";
import { SimpleDropDown } from "~/components/dropdown";
import { DialogComponent } from "~/components/dialog";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import Image from "next/image";
dayjs.extend(relativeTime);

const TagWizard: React.FC<{ editTag?: Tag }> = ({ editTag }) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(getRandomColor() || "#000000");

  const context = api.useContext().tags;

  const [nameError, setNameError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const { mutate, isLoading: isSaving } = api.tags.create.useMutation({
    onSuccess: () => {
      toast.success("Tag created successfully!");

      void context.invalidate();

      setName("");
      setType("");
      setDescription("");
      setColor(getRandomColor() || "#000000");
    },
    onError: (error) => {
      const zodErrors = error.shape?.data.zodError;

      if (!zodErrors) {
        if (error.message === "A tag with this name already exists.") {
          toast.error(
            `A tag with the name '${name}' already exists for ${type}.`
          );
        } else {
          toast.error("there was an error creating the tag");
          console.log(error.message);
        }

        return;
      }

      const nameError = zodErrors.fieldErrors["name"];
      console.log(nameError);

      if (nameError && nameError[0]) {
        setNameError(nameError[0]);
        toast.error(nameError[0]);
      }

      const typeError = zodErrors.fieldErrors["type"];
      console.log(typeError);

      if (typeError && typeError[0]) {
        setTypeError(typeError[0]);
        toast.error(typeError[0]);
      }

      const colorError = zodErrors.fieldErrors["color"];
      console.log(colorError);

      if (colorError && colorError[0]) {
        setColorError(colorError[0]);
        toast.error(colorError[0]);
      }

      const descriptionError = zodErrors.fieldErrors["description"];
      console.log(descriptionError);

      if (descriptionError && descriptionError[0]) {
        setDescriptionError(descriptionError[0]);
        toast.error(descriptionError[0]);
      }

      toast.error("there was an error creating the tag");
    },
  });

  const { mutate: deleteTagMutation } = api.tags.delete.useMutation({
    onSuccess: () => {
      toast.success("Tag deleted successfully!");

      void context.invalidate();
    },
    onError: () => {
      toast.error("There was an error deleting the tag.");

      void context.invalidate();
    },
  });

  const deleteTag = React.useCallback(
    (tagId: string) => {
      toast.loading("deleting tag", { duration: 1000 });

      deleteTagMutation({
        id: tagId,
      });
    },
    [deleteTagMutation]
  );

  const { mutate: update, isLoading: isUpdating } = api.tags.update.useMutation(
    {
      onSuccess: () => {
        toast.success("Tag created successfully!");

        void context.invalidate();

        setName("");
        setType("");
        setDescription("");
        setColor(getRandomColor() || "#000000");
      },
      onError: (error) => {
        const zodErrors = error.shape?.data.zodError;

        if (!zodErrors) {
          if (error.message === "A tag with this name already exists.") {
            toast.error(
              `A tag with the name '${name}' already exists for ${type}.`
            );
          } else {
            toast.error("there was an error creating the tag");
            console.log(error.message);
          }

          return;
        }

        const nameError = zodErrors.fieldErrors["name"];
        console.log(nameError);

        if (nameError && nameError[0]) {
          setNameError(nameError[0]);
          toast.error(nameError[0]);
        }

        const typeError = zodErrors.fieldErrors["type"];
        console.log(typeError);

        if (typeError && typeError[0]) {
          setTypeError(typeError[0]);
          toast.error(typeError[0]);
        }

        const colorError = zodErrors.fieldErrors["color"];
        console.log(colorError);

        if (colorError && colorError[0]) {
          setColorError(colorError[0]);
          toast.error(colorError[0]);
        }

        const descriptionError = zodErrors.fieldErrors["description"];
        console.log(descriptionError);

        if (descriptionError && descriptionError[0]) {
          setDescriptionError(descriptionError[0]);
          toast.error(descriptionError[0]);
        }

        toast.error("there was an error creating the tag");
      },
    }
  );

  const loading = isSaving || isUpdating;

  useMemo(() => {
    if (editTag) {
      setName(editTag.name);
      setType(editTag.type);
      setDescription(editTag.description);
      setColor(editTag.backgroundColor);
    } else {
      setName("");
      setType("");
      setDescription("");
      setColor(getRandomColor() || "#000000");
    }
  }, [editTag]);

  const exampleTag = useRef<HTMLDivElement>(null);

  if (exampleTag) {
    exampleTag.current?.style.setProperty("color", color);
    exampleTag.current?.style.setProperty("border", `1px solid ${color}`);
    exampleTag.current?.style.setProperty("border-radius", "1rem");
    exampleTag.current?.style.setProperty("padding-right", "5px");
    exampleTag.current?.style.setProperty("padding-left", "5px");
  }

  const setRandomColor = () => {
    setColor(getRandomColor() || "#000000");
  };

  const setTag = useCallback(() => {
    if (editTag) {
      toast.loading("updating tag", { duration: 1000 });

      console.log("updating tag:", name, type, description, color);

      setNameError(null);
      setTypeError(null);
      setColorError(null);
      setDescriptionError(null);

      update({
        id: editTag.id,
        name,
        type,
        description,
        color,
      });
    } else {
      toast.loading("creating tag", { duration: 1000 });

      setNameError(null);
      setTypeError(null);
      setColorError(null);
      setDescriptionError(null);

      mutate({
        name,
        type,
        description,
        color,
      });
    }
  }, [
    mutate,
    name,
    type,
    description,
    color,
    setNameError,
    setTypeError,
    setColorError,
    setDescriptionError,
    editTag,
    update,
  ]);

  return (
    <div className="fade-y w-full border-b border-zinc-700 p-2">
      <h2 className="select-none py-2 text-2xl font-semibold">
        {editTag ? "Edit Tag" : "Create New Tag"}
      </h2>
      <div className="flex flex-wrap items-start justify-center gap-2    md:justify-start">
        <div className="flex w-full flex-col flex-wrap items-start justify-start gap-2 md:w-1/3">
          <div className="w-full">
            <p>Name</p>
            <input
              className="w-full rounded border border-zinc-500 bg-zinc-700 p-1 outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
              placeholder="tag name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              style={nameError ? { border: "1px solid red" } : {}}
            />
            <p className="text-sm italic text-red-500"> {nameError || ""}</p>
          </div>
          <div className="w-full">
            <p>Description</p>
            <input
              className="w-full rounded border border-zinc-500 bg-zinc-700 p-1 outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
              placeholder="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              style={descriptionError ? { border: "1px solid red" } : {}}
            />
            <p className="text-sm italic text-red-500">
              {descriptionError || ""}
            </p>
          </div>
          <div className="w-full">
            <div className="flex justify-between">
              <p>Category Designation</p>
              <TooltipComponent
                content="Designate where you want the tag to appear. For example if you created a tag called 'travel,' you might want to designate it as a 'crew member' tag so that it appears on the crew member page."
                side="bottom"
              >
                <QuestionMarkCircleIcon className="h-6 w-6 text-zinc-400 transition-all duration-100 hover:scale-105 hover:text-amber-600" />
              </TooltipComponent>
            </div>
            <select
              className="w-full rounded border border-zinc-500 bg-zinc-700 p-1 outline-none transition-all duration-100 selection:bg-zinc-200 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
              placeholder="crew members, etc."
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={loading}
              style={typeError ? { border: "1px solid red" } : {}}
            >
              <option value="">Select a category</option>
              <option value="crews">Crew Members</option>
              <option value="projects">Projects</option>
              <option value="blueprints">Blueprints</option>
            </select>
            <p className="text-sm italic text-red-500"> {typeError || ""}</p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-1 md:w-1/3">
          <div className="flex w-full flex-col items-start">
            <div className="text-white">Color</div>
            <div className="flex w-full gap-2">
              <input
                className={`h-8 w-full rounded border border-zinc-500 bg-zinc-700 px-1 outline-none transition-all duration-100  hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600`}
                value={color}
                type="text"
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                style={colorError ? { border: "1px solid red" } : {}}
              />
              <input
                className="h-8 rounded-sm border border-zinc-500 bg-zinc-700 px-1 outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
                value={color}
                type="color"
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
              />
              <button
                onClick={() => setRandomColor()}
                className="rounded bg-zinc-700 p-1 outline-none transition-all duration-100 hover:bg-amber-700"
                disabled={loading}
              >
                <ArrowPathRoundedSquareIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm italic text-red-500"> {colorError || ""}</p>
          </div>
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded border-zinc-700 p-2 md:border">
            <h2 className="select-none text-lg font-semibold  ">Tag Preview</h2>

            <TooltipComponent
              content={description || "<no description>"}
              side="bottom"
            >
              <div>
                <div className="select-none" ref={exampleTag}>
                  {name || "example tag"}
                </div>
              </div>
            </TooltipComponent>
            <p className="hidden select-none text-sm italic text-zinc-400 md:block">
              tip: Hover over the tag to see the description.
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-between py-2">
        <button
          onClick={() => setTag()}
          disabled={loading}
          className="flex w-full select-none items-center justify-center gap-2 rounded bg-zinc-700 p-2 transition-all duration-100 hover:bg-amber-700 md:w-1/3"
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div>
              {!editTag && (
                <>
                  <p> Create Tag</p>
                </>
              )}
              {editTag && (
                <>
                  <p> Save </p>
                </>
              )}
            </div>
          )}
        </button>{" "}
        {editTag && (
          <DialogComponent
            title="Are you sure you want to delete this tag?"
            description="This action cannot be undone. All items with this tag will be untagged."
            yes={() => {
              deleteTag(editTag.id);
            }}
            trigger={
              <button className="flex w-1/3 select-none items-center justify-center rounded bg-red-500 p-2">
                Delete Tag
              </button>
            }
          />
        )}
      </div>
    </div>
  );
};

type TagType = {
  user:
    | {
        id: string | undefined;
        email: string | undefined;
        profilePicture: string | undefined;
      }
    | undefined
    | null;
} & Tag;

const TagsPage: NextPage = () => {
  const [newPanelOpen, setNewPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const togglePanelOpen = useCallback(() => {
    setNewPanelOpen(!newPanelOpen);
  }, [newPanelOpen, setNewPanelOpen]);

  const [animationParent] = useAutoAnimate();

  const {
    data,
    isLoading: loading,
    isError,
  } = api.tags.search.useQuery({
    name: searchTerm,
  });

  //   const loading = true;

  return (
    <main
      ref={animationParent}
      className="min-h-[100vh] overflow-x-hidden bg-zinc-900"
    >
      <NewItemPageHeader title="Tags" />
      <div className="flex gap-2 border-b border-zinc-700 p-2">
        <input
          type="text"
          className="w-full rounded-md border border-zinc-600 bg-zinc-800 p-2 text-white outline-none transition-all duration-100 hover:bg-zinc-700 focus:ring-1 focus:ring-amber-600"
          placeholder="Search for a tag"
          autoFocus
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <TooltipComponent content="Toggle new tag panel" side="bottom">
          <button onClick={togglePanelOpen} className="rounded bg-zinc-700 p-2">
            {!newPanelOpen ? (
              <PlusIcon className="h-5 w-5" />
            ) : (
              <ChevronUpDownIcon className="h-5 w-5" />
            )}
          </button>
        </TooltipComponent>
      </div>
      {newPanelOpen && <TagWizard />}
      <div className="m-auto w-full md:border-x border-zinc-700 md:w-11/12">
        <h2 className=" select-none border-b border-zinc-700 p-2 text-2xl font-semibold">
          Tags
        </h2>
        {loading && (
          <div className="flex h-20 w-full items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {isError && (
          <div className="flex h-20 w-full items-center justify-center">
            <div className="text-white">Error loading tags</div>
          </div>
        )}
        <div className="flex flex-col gap-1">
          {data?.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      </div>
    </main>
  );
};

const TagCard: React.FC<{ tag: TagType }> = ({ tag }) => {
  return (
    <div className="flex select-none  justify-between gap-2 border-b border-zinc-700 p-2">
      <div className="flex w-1/4 items-center justify-start gap-2">
        <div className="flex items-center gap-2"></div>
        <div>
          <div className="flex items-center gap-2 py-1">
            <div
              className="-ml-2 rounded-full border px-2 font-semibold"
              style={{
                color: tag.backgroundColor || "#000",
                borderColor: tag.backgroundColor || "#000",
              }}
            >
              {tag.name}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {tag.type && tag.type === "crews" && (
              <UserCircleIcon className={`h-6 w-6`} />
            )}
            {tag.type && tag.type === "projects" && (
              <WrenchScrewdriverIcon className={`h-6 w-6`} />
            )}
            {tag.type && tag.type === "blueprints" && (
              <DocumentIcon className={`h-6 w-6`} />
            )}
            {tag.description && tag.type && (
              <p className="text-sm text-zinc-300">•</p>
            )}
            <p className="text-sm text-zinc-300">{tag.description}</p>
          </div>
        </div>
      </div>
      <div className="flex w-1/4 items-center justify-start gap-1">
        <div className="hidden items-center justify-start gap-1 md:flex">
          {tag.user ? (
            <div className="flex items-center gap-2">
              <Image
                src={tag.user.profilePicture || ""}
                alt={`${tag.user.email || "unknown"}\'s profile picture.`}
                width={30}
                height={30}
                className="rounded-full"
              />
              <p className="text-sm text-zinc-300"> {tag.user?.email}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              <CodeBracketSquareIcon className="h-7 w-7 text-amber-600" />
              <p>War Manager Tag</p>
            </div>
          )}

          {/* <TagOptions /> */}
        </div>
      </div>
      <div className="flex items-center justify-center">
        <p className="hidden text-sm text-zinc-300 md:block">
          {/* {" • "} */}
          {dayjs(tag.updatedAt || tag.createdAt).fromNow()}
        </p>
        <SimpleDropDown
          trigger={
            <button className="flex items-center justify-center p-2">
              <EllipsisVerticalIcon className="h-6 w-6 text-zinc-100" />
            </button>
          }
        >
          <TagOptions tag={tag} />
        </SimpleDropDown>
      </div>
    </div>
  );
};

const TagOptions: React.FC<{ tag: Tag }> = ({ tag }) => {
  if (tag.systemTag) {
    return (
      <div>
        Unfortunately you cannot edit this tag as it is managed by War Manager.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start justify-start gap-1">
      <TagWizard editTag={tag} />
      <TooltipComponent content="Delete tag" side="bottom">
        {/* <button className="rounded bg-zinc-700 p-2 hover:bg-amber-700">
          <TrashIcon className="h-5 w-5" />
        </button> */}
      </TooltipComponent>
    </div>
  );
};

const getRandomColor = () => {
  const [sat, lightness] = [0.6, 0.8];
  for (let i = 0; i < 12; i++) {
    const hue = Math.random();
    const result = hslToRgb(hue, sat, lightness);
    return result;
  }
};

const hslToRgb = (h: number, s: number, l: number) => {
  let r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    function hue2rgb(p: number, q: number, t: number) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return (
    "#" +
    [r * 255, g * 255, b * 255].map((c) => Math.floor(c).toString(16)).join("")
  );
};

export default TagsPage;
