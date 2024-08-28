import { prisma } from "~/db.server";
import { Post } from "@prisma/client";

export type { Post };

export async function getPosts() {
  return prisma.post.findMany();
}

export async function getPostsListings() {
  return prisma.post.findMany({
    select: {
      id: true,
      title: true,
    },
  });
}

export async function getPost(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export async function createPost(
  post: Pick<Post, "id" | "title" | "markdown">,
) {
  return prisma.post.create({ data: post });
}

export async function updatePost(
  id: string,
  post: Pick<Post, "id" | "title" | "markdown">,
) {
  return prisma.post.update({ data: post, where: { id } });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}
