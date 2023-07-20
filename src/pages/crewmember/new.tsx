import { useUser } from "@clerk/nextjs";
import { type Tag } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

import { toast } from "react-hot-toast";
import {
  ButtonCallToActionComponent,
  InputComponent,
  PhoneEmailComponent,
  TextareaComponent,
} from "~/components/input";
import { LoadingSpinner } from "~/components/loading";

import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";
import { TagsMultiselectDropdown } from "~/components/TagDropdown";
import { api } from "~/utils/api";

const NewCrewMemberPage: NextPage = () => {
  const router = useRouter();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState("Laborer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wage, setWage] = useState("0");
  const [burden, setBurden] = useState("0");
  const [rating, setRating] = useState("5");
  const [tags, setTags] = useState([] as Tag[]);

  const [nameError, setNameError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [wageError, setWageError] = useState("");
  const [burdenError, setBurdenError] = useState("");
  const [ratingError, setRatingError] = useState("");

  // const canTravel = travel === "Yes";
  const wageNumber = parseFloat(wage);
  const burdenNumber = parseFloat(burden);
  const ratingNumber = parseInt(rating);

  const context = api.useContext().crewMembers;

  const { mutate, isLoading: isCreating } = api.crewMembers.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} (${data.position}) added successfully!`);
      void context.invalidate();
      void router.back();
    },
    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
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
            case "notes":
              setNotesError(message);
              break;
            case "position":
              setPositionError(message);
              break;
            case "phone":
              setPhoneError(message);
              break;
            case "email":
              setEmailError(message);
              break;
            case "wage":
              setWageError(message);
              break;
            case "burden":
              setBurdenError(message);
              break;
            case "rating":
              setRatingError(message);
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

  const { isLoaded, isSignedIn } = useUser();

  const save = useCallback(() => {
    setNameError("");

    setNotesError("");

    setPositionError("");
    setPhoneError("");

    setEmailError("");

    setWageError("");

    setBurdenError("");

    setRatingError("");

    const getTagsStringArray = () => {
      const tagsStringArray = [] as string[];
      tags.forEach((tag) => {
        tagsStringArray.push(tag.id);
      });
      return tagsStringArray;
    };

    toast.loading("Saving", { duration: 1000 });

    console.log("phone", phone);

    mutate({
      name,
      notes,
      position,
      phone,
      email,
      wage: wageNumber,
      burden: burdenNumber,
      rating: ratingNumber,
      tags: getTagsStringArray(),
    });
  }, [
    name,
    notes,
    position,
    phone,
    email,
    wageNumber,
    burdenNumber,
    ratingNumber,
    mutate,
    tags,
  ]);

  //redirect if the user is not found
  if (!isSignedIn && isLoaded) {
    return <SignInModal redirectUrl={`/newCrewMember`} />;
  }

  return (
    <main className="min-h-[100vh] bg-zinc-900">
      <NewItemPageHeader
        title={` ${name ? name : "New Crew Member"}`}
        save={() => {
          save();
        }}
        saving={isCreating}
        cancel={() => void router.back()}
      />
      <div className="m-auto flex flex-col md:w-1/2">
        <div className="w-full p-2">
          <p className="py-1 text-lg">Full Name</p>
          <InputComponent
            error={nameError}
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
            }}
            placeholder="Name"
            disabled={isCreating}
            autoFocus
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Position</p>
          <select
            className="w-full rounded bg-zinc-800 p-2 text-zinc-200 outline-none ring-2 ring-zinc-700 transition-all duration-100 hover:ring-2 hover:ring-zinc-600 hover:ring-offset-1 hover:ring-offset-zinc-600 focus:ring-2 focus:ring-amber-700"
            placeholder="Name"
            value={position}
            disabled={isCreating}
            onChange={(e) => setPosition(e.target.value)}
          >
            <option value="Crew">Laborer</option>
            <option value="Specialist">Specialist</option>
            <option value="Foreman">Foreman</option>
            <option value="Specialist Foreman">Specialist Foreman</option>
            <option value="Superintendent">Superintendent</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Machine Operator">Machine Operator</option>
            <option value="Subcontractor">Subcontractor</option>
            <option value="Other">Other</option>
          </select>
          <p className="py-2 text-red-500">{positionError}</p>
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg font-semibold">Tags</p>
          <TagsMultiselectDropdown
            type={"crews"}
            savedTags={tags}
            onSetTags={setTags}
          />
        </div>
        <div className="p-2" />
        <div className="w-full p-2">
          <p className="py-1 text-lg">Phone Number</p>

          <PhoneEmailComponent
            value={phone}
            error={phoneError}
            onChange={(e) => {
              setPhone(e.currentTarget.value);
            }}
            type="tel"
            disabled={isCreating}
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Email</p>

          <PhoneEmailComponent
            value={email}
            error={emailError}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
            }}
            type="email"
            disabled={isCreating}
          />
        </div>
        <div className="w-full p-2" />

        <div className="w-full p-2">
          <p className="py-1 text-lg">Wage</p>

          <InputComponent
            error={wageError}
            type="number"
            value={wage}
            onChange={(e) => {
              setWage(e.currentTarget.value);
            }}
            placeholder="0.00"
            disabled={isCreating}
          />
        </div>

        <div className="w-full p-2">
          <p className="py-1 text-lg">Burden</p>

          <InputComponent
            error={burdenError}
            type="number"
            value={burden}
            onChange={(e) => {
              setBurden(e.currentTarget.value);
            }}
            placeholder="0.00"
            disabled={isCreating}
          />
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2">
          <p className="py-1 text-lg">Rating</p>

          <InputComponent
            error={ratingError}
            type="number"
            value={rating}
            onChange={(e) => {
              setRating(e.currentTarget.value);
            }}
            placeholder="0.00"
            disabled={isCreating}
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
            placeholder="Talk about anything - can this crew member operate a specific machine? Do they have a specific skill? can they speak a specific language or travel?"
            disabled={isCreating}
          />
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2">
          <ButtonCallToActionComponent
            disabled={isCreating}
            onClick={() => save()}
          >
            {isCreating ? <LoadingSpinner /> : <p>Create New Crew Member</p>}
          </ButtonCallToActionComponent>
        </div>
      </div>
    </main>
  );
};

export default NewCrewMemberPage;
