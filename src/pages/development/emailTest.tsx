import { type NextPage } from "next";
import { useCallback } from "react";
import { api } from "~/utils/api";
import { useState } from "react";
import { render } from "@react-email/render";

const EmailTest: NextPage = () => {
  const [emailTitle, setEmailTitle] = useState("");
  const [emailcontent, setEmailContent] = useState("");
  const [emailRecipient, setEmailRecipient] = useState("");
  const [emailCTATitle, setEmailCTATitle] = useState("");
  const [emailLink, setEmailLink] = useState("");

  const { mutate } = api.emailing.sendEmail.useMutation({
    onSuccess: () => {
      console.log("email sent");
    },
  });

  const GetHTMLEmailTemplate = (
    title: string,
    content: string,
    recipient: string,
    callToActionTitle: string,
    link: string
  ) => {
    return render(
      <Template
        callToActionTitle={callToActionTitle}
        title={title}
        content={content}
        link={link}
        recipient={recipient}
      />,
      {
        pretty: true,
      }
    );
  };

  const GetTextEmailTemplate = (
    title: string,
    content: string,
    recipient: string,
    callToActionTitle: string,
    link: string
  ) => {
    return render(
      <Template
        callToActionTitle={callToActionTitle}
        title={title}
        content={content}
        link={link}
        recipient={recipient}
      />,
      {
        plainText: true,
      }
    );
  };

  const runEmailTest = useCallback(
    (
      title: string,
      content: string,
      recipient: string,
      callToActionTitle: string,
      link: string
    ) => {
      const html = GetHTMLEmailTemplate(
        title,
        content,
        recipient,
        callToActionTitle,
        link
      );
      const text = GetTextEmailTemplate(
        title,
        content,
        recipient,
        callToActionTitle,
        link
      );

      console.log(html);
      console.log(text);
      mutate({
        from: "taylor.howell@jrcousa.com",
        subject: "War Manager Test Email using react email",
        text,
        html,
        to: recipient,
      });
    },
    [mutate]
  );

  return (
    <>
      <h1>Email Test</h1>
      <div className="grid grid-cols-2 gap-2 text-black">
        <input
          className="rounded p-2"
          type="text"
          placeholder="Email Title"
          onChange={(e) => {
            setEmailTitle(e.target.value);
          }}
        />
        <input
          className="rounded p-2"
          type="text"
          placeholder="Email Content"
          onChange={(e) => {
            setEmailContent(e.target.value);
          }}
        />
        <input
          className="rounded p-2"
          type="text"
          placeholder="Email Recipient"
          onChange={(e) => {
            setEmailRecipient(e.target.value);
          }}
        />
        <input
          className="rounded p-2"
          type="text"
          placeholder="Email CTA Title"
          onChange={(e) => {
            setEmailCTATitle(e.target.value);
          }}
        />
        <input
          className="rounded p-2"
          type="text"
          placeholder="Email Link"
          onChange={(e) => {
            setEmailLink(e.target.value);
          }}
        />
      </div>

      <button
        onClick={() => {
          runEmailTest(
            emailTitle,
            emailcontent,
            emailRecipient,
            emailCTATitle,
            emailLink
          );
        }}
      >
        Send Email
      </button>
    </>
  );
};

export default EmailTest;

import { Button } from "@react-email/button";
import { Hr } from "@react-email/hr";
import { Html } from "@react-email/html";
import { Text } from "@react-email/text";
import { Heading } from "@react-email/heading";
import { Img } from "@react-email/img";
import { Head } from "@react-email/head";
import { Font } from "@react-email/font";
import { Tailwind } from "@react-email/tailwind";
import { Container } from "@react-email/container";
import { Link } from "@react-email/link";
export const Template = (props: {
  title: string;
  content: string;
  recipient: string;
  callToActionTitle: string;
  link: string;
}) => {
  return (
    <>
      <Head>
        <title>{props.title}</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
            format: "woff2",
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Html lang="en">
        <Tailwind>
          <Container className="rounded p-2">
            <Heading className="text-center text-2xl p-2" as="h1">
              {props.title}
            </Heading>
            <Text className="w-full text-center text-lg p-2">{props.content}</Text>
            <Button
              className="rounded bg-amber-600 p-2 w-full text-center font-semibold text-white"
              href={props.link}
            >
              {props.callToActionTitle}
            </Button>
          </Container>
          <Hr />
          <Container className="m-auto flex w-full items-center justify-center gap-2 rounded bg-zinc-100 p-2 text-xs text-zinc-600">
            <Img
              src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png"
              alt="logo"
              width={24}
              height={24}
            />
            <Text className="text-sm italic">
              This email was automatically sent to {props.recipient} by War
              Manager. If you believe you have received this message in error or
              have any questions, please reach out to our support team at{" "}
              <Link>taylor.howell@jrcousa.com</Link>. We appreciate your
              understanding.
            </Text>
          </Container>
        </Tailwind>
      </Html>
    </>
  );
};
