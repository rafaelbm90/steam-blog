import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getPost } from "~/models/post.server";
import { marked } from "marked";

type LoaderData = {
  title: string;
  html: string;
};

export const loader: LoaderFunction = async ({ params }) => {
  const { postId } = params;
  invariant(postId, "postId is required");
  const post = await getPost(postId);
  invariant(post, "post not found");
  const html = await marked(post.markdown);
  return json<LoaderData>({ title: post?.title, html });
};

export default function PostPage() {
  const { title, html } = useLoaderData() as LoaderData;
  return (
    <main className="mx-auto max-w-4xl">
      <h1 className="my-6 border-b-2 text-center text-3xl">{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
