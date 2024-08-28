import {
  ActionFunction,
  json,
  LoaderFunction,
  redirect,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
  isRouteErrorResponse,
  Link,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "~/models/post.server";
import type { Post } from "~/models/post.server";
import { requireAdminUser } from "~/session.server";
import { useState } from "react";

type LoaderData = {
  post?: Post;
};

type ActionData = {
  errors?: {
    id?: string;
    title?: string;
    markdown?: string;
  };
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdminUser(request);

  invariant(params.id, "id is required");

  if (params.id === "new") {
    return json<LoaderData>({});
  }
  const post = await getPost(params.id);
  if (!post) {
    throw new Response("Not found", { status: 404 });
  }
  return json<LoaderData>({ post });
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdminUser(request);
  const formData = await request.formData();
  const id = formData.get("id");
  const title = formData.get("title");
  const markdown = formData.get("markdown");
  const intent = formData.get("intent");

  if (typeof id !== "string" || id.length === 0) {
    return json<ActionData>(
      { errors: { id: "Id is required" } },
      { status: 400 },
    );
  }

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 },
    );
  }

  if (typeof markdown !== "string" || markdown.length === 0) {
    return json<ActionData>(
      { errors: { markdown: "Markdown is required" } },
      { status: 400 },
    );
  }

  if (intent === "delete") {
    await deletePost(id);
    return redirect("/posts/admin");
  }

  if (params.id === "new") {
    await createPost({ id, title, markdown });
  } else {
    await updatePost(id, { id, title, markdown });
  }
  return redirect("/posts/admin");
};

export default function AdminNewPostRoute() {
  const loader = useLoaderData() as LoaderData;
  const action = useActionData() as ActionData;
  const nav = useNavigation();
  const isSubmiting = Boolean(nav.state !== "idle");
  const isNewPost = !loader.post;

  const [UpdateBtnClicked, updateBtnClicked] = useState(false);
  const [DeleteBtnClicked, deleteBtnClicked] = useState(false);

  const isUpdating = UpdateBtnClicked && isSubmiting;
  const isDeleting = DeleteBtnClicked && isSubmiting;

  return (
    <Form
      method="post"
      key={loader.post?.id ?? "new"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        width: "100%",
      }}
    >
      <div>
        <label className="flex w-full flex-col gap-1">
          <span>
            Id:{" "}
            {action?.errors?.id ? (
              <em className="text-red-700">{action?.errors.id}</em>
            ) : null}
          </span>
          <input
            name="id"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            defaultValue={loader.post?.id}
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>
            Title:{" "}
            {action?.errors?.title ? (
              <em className="text-red-700">{action?.errors.title}</em>
            ) : null}
          </span>
          <input
            name="title"
            className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
            defaultValue={loader.post?.title}
          />
        </label>
      </div>

      <div>
        <label className="flex w-full flex-col gap-1">
          <span>
            Markdown:{" "}
            {action?.errors?.markdown ? (
              <em className="text-red-700">{action?.errors.markdown}</em>
            ) : null}
          </span>
          <textarea
            name="markdown"
            rows={8}
            className="w-full flex-1 rounded-md border-2 border-blue-500 py-2 px-3 text-lg leading-6"
            defaultValue={loader.post?.markdown}
          />
        </label>
      </div>

      <div className="flex justify-eng gap-4">
        {isNewPost ? null : (
          <button
            type="submit"
            name="intent"
            value="delete"
            disabled={isDeleting || isUpdating}
            onClick={() => deleteBtnClicked(true)}
            className="rounded bg-red-500 py-2 px-4 text-white hover:bg-red-600 focus:bg-red-400"
          >
            {!isNewPost ? (isDeleting ? "Deleting..." : "Delete") : null}
          </button>
        )}

        <button
          type="submit"
          name="intent"
          value="update"
          disabled={isUpdating || isDeleting}
          onClick={() => updateBtnClicked(true)}
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
        >
          {isNewPost ? (isUpdating ? "Creating..." : "Save") : null}
          {isNewPost ? null : isUpdating ? "Updating..." : "Update"}
        </button>
      </div>
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <>
        <div>Page not found!</div>
        <Link className="underline text-blue-600" to="/posts/admin">
          Back to safety
        </Link>
      </>
    );
  }
}
