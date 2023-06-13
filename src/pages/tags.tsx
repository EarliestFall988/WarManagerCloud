import {
  ArrowPathRoundedSquareIcon,
  ChevronUpDownIcon,
  DocumentIcon,
  PencilIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
  TagIcon,
  TrashIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import type { NextPage } from "next";
import { useCallback, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import TooltipComponent from "~/components/Tooltip";
import { LoadingSpinner } from "~/components/loading";
import { api } from "~/utils/api";

import relativeTime from "dayjs/plugin/relativeTime";
import type { Tag } from "@prisma/client";
dayjs.extend(relativeTime);

const NewTagWizard = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(getRandomColor() || "#000000");

  const context = api.useContext().tags;

  const [nameError, setNameError] = useState<string | null>(null);
  const [typeError, setTypeError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);

  const { mutate, isLoading: isCreating } = api.tags.create.useMutation({
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

  console.log(type);

  const createNewTag = useCallback(() => {
    toast.loading("creating tag", { duration: 1000 });

    console.log("creating tag:", name, type, description, color);

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
  ]);

  return (
    <div className="fade-y w-full border-b border-zinc-700 p-2">
      <h2 className="py-2 text-2xl font-semibold">Create New Tag</h2>
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
              disabled={isCreating}
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
              disabled={isCreating}
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
              disabled={isCreating}
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
                disabled={isCreating}
                style={colorError ? { border: "1px solid red" } : {}}
              />
              <input
                className="h-8 rounded-sm border border-zinc-500 bg-zinc-700 px-1 outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
                value={color}
                type="color"
                onChange={(e) => setColor(e.target.value)}
                disabled={isCreating}
              />
              <button
                onClick={() => setRandomColor()}
                className="rounded bg-zinc-700 p-1 outline-none transition-all duration-100 hover:bg-amber-700"
                disabled={isCreating}
              >
                <ArrowPathRoundedSquareIcon className="h-6 w-6" />
              </button>
            </div>
            <p className="text-sm italic text-red-500"> {colorError || ""}</p>
          </div>
          <div className="flex h-full flex-col items-center justify-center gap-2 rounded border-zinc-700 p-2 md:border">
            <h2 className="text-lg font-semibold">Tag Preview</h2>

            <TooltipComponent
              content={description || "<no description>"}
              side="bottom"
            >
              <div>
                <div ref={exampleTag}>{name || "example tag"}</div>
              </div>
            </TooltipComponent>
            <p className="hidden text-sm italic text-zinc-400 md:block">
              tip: Hover over the tag to see the description.
            </p>
          </div>
        </div>
        <button
          onClick={() => createNewTag()}
          disabled={isCreating}
          className="flex w-full items-center justify-center gap-2 rounded bg-zinc-700 p-2 transition-all duration-100 hover:bg-amber-700 md:w-1/3"
        >
          {isCreating ? (
            <LoadingSpinner />
          ) : (
            <>
              <PlusIcon className="h-5 w-5" /> <p> Create Tag</p>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const TagsPage: NextPage = () => {
  const [newPanelOpen, setNewPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const togglePanelOpen = useCallback(() => {
    setNewPanelOpen(!newPanelOpen);
  }, [newPanelOpen, setNewPanelOpen]);

  const {
    data,
    isLoading: loading,
    isError,
  } = api.tags.search.useQuery({
    name: searchTerm,
  });

  console.log(data);

  //   const loading = true;

  return (
    <main className="min-h-[100vh] overflow-x-hidden bg-zinc-800">
      <NewItemPageHeader title="Tags" />
      <div className="flex gap-2 border-b border-zinc-700 p-2">
        <input
          type="text"
          className="w-full rounded-md border border-zinc-500 bg-zinc-700 p-2 text-white outline-none transition-all duration-100 hover:bg-zinc-600 focus:ring-1 focus:ring-amber-600"
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
      {newPanelOpen && <NewTagWizard />}
      <div className="p-2">
        <h2 className="pb-2 text-2xl font-semibold">Tags</h2>
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

const TagCard: React.FC<{ tag: Tag }> = ({ tag }) => {
  return (
    <div className="flex justify-between  gap-2 rounded border border-zinc-700 p-2">
      <div className="flex items-center justify-start gap-2">
        <div className="flex items-center gap-2">
          <TagIcon
            className="h-8 w-8"
            style={{ color: tag.backgroundColor || "#000" }}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <div className="text-lg font-semibold">{tag.name}</div>
          </div>
          <div className="flex items-center gap-1">
            {tag.type && tag.type === "crews" && (
              <UserCircleIcon className="h-6 w-6 text-zinc-300" />
            )}
            {tag.type && tag.type === "projects" && (
              <WrenchScrewdriverIcon className="h-6 w-6 text-zinc-300" />
            )}
            {tag.type && tag.type === "blueprints" && (
              <DocumentIcon className="h-6 w-6 text-zinc-300" />
            )}
            {tag.description && tag.type && (
              <p className="text-sm text-zinc-300">•</p>
            )}
            <p className="text-sm text-zinc-300">{tag.description}</p>
          </div>
        </div>
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <p className="hidden text-sm text-zinc-300 md:block">
          {dayjs(tag.updatedAt || tag.createdAt).fromNow()}
        </p>
        <TooltipComponent content="Edit tag" side="bottom">
          <button className="rounded bg-zinc-700 p-2 hover:bg-amber-700">
            <PencilIcon className="h-5 w-5" />
          </button>
        </TooltipComponent>
        <TooltipComponent content="Delete tag" side="bottom">
          <button className="rounded bg-zinc-700 p-2 hover:bg-amber-700">
            <TrashIcon className="h-5 w-5" />
          </button>
        </TooltipComponent>
      </div>
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
