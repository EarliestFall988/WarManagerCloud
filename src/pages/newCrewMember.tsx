import { SignInButton, useUser } from "@clerk/nextjs";
import type { NextPage } from "next";
import { useState } from "react";

import { toast } from "react-hot-toast";
import { LoadingSpinner } from "~/components/loading";

import { NewItemPageHeader } from "~/components/NewItemPageHeader";
import SignInModal from "~/components/signInPage";
import { api } from "~/utils/api";

const NewCrewMemberPage: NextPage = () => {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [position, setPosition] = useState("Laborer");
  const [crewCount, setCrewCount] = useState("1");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [travel, setTravel] = useState("No");
  const [wage, setWage] = useState("0");
  const [burden, setBurden] = useState("0");
  const [rating, setRating] = useState("5");

  const canTravel = travel === "Yes";
  const wageNumber = parseFloat(wage);
  const burdenNumber = parseFloat(burden);
  const ratingNumber = parseInt(rating);

  const { mutate, isLoading: isCreating } = api.crewMembers.create.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.name} (${data.position}) added successfully!`);
      setName("");
      setNotes("");
      setPosition("");
      setCrewCount("");
      // void api.blueprints.getAll.invalidate();
    },
    onError: (e) => {
      const errorMessage = e.shape?.data?.zodError?.fieldErrors;

      if (!errorMessage) {
        toast.error("Something went wrong! Please try again later");
      } else if (errorMessage?.content && errorMessage?.content[0]) {
        toast.error(errorMessage.content[0]);
      }
    },
  });

  const { user } = useUser();

  //redirect if the user is not found
  if (!user) {
    return <SignInModal redirectUrl={`/newCrewMember`} />;
  }

  return (
    <main className="min-h-[100vh] bg-zinc-800">
      <NewItemPageHeader title="New Crew Member" context="crewmembers" />
      {/* <SignedIn> */}
      <div className="m-auto flex flex-col md:w-1/2">
        <div className="w-full p-2">
          <p className="py-1 text-lg">Full Name</p>
          <input
            className="w-full rounded p-2 text-stone-800 outline-none"
            type="text"
            placeholder="Name"
            value={name}
            disabled={isCreating}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Position</p>
          <select
            className="w-full rounded p-2 text-stone-800 outline-none"
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
        </div>
        <div className="p-2" />
        <div className="w-full p-2">
          <p className="py-1 text-lg">Phone Number</p>
          <input
            type="tel"
            className="peer w-full rounded p-2 text-stone-800 outline-none invalid:[&:not(:placeholder-shown):not(:focus)]:ring invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500"
            placeholder="000-000-0000"
            value={phone}
            disabled={isCreating}
            onChange={(e) => setPhone(e.target.value)}
            pattern={"[0-9]{3}-[0-9]{3}-[0-9]{4}"}
          />
           <p className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
            Please enter a valid phone number (000-000-0000)
          </p>
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Email</p>
          <input
            type="email"
            className="peer w-full rounded p-2 text-stone-800 outline-none invalid:[&:not(:placeholder-shown):not(:focus)]:ring invalid:[&:not(:placeholder-shown):not(:focus)]:ring-red-500"
            placeholder="someone@example.com"
            value={email}
            disabled={isCreating}
            onChange={(e) => setEmail(e.target.value)}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
          />
          <p className="mt-2 hidden text-sm text-red-500 peer-[&:not(:placeholder-shown):not(:focus):invalid]:block">
            Please enter a valid email address
          </p>
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2">
          <p className="py-1 text-lg">Travel?</p>
          <select
            className="w-full rounded p-2 text-stone-800 outline-none"
            placeholder="Name"
            value={travel}
            disabled={isCreating}
            onChange={(e) => setTravel(e.target.value)}
          >
            <option value="No">No</option>
            <option value="No">Yes</option>
          </select>
        </div>

        <div className="w-full p-2">
          <p className="py-1 text-lg">Wage</p>
          <input
            type="number"
            className="w-full rounded p-2 text-stone-800 outline-none"
            placeholder="someone@example.com"
            value={wage}
            disabled={isCreating}
            onChange={(e) => setWage(e.target.value)}
          />
        </div>

        <div className="w-full p-2">
          <p className="py-1 text-lg">Burden</p>
          <input
            type="number"
            className="w-full rounded p-2 text-stone-800 outline-none"
            placeholder="someone@example.com"
            value={burden}
            disabled={isCreating}
            onChange={(e) => setBurden(e.target.value)}
          />
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2">
          <p className="py-1 text-lg">Rating</p>
          <input
            type="number"
            className="w-full rounded p-2 text-stone-800 outline-none"
            placeholder="someone@example.com"
            value={rating}
            disabled={isCreating}
            onChange={(e) => setRating(e.target.value)}
          />
        </div>
        <div className="w-full p-2">
          <p className="py-1 text-lg">Notes</p>
          <textarea
            className="h-24 w-full rounded p-2 text-stone-800 outline-none"
            placeholder="Talk about anything - can this crew member operate a specific machine? Do they have a specific skill? can they speak a specific language or travel?"
            value={notes}
            disabled={isCreating}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="w-full p-2" />
        <div className="w-full p-2">
          <button
            disabled={isCreating}
            onClick={() => {
              toast.loading("Saving", { duration: 1000 });
              mutate({
                name,
                position,
                notes,
                phone,
                email,
                travel: canTravel,
                wage: wageNumber,
                burden: burdenNumber,
                rating: ratingNumber,
              });
            }}
            className="flex h-10 w-full items-center justify-center rounded bg-gradient-to-br from-amber-700 to-red-700 font-semibold text-white hover:from-amber-600 hover:to-red-600"
          >
            {isCreating ? <LoadingSpinner /> : <p> Add Crew Member</p>}
          </button>
        </div>
      </div>
      {/* </SignedIn> */}
    </main>
  );
};

export default NewCrewMemberPage;
