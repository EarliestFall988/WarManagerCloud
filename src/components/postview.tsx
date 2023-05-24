import Link from "next/link";
import type { RouterOutputs } from "~/utils/api";

import Image from "next/image";
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export const PostView = (props: PostWithUser) => {
  const { post, author } = props;

  if (author.email == null) author.email = "unknown";

  return (
    <div key={post.id} className="flex  gap-3 border-b border-slate-400 p-4">
      <Image
        src={author.profilePicture}
        alt={`${author.email}'s profile picture`}
        className="h-12 w-12 rounded-full"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="text-slate-300">
          <Link href={`/@${author.email}`}>
            <span className="mr-1 font-semibold">{`@${author.email}`}</span>
          </Link>
          ·
          <Link href={`/post/${post.id}`}>
            <span className="ml-1 font-thin">
              {dayjs(post.createdAt).fromNow()}
            </span>
          </Link>
        </div>
        <span className="text-lg">{post.content}</span>
      </div>
    </div>
  );
};
