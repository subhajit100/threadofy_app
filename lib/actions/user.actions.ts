"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import connectToDB from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

interface UpdateUserParams {
  userId: string;
  bio: string;
  name: string;
  path: string;
  username: string;
  image: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: UpdateUserParams): Promise<void> {
  try {
    await connectToDB();
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );
    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (err: any) {
    throw new Error(`Failed to create/update user ${err.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    await connectToDB();
    const user = await User.findOne({ id: userId });
    // .populate({path: 'communities', model: Community})
    return user;
  } catch (err: any) {
    console.log(`Failed to fetch user ${err.message}`);
    throw new Error(`Failed to fetch user: ${err.message}`);
  }
}

export async function fetchUserThreads(userId: string) {
  try {
    await connectToDB();
    // Find all threads authored by the user with the given userId
    const user = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: [
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name", "image" and "id" fields from the "User" model
          },
        },
      ],
    });
    console.log("user full populated with threads: ", user);
    return user;
  } catch (err: any) {
    console.log(`Failed to fetch user threads ${err.message}`);
    throw new Error(`Failed to fetch user threads : ${err.message}`);
  }
}

interface FetchUsersProps {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}

export async function fetchusers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: FetchUsersProps) {
  try {
    await connectToDB();

    // Calculate the number of users to skip based on the page number and page size.
    const skipAmount = (pageNumber - 1) * pageSize;

    // Create a case-insensitive regular expression for the provided search string.
    const regex = new RegExp(searchString, "i");

    // Create an initial query object to filter users.
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    // If the search string is not empty, add the $or operator to match either username or name fields.
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    // Define the sort options for the fetched users based on createdAt field and provided sort order.
    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    // Count the total number of users that match the search criteria (without pagination).
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    // check if more pages are present
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (err: any) {
    console.log(`Failed to fetch users ${err.message}`);
    throw new Error(`Failed to fetch users : ${err.message}`);
  }
}

export async function getActivities(userId: string) {
  try {
    await connectToDB();
    // find all the threads which is authored by userId
    const threads = await Thread.find({ author: userId });

    // accumulate all the chilren of mapping all these threads
    const childThreads = threads.reduce((acc, thread) => {
      return acc.concat(thread.children);
    }, []);

    // now remove those threads from this children list which are of the current user itself, so you will only get replies from other users on your threads
    const replies = await Thread.find({
      _id: { $in: childThreads },
      author: { $ne: userId }, // Exclude threads authored by the same user
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (err: any) {
    console.log(`Failed to fetch activity ${err.message}`);
    throw new Error(`Failed to fetch activity : ${err.message}`);
  }
}
