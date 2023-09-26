import { render } from "@react-email/render";
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
import { Preview } from "@react-email/preview";
import { Section } from "@react-email/section";
import { Column } from "@react-email/column";

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

export const Construct = (
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

  return {
    from: "taylor.howell@jrcousa.com",
    subject: title + " | War Manager Automated Email",
    text,
    html,
    to: recipient,
  };
};

export const Template = (props: {
  title: string;
  content: string;
  recipient: string;
  callToActionTitle: string;
  link: string;
  name?: string;
}) => {
  return (
    <>
      <Html lang="en">
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
        <Preview>War Manager: {props.title}</Preview>
        <Tailwind>
          <Container className="mx-auto my-auto bg-white font-sans">
            <Container className="mx-auto my-[40px] w-[665px] rounded border border-solid border-[#eaeaea] p-[20px]">
              <Section className="mt-[32px]">
                <Img
                  src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png"
                  alt="logo"
                  width={48}
                  height={48}
                  className="mx-auto my-0"
                />
              </Section>

              <Heading
                className="mx-auto my-0 p-2 text-center text-2xl"
                as="h1"
              >
                {props.title}
              </Heading>
              <Section className="mt-[15px] text-left">
                <Text>Hi, {props.name ? props.name : ""}</Text>
              </Section>
              <Text className="w-full">
                {props.content}
              </Text>
              <Section className="mb-[32px] mt-[32px] text-center">
                <Button
                  pX={20}
                  pY={12}
                  className="rounded bg-zinc-800 text-center text-[12px] font-semibold text-white no-underline"
                  href={props.link}
                >
                  {props.callToActionTitle}
                </Button>
              </Section>
              <Hr />
              <Container className="m-auto flex w-full items-center justify-center gap-2 rounded p-2 text-xs text-zinc-600">
                <Section>
                  <Column>
                    <Img
                      src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png"
                      alt="logo"
                      width={24}
                      height={24}
                    />
                    <span>War Manager Cloud Service</span>
                  </Column>
                </Section>
                <Text className="text-xs text-zinc-500">
                  This email was intended for <Link>{props.recipient}</Link> by
                  War Manager from Jr & Company Roofing Contractors. <br/>If you
                  believe you have received this message in error, please
                  dispose this message immediately and reach out to support at{" "}
                  <span className="text-zinc-800">
                    <Link>taylor.howell@jrcousa.com</Link>
                  </span>
                  . Thank you for your understanding.
                </Text>
                <Section>
                  <Column>
                    <Text className="text-xs">
                      Jr & Company Roofing Contractors <br />
                      {"1201 W 31st St, Kansas City, MO 64108"}
                    </Text>
                  </Column>
                  <Column>
                    <Text className="text-xs">
                      <Link>{"www.jrcousa.com"}</Link> <br />
                      {"(816) 587-6148"}
                    </Text>
                  </Column>
                </Section>
              </Container>
            </Container>
          </Container>
        </Tailwind>
      </Html>
    </>
  );
};

{
  /* <Text className="text-xs italic">
                  This email was intended for <Link>{props.recipient}</Link> by
                  War Manager from Jr & Company Roofing Contractors. If you
                  believe you have received this message in error, please
                  dispose this message immediately and reach out to support at{" "}
                  <Link>taylor.howell@jrcousa.com</Link>
                </Text> */
}
