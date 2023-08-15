import { type NextPage } from "next";
import { useCallback } from "react";
import { api } from "~/utils/api";
import { useUser } from "@clerk/nextjs";

const EmailTest: NextPage = () => {
  const { mutate } = api.emailing.sendEmail.useMutation({
    onSuccess: () => {
      console.log("email sent");
    },
  });

  const { mutate: sendMessage } = api.messaging.sendMessage.useMutation({
    onSuccess: () => {
      console.log("message sent");
    },
  });

  const runEmailTest = useCallback(
    (
      title: string,
      content: string,
      recipient: string,
      callToActionTitle: string,
      link: string
    ) => {
      mutate({
        subject: title,
        to: recipient,
        callToAction: callToActionTitle,
        content: content,
        link: link,
      });
    },
    [mutate]
  );

  const SendTextMessage = (message: string, phoneNumber: string) => {
    sendMessage({
      message,
      phoneNumber,
    });
  };

  const user = useUser();

  if (
    (user?.user?.emailAddresses[0]?.emailAddress || "") !==
    "taylor.howell@jrcousa.com"
  ) {
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );
  }

  return (
    <>
      <h1>Email Test</h1>

      <button
        onClick={() => {
          runEmailTest(
            "Test Email",
            "It looks like you were assigned a new task by Andrew Kaiser. Please click the button below to view the task.",
            "taylor.howell@jrcousa.com",
            "Check it out",
            "https://cloud.warmanager.net/dashboard/activity"
          );
        }}
      >
        Send Email
      </button>
      <div className="my-10" />
      <button
        onClick={() => {
          SendTextMessage(
            "It looks like you were assigned a new task by Andrew Kaiser. Please click the button below to view the task.",
            "+19137497477"
          );
        }}
      >
        Send Message
      </button>
    </>
  );
};

export default EmailTest;

// import { Button } from "@react-email/button";
// import { Hr } from "@react-email/hr";
// import { Html } from "@react-email/html";
// import { Text } from "@react-email/text";
// import { Heading } from "@react-email/heading";
// import { Img } from "@react-email/img";
// import { Head } from "@react-email/head";
// import { Font } from "@react-email/font";
// import { Tailwind } from "@react-email/tailwind";
// import { Container } from "@react-email/container";
// import { Link } from "@react-email/link";
// export const Template = (props: {
//   title: string;
//   content: string;
//   recipient: string;
//   callToActionTitle: string;
//   link: string;
// }) => {
//   return (
//     <>
//       <Head>
//         <title>{props.title}</title>
//         <Font
//           fontFamily="Roboto"
//           fallbackFontFamily="Verdana"
//           webFont={{
//             url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
//             format: "woff2",
//           }}
//           fontWeight={400}
//           fontStyle="normal"
//         />
//       </Head>
//       <Html lang="en">
//         <Tailwind>
//           <Container className="rounded p-2">
//             <Heading className="text-center text-2xl p-2" as="h1">
//               {props.title}
//             </Heading>
//             <Text className="w-full text-center text-lg p-2">{props.content}</Text>
//             <Button
//               className="rounded bg-amber-600 p-2 w-full text-center font-semibold text-white"
//               href={props.link}
//             >
//               {props.callToActionTitle}
//             </Button>
//           </Container>
//           <Hr />
//           <Container className="m-auto flex w-full items-center justify-center gap-2 rounded bg-zinc-100 p-2 text-xs text-zinc-600">
//             <Img
//               src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png"
//               alt="logo"
//               width={24}
//               height={24}
//             />
//             <Text className="text-sm italic">
//               This email was automatically sent to {props.recipient} by War
//               Manager. If you believe you have received this message in error or
//               have any questions, please reach out to our support team at{" "}
//               <Link>taylor.howell@jrcousa.com</Link>. We appreciate your
//               understanding.
//             </Text>
//           </Container>
//         </Tailwind>
//       </Html>
//     </>
//   );
// };
