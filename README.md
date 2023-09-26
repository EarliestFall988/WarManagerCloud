<p align="center">
  <picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/72.png">
  <img src="https://warmanagerstorage.blob.core.windows.net/wmcontainerstorage/Installer%20Website/PWA%20Icons/72.png" width="72" height="72" alt="Logo for War Manager">
</picture>
</p>
<h3 align="center">
War Manager
</h3>
<p align="center">
  Smoothly Manage Construction Projects and Coordinate Teams
</p>


This is the War Manager Cloud repository. The PWA is a construction planning hub primarily aimed to support large subcontractors. It provides a simple, predictable user interface that can be manually or 'automagically' propagated with crew members, projects, crew/project plans, and schedules for project managers, superintendents, operators, foremen, and crew members.

This project does include authentication via google or microsoft only, and is not yet rated for critical information like SSIDs, HIPPA (e-PHI), and other high security information. It does however include (or is quickly eligible for) many criteria required by the CMMC and DFARs requirements (but not all).

Currently you must have a jrcousa.com domain email to interact with the web application (except for the landing page).

Note: as of August 2023 we are loosely following the NIST authentication guidelines.

The information provided in this document is meant only to provide users with information and is not legal advice.

## Authors/Contributors To War Manager

- Taylor Howell (EarliestFall988)

If you have questions or comments, contact Taylor @ taylor.howell@jrcousa.com

## License

Apache Open Source License

See: LICENSE for more details

## Stack

- T3 Stack:
  - Typescript
  - Next 13 (pages API)
  - TRPC
  - Prisma
  - Tailwind
  - ZOD
- Clerk
- Radix UI
- Deployed on Vercel
- Upstash (Redis cache for rate limiting)
- Axiom

## Update (8/18/2023)

- War Manager consists of around 14 different services.
- War Manager is moving rapidly from an app into an enterprise grade software tool.
- Users who are using War Manager for work love it.
- Started on the project in the middle of May 2023 and released at the end of July (2 month project - zero to hero).
- Working on version 1.5 with an expected release next week.


(Updated August 18th, 2023)

<div align=center>
<p>Check it out: </p>
<a> https://cloud.dev.warmanager.net </a>
</div>
