import { Link, useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { getPostsListings } from "~/models/post.server";
import { useOptionalAdminUser } from "~/utils";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPostsListings>>;
};

export const loader: LoaderFunction = async () => {
  const posts = await getPostsListings();
  return json<LoaderData>({ posts });
};

export default function Posts() {
  const { posts } = useLoaderData<LoaderData>();
  const adminUser = useOptionalAdminUser();
  return (
    <div className="mx-auto max-w-4xl">
      <h1>Posts Page</h1>
      <div>
        <Link className="text-red-700 underline" to="/">
          Back to Main Page
        </Link>
      </div>
      <div>
        {adminUser ? (
          <Link className="text-red-700 underline" to="admin">
            Admin
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-4">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={post.id}
                  prefetch="intent"
                  className="text-blue-600 underline"
                >
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
