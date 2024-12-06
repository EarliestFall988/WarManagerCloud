import { useUser } from "@clerk/nextjs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { TrashIcon } from "@heroicons/react/24/solid";
import { type Sector, type Tag } from "@prisma/client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

import { toast } from "react-hot-toast";
import { DialogComponent } from "~/components/dialog";
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
  const [medCardAnimationParent] = useAutoAnimate();

  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState("Laborer");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [wage, setWage] = useState("0");
  const [burden, setBurden] = useState("0");
  const [rating, setRating] = useState("5");
  const [tags, setTags] = useState([] as Tag[]);
  const [sectors, setSectors] = useState([] as Sector[]);
  const [medicalCardSignedDate, setMedicalCardSignedDate] = useState<string>();
  const [medicalCardExpirationDate, setMedicalCardExpirationDate] =
    useState<string>();

  const [includeMedicalCard, setIncludeMedicalCard] = useState(false);

  const clearMedicalCard = useCallback(() => {
    setMedicalCardExpirationDate(undefined);
    setMedicalCardSignedDate(undefined);
    setIncludeMedicalCard(false);
  }, []);

  const [nameError, setNameError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [positionError, setPositionError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [wageError, setWageError] = useState("");
  const [burdenError, setBurdenError] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [sectorError, setSectorError] = useState("");

  const [medicalCardSignedDateError, setMedicalCardSignedDateError] =
    useState("");
  const [medicalCardExpirationDateError, setMedicalCardExpirationDateError] =
    useState("");

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
            case "sectors":
              setSectorError(message);
              break;
            case "medicalCardSignedDate":
              setMedicalCardSignedDateError(message);
              break;
            case "medicalCardExpirationDate":
              setMedicalCardExpirationDateError(message);
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

    setSectorError("");

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

    const medCardExpirationDate =
      medicalCardExpirationDate &&
      medicalCardExpirationDate !== "Invalid Date" &&
      medicalCardExpirationDate !== "NaN-NaN-NaN" &&
      medicalCardExpirationDate !== "undefined-undefined-undefined" &&
      medicalCardExpirationDate !== "null-null-null" &&
      medicalCardExpirationDate.length > 0
        ? new Date(medicalCardExpirationDate)
        : undefined;
    const medCardSignedDate =
      medicalCardSignedDate &&
      medicalCardSignedDate !== "Invalid Date" &&
      medicalCardSignedDate !== "NaN-NaN-NaN" &&
      medicalCardSignedDate !== "undefined-undefined-undefined" &&
      medicalCardSignedDate !== "null-null-null" &&
      medicalCardSignedDate.length > 0
        ? new Date(medicalCardSignedDate)
        : undefined;

    const medExp = medCardExpirationDate
      ? new Date(
          medCardExpirationDate?.setDate(medCardExpirationDate.getDate() + 1)
        )
      : undefined;

    const medSign = medCardSignedDate
      ? new Date(medCardSignedDate.setDate(medCardSignedDate.getDate() + 1))
      : undefined;

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
      sectors: getSectorsStringArray(),
      medicalCardExpirationDate: medExp,
      medicalCardSignedDate: medSign,
      includesMedicalCard: includeMedicalCard,
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
    sectors,
    medicalCardExpirationDate,
    medicalCardSignedDate,
    includeMedicalCard,
  ]);

  const setMedicalCardDates = (signed?: Date, exp?: Date) => {
    if (isCreating) return;

    let startDate = new Date(Date.now());
    let expirationDate = new Date(
      new Date(Date.now()).setFullYear(new Date().getFullYear() + 2)
    );

    if (signed) {
      startDate = signed;
    }

    if (exp) {
      expirationDate = exp;
    }

    let startMonth = (startDate.getMonth() + 1).toString();
    if (startMonth.length === 1) {
      startMonth = `0${startMonth}`;
    }

    let startDay = (startDate.getDate() + 1).toString();
    if (startDay.length === 1) {
      startDay = `0${startDay}`;
    }

    let expirationMonth = (expirationDate.getMonth() + 1).toString();
    if (expirationMonth.length === 1) {
      expirationMonth = `0${expirationMonth}`;
    }

    let expirationDay = (expirationDate.getDate() + 1).toString();
    if (expirationDay.length === 1) {
      expirationDay = `0${expirationDay}`;
    }

    setIncludeMedicalCard(true);

    setMedicalCardSignedDate(
      `${startDate.getFullYear()}-${startMonth}-${startDay}`
    );
    setMedicalCardExpirationDate(
      `${expirationDate.getFullYear()}-${expirationMonth}-${expirationDay}`
    );
  };

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
        <div
          ref={medCardAnimationParent}
          className="w-full rounded border border-zinc-700"
        >
          <p className="px-1 text-2xl font-semibold">Med Card</p>
          {medicalCardSignedDate && medicalCardExpirationDate ? (
            <>
              <div className="w-full p-2" />
              <div className="w-full p-2">
                {medicalCardSignedDate && (
                  <>
                    <p className="py-1 text-lg font-semibold">
                      Med Card Signed Date
                    </p>

                    <InputComponent
                      type={"date"}
                      error={medicalCardSignedDateError}
                      value={medicalCardSignedDate}
                      onChange={(e) => {
                        setMedicalCardSignedDate(e.currentTarget.value);
                      }}
                      disabled={isCreating}
                    />
                  </>
                )}
              </div>
              <div className="w-full p-2">
                {medicalCardExpirationDate && (
                  <>
                    <p className="py-1 text-lg font-semibold">
                      Med Card Expiration Date
                    </p>
                    <InputComponent
                      type={"date"}
                      error={medicalCardExpirationDateError}
                      value={medicalCardExpirationDate}
                      onChange={(e) =>
                        setMedicalCardExpirationDate(e.currentTarget.value)
                      }
                      disabled={isCreating}
                    />
                  </>
                )}
              </div>
              <div className="w-full p-2">
                <DialogComponent
                  yes={clearMedicalCard}
                  title="Remove Medical Card Information"
                  description="Are you sure you want to remove the medical card information?"
                  trigger={
                    <div className="flex items-center justify-center gap-2 rounded bg-red-700 p-2 text-center hover:cursor-pointer">
                      <TrashIcon className="h-5 w-5 text-white" />
                      <p>Remove Medical Card Information</p>
                    </div>
                  }
                />
              </div>
            </>
          ) : (
            <div className="w-full p-1">
              <button
                onClick={() => {
                  setMedicalCardDates();
                }}
                className="rounded bg-amber-700 p-2"
              >
                Add Medical Card Information
              </button>
            </div>
          )}
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
