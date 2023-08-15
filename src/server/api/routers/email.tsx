import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "../trpc";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { TRPCError } from "@trpc/server";
import * as mail from "@sendgrid/mail";
import { render } from "@react-email/render";
import { Template } from "../../helpers/emailTemplateComponent";
import { clerkClient } from "@clerk/nextjs";

const redis = new Redis({
  url: "https://us1-merry-snake-32728.upstash.io",
  token: "AX_sAdsdfsgODM5ZjExZGEtMmmVjNmE345445kGVmZTk5MzQ=",
});

const rateLimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export const emailSenderRouter = createTRPCRouter({
  sendEmail: privateProcedure
    .input(
      z.object({
        subject: z.string(),
        content: z.string(),
        callToAction: z.string(),
        link: z.string(),
        to: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const authorId = ctx.currentUser;

      const { success } = await rateLimit.limit(authorId);

      if (!success) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "You have exceeded the rate limit, try again in a minute",
        });
      }

      const apiKey = process.env.TWILIO_EMAIL_API;

      if (apiKey === undefined)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No API key found",
        });

      mail.setApiKey(apiKey);

      const users = await clerkClient.users.getUserList();

      const user = users.find((x) => {
        const emailToCompare = x.emailAddresses[0]?.emailAddress;
        return emailToCompare === input.to;
      });

      let name = user?.firstName;
      if (name === undefined || name === null) name = "";

      const html = render(
        <Template
          callToActionTitle={input.callToAction}
          content={input.content}
          link={input.link}
          recipient={input.to}
          title={input.subject}
          name={name}
        />,
        {
          pretty: true,
        }
      );

      const text = render(
        <Template
          callToActionTitle={input.callToAction}
          content={input.content}
          link={input.link}
          recipient={input.to}
          title={input.subject}
          name={name}
        />,
        {
          plainText: true,
        }
      );

      const msg = {
        to: input.to,
        from: "taylor.howell@jrcousa.com",
        subject: input.subject + " | War Manager",
        text,
        html,
      };

      console.log(msg);

      const result = await mail
        .send(msg)
        .then(() => {
          console.log("Message sent");
          return true;
        })
        .catch((error) => {
          console.error(error);
          return false;
        });

      return result;
    }),
});

// const GenericEmailTemplate = (props: {
//   title: string;
//   content: string;
//   recipient: string;
//   callToActionTitle: string;
//   link: string;
//   name?: string;
// }) => {
//   return `
//   <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
// <html lang="en">

//   <head data-id="__react-email-head">
//     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
//     <title>${props.title}</title>
//     <style>
//       @font-face {
//         font-family: 'Roboto';
//         font-style: normal;
//         font-weight: 400;
//         mso-font-alt: 'Verdana';
//         src: url(https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2) format('woff2');
//       }

//       * {
//         font-family: 'Roboto', Verdana;
//       }
//     </style>
//   </head>
//   <div id="__react-email-preview" style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">War Manager: ${
//     props.title
//   }<div> ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿ ‌​‍‎‏﻿</div>
//   </div>
//   <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin-left:auto;margin-right:auto;margin-top:auto;margin-bottom:auto;background-color:rgb(255,255,255);font-family:ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji">
//     <tbody>
//       <tr style="width:100%">
//         <td>
//           <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin-left:auto;margin-right:auto;margin-top:40px;margin-bottom:40px;width:665px;border-radius:0.25rem;border-width:1px;border-style:solid;border-color:rgb(234,234,234);padding:20px">
//             <tbody>
//               <tr style="width:100%">
//                 <td>
//                   <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:32px">
//                     <tbody>
//                       <tr>
//                         <td><img data-id="react-email-img" alt="logo" src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png" width="48" height="48" style="display:block;outline:none;border:none;text-decoration:none;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px" /></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <h1 data-id="react-email-heading" style="margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px;padding:0.5rem;text-align:center;font-size:1.5rem;line-height:2rem">Test Email</h1>
//                   <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-top:15px;text-align:left">
//                     <tbody>
//                       <tr>
//                         <td>
//                           <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0">Hi, ${
//                             props.name ? props.name : "War Manager User"
//                           }</p>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <p data-id="react-email-text" style="font-size:14px;line-height:24px;margin:16px 0;margin-left:auto;margin-right:auto;margin-top:0px;margin-bottom:0px;width:100%;text-align:center">${
//                     props.content
//                   }</p>
//                   <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="margin-bottom:32px;margin-top:32px;text-align:center">
//                     <tbody>
//                       <tr>
//                         <td><a href="${
//                           props.link
//                         }" data-id="react-email-button" target="_blank" style="line-height:100%;text-decoration:none;display:inline-block;max-width:100%;padding:12px 20px;border-radius:0.25rem;background-color:rgb(39,39,42);text-align:center;font-size:12px;font-weight:600;color:rgb(255,255,255);text-decoration-line:none"><span></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:9px">${
//     props.callToActionTitle
//   }</span><span></span></a></td>
//                       </tr>
//                     </tbody>
//                   </table>
//                   <hr data-id="react-email-hr" style="width:100%;border:none;border-top:1px solid #eaeaea" />
//                   <table align="center" width="100%" data-id="__react-email-container" role="presentation" cellSpacing="0" cellPadding="0" border="0" style="max-width:37.5em;margin:auto;display:flex;width:100%;align-items:center;justify-content:center;gap:0.5rem;border-radius:0.25rem;padding:0.5rem;font-size:0.75rem;line-height:1rem;color:rgb(82,82,91)">
//                     <tbody>
//                       <tr style="width:100%">
//                         <td>
//                           <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation">
//                             <tbody>
//                               <tr>
//                                 <td></td>
//                                 <td data-id="__react-email-column"><img data-id="react-email-img" alt="logo" src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/android-launchericon-48-48.png" width="24" height="24" style="display:block;outline:none;border:none;text-decoration:none" /><span>War Manager Cloud Service</span></td>
//                               </tr>
//                             </tbody>
//                           </table>
//                           <p data-id="react-email-text" style="font-size:0.75rem;line-height:1rem;margin:16px 0;color:rgb(113,113,122)">This email was intended for <a data-id="react-email-link" target="_blank" style="color:#067df7;text-decoration:none">${
//                             props.recipient
//                           }</a> by War Manager from Jr &amp; Company Roofing Contractors. If you believe you have received this message in error, please dispose this message immediately and reach out to support at <span style="color:rgb(39,39,42)"><a data-id="react-email-link" target="_blank" style="color:#067df7;text-decoration:none">taylor.howell@jrcousa.com</a></span>. Thank you for your understanding.</p>
//                           <table align="center" width="100%" data-id="react-email-section" border="0" cellPadding="0" cellSpacing="0" role="presentation">
//                             <tbody>
//                               <tr>
//                                 <td></td>
//                                 <td data-id="__react-email-column">
//                                   <p data-id="react-email-text" style="font-size:0.75rem;line-height:1rem;margin:16px 0">Jr &amp; Company Roofing Contractors <br />1201 W 31st St, Kansas City, MO 64108</p>
//                                 </td>
//                                 <td data-id="__react-email-column">
//                                   <p data-id="react-email-text" style="font-size:0.75rem;line-height:1rem;margin:16px 0"><a data-id="react-email-link" target="_blank" style="color:#067df7;text-decoration:none">www.jrcousa.com</a> <br />(816) 587-6148</p>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                         </td>
//                       </tr>
//                     </tbody>
//                   </table>
//                 </td>
//               </tr>
//             </tbody>
//           </table>
//         </td>
//       </tr>
//     </tbody>
//   </table>

// </html>`;
// };
