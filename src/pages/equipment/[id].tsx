import type { NextPage } from "next";
import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import { useState, useCallback, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import {
  ButtonCallToActionComponent,
  ButtonDeleteAction,
  InputComponent,
  TextareaComponent,
} from "~/components/input";
import { LoadingSpinner } from "~/components/loading";
import SignInModal from "~/components/signInPage";
import { TagsMultiselectDropdown } from "~/components/TagDropdown";
import type { Sector, Tag } from "@prisma/client";
import { api } from "~/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import { CloudArrowUpIcon } from "@heroicons/react/24/solid";

const EquipmentItem: NextPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  const router = useRouter();

  const { id } = router.query;

  const [name, setName] = useState("");
  const [identification, setIdentification] = useState("");
  const [gps, setGPS] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [condition, setCondition] = useState("");
  const [costPerHour, setCostPerHour] = useState("");
  const [tags, setTags] = useState([] as Tag[]);
  const [sectors, setSectors] = useState([] as Sector[]);

  const [nameError, setNameError] = useState<string>("");
  const [identificationError, setIdentificationError] = useState<string>("");
  const [gpsError, setGpsError] = useState<string>("");
  const [typeError, setTypeError] = useState<string>("");
  const [notesError, setNotesError] = useState<string>("");
  const [conditionError, setConditionError] = useState<string>("");
  const [costPerHourError, setCostPerHourError] = useState<string>("");
  const [sectorError, setSectorError] = useState<string>("");

  const ctx = api.useContext().equipment;

  const back = () => {
    if (window.history.length > 0) {
      return router.back();
    } else {
      return router.push("/dashboard/equipment");
    }
  };

  const { mutate: apiDelete, isLoading: isDeleting } =
    api.equipment.deleteEquipment.useMutation({
      onSuccess: () => {
        toast.success("Equipment Item deleted successfully!");
        void ctx.invalidate();
        void back();
      },
    });

  const deleteEquipment = () => {
    if (id == null || !id || id === "") return;

    apiDelete({
      id: id as string,
    });
  };

  const { mutate, isLoading: isSaving } = api.equipment.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} (${data.type}) updated successfully!`);
      void ctx.invalidate();
      void back();
    },
    onError(e) {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
        console.error(e.message);
        toast.error(e.message);
        return;
      } else {
        toast.error(
          "There were a few errors, please check the form and try again."
        );
      }

      for (const key in errorMessage) {
        // toast.error(errorMessage?[key][0] || "there was an api error");
        const keyMessage = errorMessage[key];

        if (keyMessage) {
          const message = keyMessage[0] || "";

          switch (key) {
            case "name":
              setNameError(message);
              break;
            case "identification":
              setIdentificationError(message);
              break;
            case "sectors":
              setSectorError(message);
              break;
            case "condition":
              setConditionError(message);
              break;
            case "type":
              setTypeError(message);
              break;
            case "gpsURL":
              setGpsError(message);
              break;
            case "costPerHour":
              setCostPerHourError(message);
              break;
            case "notes":
              setNotesError(message);
              break;
            default:
              break;
          }
        } else {
          toast.error("Something went wrong! Please try again later");
        }
      }
    },
  });

  const { data, isLoading } = api.equipment.getById.useQuery({
    id: id as string,
  });

  useMemo(() => {
    if (data) {
      const sector = data.sector;

      setName(data.name);
      setIdentification(data.equipmentId ?? "");
      setGPS(data.gpsURL ?? "");
      setType(data.type);
      setNotes(data.description ?? "");
      setCondition(data.condition);
      setCostPerHour(data.costPerHour.toString());
      setTags(data.tags);
      setSectors(sector ? [sector] : []);
    }
  }, [data]);

  const save = useCallback(() => {
    setNameError("");
    setIdentificationError("");
    setSectorError("");
    setConditionError("");
    setTypeError("");
    setGpsError("");
    setCostPerHourError("");
    setNotesError("");

    const getTagsStringArray = () => {
      const tagsStringArray = [] as string[];
      tags.forEach((tag) => {
        tagsStringArray.push(tag.id);
      });
      return tagsStringArray;
    };

    const getSectorsStringArray = () => {
      const sectorsStringArray = [] as string[];
      sectors.forEach((sector) => {
        sectorsStringArray.push(sector.id);
      });
      return sectorsStringArray;
    };

    toast.loading("Saving", { duration: 1000 });

    mutate({
      id: id as string,
      name,
      identification,
      gpsURL: gps,
      type,
      notes,
      condition,
      costPerHour: parseFloat(costPerHour),
      tags: getTagsStringArray(),
      sectors: getSectorsStringArray(),
    });
  }, [
    id,
    name,
    identification,
    gps,
    type,
    notes,
    condition,
    costPerHour,
    tags,
    sectors,
    mutate,
  ]);

  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl="/dashboard/reporting" />;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-[100vh] items-center justify-center bg-zinc-900">
        <LoadingSpinner />
      </main>
    );
  }

  return (
    <main className="min-h-[100vh] bg-zinc-900">
      <NewItemPageHeader
        title={` ${name ? name : "New Equipment Item"}`}
        save={() => {
          save();
        }}
        saving={isSaving}
        deleting={isDeleting}
        context="equipment"
      />
      <div className="m-auto flex flex-col md:w-1/2">
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg">Name</p>
          <InputComponent
            error={nameError}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
            }}
            placeholder="Name"
            disabled={isSaving}
            autoFocus
          />
        </div>
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg">Identification #</p>
          <InputComponent
            error={identificationError}
            value={identification}
            onChange={(e) => {
              setIdentification(e.currentTarget.value);
            }}
            placeholder="12345"
            disabled={isSaving}
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg font-semibold">Tags</p>
          <TagsMultiselectDropdown
            type={"crews and sectors"}
            savedTags={tags}
            onSetTags={setTags}
            savedSectors={sectors}
            onSetSectors={setSectors}
          />
          {sectorError && (
            <>
              <div className="h-[3px] translate-y-1 rounded bg-red-500"></div>
              <p className="p-1 tracking-tight text-red-500">{sectorError}</p>
            </>
          )}
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Condition</p>
          <select
            className={`w-full ${
              condition === "" ? "italic" : ""
            } rounded bg-zinc-800 p-2 text-zinc-200 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700`}
            placeholder="Name"
            value={condition}
            disabled={isSaving}
            onChange={(e) => setCondition(e.target.value)}
          >
            <option value="">Please Select</option>
            <option value="Unknown">Unknown</option>
            <option value="Bad">Bad</option>
            <option value="Poor">Poor</option>
            <option value="Like New">Like New</option>
            <option value="New">New</option>
          </select>
          <p className="py-2 text-red-500">{conditionError}</p>
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Type</p>
          <select
            className={`w-full ${
              type === "" ? "italic" : ""
            } rounded bg-zinc-800 p-2 text-zinc-200 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700`}
            placeholder="Name"
            value={type}
            disabled={isSaving}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Please Select</option>
            <option value="large">
              Large Equipment (Sky Track, Crane, etc...)
            </option>
            <option value="large">
              Vehicle (Flat Bed, Transit Van, Truck, etc...)
            </option>
            <option value="small">
              Small Equipment (Walker welder, ATV, Job Box, etc...)
            </option>
            <option value="trash">Roll off Dumpster</option>
            <option value="safety">Safety Equipment</option>
            <option value="misc">Misc.</option>
            <option value="other">Other</option>
          </select>
          <p className="py-2 text-red-500">{typeError}</p>
        </div>
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg">GPS URL (if applicable)</p>
          <InputComponent
            error={gpsError}
            value={gps}
            onChange={(e) => {
              setGPS(e.currentTarget.value);
            }}
            placeholder="https://www.google.com/maps/..."
            disabled={isSaving}
          />
        </div>
        <div className="w-full p-2">
          <p className="select-none py-1 text-lg">$$ Per Hour</p>
          <InputComponent
            error={costPerHourError}
            value={costPerHour}
            onChange={(e) => {
              setCostPerHour(e.currentTarget.value);
            }}
            placeholder="35.43"
            disabled={isSaving}
            type="number"
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Notes</p>

          <TextareaComponent
            error={notesError}
            value={notes}
            onChange={(e) => {
              setNotes(e.currentTarget.value);
            }}
            placeholder="Talk about anything you want here."
            disabled={isSaving}
          />
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2 pb-5 font-semibold">
          <ButtonCallToActionComponent
            onClick={save}
            disabled={isLoading || isDeleting || isSaving}
          >
            {isSaving ? (
              <LoadingSpinner />
            ) : (
              <>
                <p>Save</p> <CloudArrowUpIcon className="ml-2 h-5 w-5" />{" "}
              </>
            )}
          </ButtonCallToActionComponent>
        </div>

        <ButtonDeleteAction
          title={"Are you sure you want to delete this equipment item?"}
          description="The equipment item will not be recoverable after you delete it."
          loading={isDeleting}
          yes={deleteEquipment}
          disabled={isLoading || isDeleting || isSaving}
        />
        <div className="pt-20" />
      </div>
    </main>
  );
};

export default EquipmentItem;
