"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import connectToDB from "../mongoose";

interface CreateThreadParams {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: CreateThreadParams) {
  try {
    await connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // update user model by pushing this thread to the current author
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    // revalidation is done to update everything immediately
    revalidatePath(path);
  } catch (err: any) {
    console.log(`Failed to create a new thread ${err.message}`);
    throw new Error(`Failed to create a new thread: ${err.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {
    await connectToDB();
    // calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;
    // fetch threads that have no parents (i.e top level threads) with pageNumber and pageSize limit
    const threads = await Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount) // skip is before limit, this order is necessary
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    // Count the total number of top-level threads i.e., threads that are not comments.
    const totalThreadsCount = await Thread.countDocuments({
      parentId: { $in: [null, undefined] },
    });

    const isNext = totalThreadsCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (err: any) {
    console.log(`Failed to fetch threads ${err.message}`);
    throw new Error(`Failed to fetch threads: ${err.message}`);
  }
}

// TODO: populate community
export async function fetchThreadById(threadId: string) {
  try {
    await connectToDB();
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children", // Populate the children field
        populate: [
          {
            path: "author", // Populate the author field within children
            model: User,
            select: "_id id name parentId image", // Select only _id and username fields of the author
          },
          {
            path: "children", // Populate the children field within children
            model: Thread, // The model of the nested children (assuming it's the same "Thread" model)
            populate: {
              path: "author", // Populate the author field within nested children
              model: User,
              select: "_id id name parentId image", // Select only _id and username fields of the author
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (err: any) {
    console.log(`Failed to fetch thread by id ${err.message}`);
    throw new Error(`Failed to fetch thread by id: ${err.message}`);
  }
}

interface AddCommentToThreadProps {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: AddCommentToThreadProps) {
  try {
    // connection to DB
    await connectToDB();

    // create a new thread with commentText and save that
    const newThreadComment = await Thread.create({
      text: commentText,
      author: userId,
      parentId: threadId, // Set the parentId to the original thread's ID
    });

    // find thread with threadId and update it by pushing a new thread comment
    const thread = await Thread.findByIdAndUpdate(threadId, {
      $push: { children: newThreadComment._id },
    });
    revalidatePath(path);
  } catch (err: any) {
    console.log(`Failed to add comment to a thread ${err.message}`);
    throw new Error(`Failed to add comment to a thread ${err.message}`);
  }
}
