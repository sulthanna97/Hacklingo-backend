// we import a function that we wrote to create a new instance of Apollo Server
import fs from "fs";
import app from "../app.js";

// we'll use supertest to test our server
import request from "supertest";
const newUserTestData = JSON.parse(
  fs.readFileSync("__test__/testData/userTestData.json", "utf-8")
);
const newForumTestData = JSON.parse(
  fs.readFileSync("__test__/testData/forumTestData.json", "utf-8")
);
const newPostTestData = JSON.parse(
  fs.readFileSync("__test__/testData/postTestData.json", "utf-8")
);
const newCommentTestData = JSON.parse(
  fs.readFileSync("__test__/testData/commentTestData.json", "utf-8")
);
import User from "../models/User.js";
import Post from "../models/Post";
import Forum from "../models/Forum.js";
import Comment from "../models/Comment.js";

let userId = "";
let forumId = "";
let postId = "";
let commentId = "";
let dummyUserId = "";
// before the tests we spin up a new Apollo Server
beforeAll(async () => {
  const newDummyUser = new User({
    username: "test dummy",
    email: "test_dummy@mail.com",
    password: "Test123",
    nativeLanguage: "Indonesian/Bahasa Indonesia",
    targetLanguage: ["Indonesian/Bahasa Indonesia", "English"],
    role: "regular",
  });
  await newDummyUser.save();
  dummyUserId = newDummyUser._id;
});

// after the tests we'll stop the server
afterAll(async () => {
  await Forum.deleteMany();
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();
});

describe("insert new forums", () => {
  describe("successful inserts", () => {
    it.only("should return inserted Ids after success", async () => {
      const { body, status } = await request(app)
        .post("/forums")
        .send(newForumTestData);
      const response = body;
      expect(status).toBe(201);
      expect(response).toHaveProperty("forums");
      expect(response).toHaveProperty("message");
      expect(response.forums).toHaveProperty("0");
      forumId = response.forums["0"].toString();
    });
  });

  describe("failed inserts", () => {
    it.only("should return error after failure due to duplicating names", async () => {
      const { body, status } = await request(app)
        .post("/forums")
        .send(newForumTestData);
      const response = body;
      expect(status).toBe(400);
      expect(response).toHaveProperty("message");
      expect(response.message).toBe("Forum name already exists");
    });
  });
});

describe("insert new User", () => {
  describe("successful inserts", () => {
    it.only("should return a new user after success", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[0].input);
      const newUser = body;
      userId = newUser._id;
      expect(status).toBe(201);
      expect(newUser).toHaveProperty("_id");
      expect(newUser).toHaveProperty("password");
      expect(newUser).toHaveProperty("email");
      expect(newUser).toHaveProperty("role");
      expect(newUser.role).toBe("regular");
    });

    it("should return a new user after success with image", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[1].input);
      const newUser = body;
      expect(status).toBe(201);
      expect(newUser).toHaveProperty("_id");
      expect(newUser).toHaveProperty("password");
      expect(newUser).toHaveProperty("email");
      expect(newUser).toHaveProperty("profileImageUrl");
      expect(newUser).toHaveProperty("role");
      expect(newUser).toHaveProperty("profileImageUrl");
      expect(newUser.role).toBe("regular");
    });
  });

  describe("failed inserts", () => {
    it.only("should return error with input without email", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[2].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("Email is required");
    });

    it.only("should return error with input without password", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[3].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("Password is required");
    });

    it.only("should return error with input without proper role", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[4].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe(
        "Role must be either 'regular' or 'moderator'"
      );
    });

    it.only("should return error with input without proper native language", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[5].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe(
        "Native language is not in any of the options"
      );
    });

    it.only("should return error with duplicate input", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[6].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("This username/email has been taken");
    });

    it.only("should return error with empty username", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[7].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("Username is required");
    });

    it.only("should return error with empty email", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[8].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("Email is required");
    });

    it.only("should return error with empty password", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[9].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe("Password is required");
    });

    it.only("should return error with password that didnt match regex", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[10].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe(
        "Password has to have at least 1 number and 1 capital letter"
      );
    });

    it.only("should return error with target language that doesn't pass array", async () => {
      const { body, status } = await request(app)
        .post("/register")
        .send(newUserTestData[11].input);
      const newUser = body;
      expect(status).toBe(400);
      expect(newUser).toHaveProperty("message");
      expect(newUser.message).toBe(
        "Target language is not in any of the options"
      );
    });
  });
});

describe("insert new Post", () => {
  // this is the query for our test

  describe("successful inserts", () => {
    it.only("should return a new post after success", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[0].input, forumId });
      const newPost = body;
      postId = newPost._id;
      expect(status).toBe(201);
      expect(newPost).toHaveProperty("_id");
      expect(newPost).toHaveProperty("title");
      expect(newPost).toHaveProperty("content");
      expect(newPost).toHaveProperty("userId");
      expect(newPost).toHaveProperty("forumId");
      expect(newPost.title).toBe("null");
    });

    it("should return a new post after success with image", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[1].input, forumId });
      const newPost = body;
      expect(status).toBe(201);
      expect(newPost).toHaveProperty("_id");
      expect(newPost).toHaveProperty("title");
      expect(newPost).toHaveProperty("content");
      expect(newPost).toHaveProperty("userId");
      expect(newPost).toHaveProperty("forumId");
      expect(newPost.title).toBe("null");
    });
  });

  describe("failed inserts", () => {
    it.only("should return an error with input without userId", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .send({ ...newPostTestData[2].input, forumId });
      const newPost = body;
      expect(status).toBe(401);
      expect(newPost).toHaveProperty("message");
      expect(newPost.message).toBe("You do not have access to this action");
    });

    it.only("should return an error with input without forumId", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[3].input });
      const newPost = body;
      expect(status).toBe(400);
      expect(newPost).toHaveProperty("message");
      expect(newPost.message).toBe("Forum Id is required");
    });

    it.only("should return an error with input without title", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[4].input, forumId });
      const newPost = body;
      expect(status).toBe(400);
      expect(newPost).toHaveProperty("message");
      expect(newPost.message).toBe("Title is required");
    });

    it.only("should return an error with input without content", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[5].input, userId, forumId });
      const newPost = body;
      expect(status).toBe(400);
      expect(newPost).toHaveProperty("message");
      expect(newPost.message).toBe("Content is required");
    });

    it.only("should return an error with input title above 120 characters", async () => {
      const { body, status } = await request(app)
        .post("/posts")
        .set("userid", userId)
        .send({ ...newPostTestData[6].input, userId, forumId });
      const newPost = body;
      expect(status).toBe(400);
      expect(newPost).toHaveProperty("message");
      expect(newPost.message).toBe("Max title length is 120 characters");
    });
  });
});

describe("insert new Comment", () => {
  describe("successful inserts", () => {
    it.only("should return a new comment after success", async () => {
      const { body, status } = await request(app)
        .post("/comments")
        .set("userid", userId)
        .send({ ...newCommentTestData[0].input, postId });
      const newComment = body;
      commentId = newComment._id;
      expect(status).toBe(201);
      expect(newComment).toHaveProperty("_id");
      expect(newComment).toHaveProperty("content");
      expect(newComment).toHaveProperty("userId");
      expect(newComment).toHaveProperty("postId");
      expect(newComment.content).toBe("balesan lorem ipsum solor der amet");
    });
  });

  describe("failed inserts", () => {
    it.only("should return an error with input without userId", async () => {
      const { body, status } = await request(app)
        .post("/comments")
        .send({ ...newCommentTestData[1].input, postId });
      const newComment = body;
      expect(status).toBe(401);
      expect(newComment).toHaveProperty("message");
      expect(newComment.message).toBe("You do not have access to this action");
    });

    it.only("should return an error with input without postId", async () => {
      const { body, status } = await request(app)
        .post("/comments")
        .set("userid", userId)
        .send({ ...newCommentTestData[2].input });
      const newComment = body;
      expect(status).toBe(400);
      expect(newComment).toHaveProperty("message");
      expect(newComment.message).toBe("Post Id is required");
    });

    it.only("should return an error with input without content", async () => {
      const { body, status } = await request(app)
        .post("/comments")
        .set("userid", userId)
        .send({ ...newCommentTestData[3].input, postId });
      const newComment = body;
      expect(status).toBe(400);
      expect(newComment).toHaveProperty("message");
      expect(newComment.message).toBe("Content is required");
    });

    it.only("should return an error with empty content", async () => {
      const { body, status } = await request(app)
        .post("/comments")
        .set("userid", userId)
        .send({ ...newCommentTestData[4].input, postId });
      const newComment = body;
      expect(status).toBe(400);
      expect(newComment).toHaveProperty("message");
      expect(newComment.message).toBe("Content is required");
    });
  });
});

describe("update User by Id", () => {
  // this is the query for our test

  describe("successful update", () => {
    it.only("should return the updated user after success", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "Indonesian/Bahasa Indonesia",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(200);
      expect(updatedUser).toHaveProperty("_id");
      expect(updatedUser).toHaveProperty("email");
      expect(updatedUser).toHaveProperty("role");
      expect(updatedUser).toHaveProperty("username");
      expect(updatedUser).toHaveProperty("nativeLanguage");
      expect(updatedUser).toHaveProperty("targetLanguage");
      expect(updatedUser.username).toBe("test edit");
      expect(updatedUser.nativeLanguage).toBe("Indonesian/Bahasa Indonesia");
      expect(updatedUser.targetLanguage).toHaveLength(2);
      expect(updatedUser.targetLanguage).toContain("German/Deutsch");
    });

    it("should return the updated user after success with image", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "Indonesian/Bahasa Indonesia",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(200);
      expect(updatedUser).toHaveProperty("_id");
      expect(updatedUser).toHaveProperty("email");
      expect(updatedUser).toHaveProperty("role");
      expect(updatedUser).toHaveProperty("username");
      expect(updatedUser).toHaveProperty("nativeLanguage");
      expect(updatedUser).toHaveProperty("targetLanguage");
      expect(updatedUser).toHaveProperty("profileImageUrl");
      expect(updatedUser.username).toBe("test edit");
      expect(updatedUser.nativeLanguage).toBe("Indonesian/Bahasa Indonesia");
      expect(updatedUser.targetLanguage).toHaveLength(2);
      expect(updatedUser.targetLanguage).toContain("German/Deutsch");
    });
  });

  describe("failed updates", () => {
    it.only("should return error with input without username", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "",
        password: "Test123Edit",
        nativeLanguage: "Indonesian/Bahasa Indonesia",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(400);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe("Username is required");
    });

    it.only("should return error with input without password", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "",
        nativeLanguage: "Indonesian/Bahasa Indonesia",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(400);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe("Password is required");
    });

    it.only("should return error with input without nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "TestEdit123",
        nativeLanguage: "",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(400);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe("Native language is required");
    });

    it.only("should return error with input with improper nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "TestEdit123",
        nativeLanguage: "kjlksajfkslf",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(400);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe(
        "Native language is not in any of the options"
      );
    });

    it.only("should return error with input with improper targetLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "TestEdit123",
        nativeLanguage: "English",
        targetLanguage: ["German/Deutsch", "fjlksjflkjsflkj"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(400);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe(
        "Target language is not in any of the options"
      );
    });

    it.only("should return error with input with invalid current user", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "TestEdit123",
        nativeLanguage: "English",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const { body, status } = await request(app)
        .put(`/users/${userId}`)
        .set("userid", dummyUserId)
        .send(updateInput);
      const updatedUser = body;
      expect(status).toBe(403);
      expect(updatedUser).toHaveProperty("message");
      expect(updatedUser.message).toBe(
        "You are forbidden from doing this action"
      );
    });
  });
});

describe("update Post by Id", () => {
  describe("successful update", () => {
    it.only("should return the updated post after success", async () => {
      const updateInput = {
        ...newPostTestData[0].input,
        content: "lorem ipsum edit",
      };
      const { body, status } = await request(app)
        .put(`/posts/${postId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedComment = body;
      expect(status).toBe(200);
      expect(updatedComment).toHaveProperty("_id");
      expect(updatedComment).toHaveProperty("content");
      expect(updatedComment.content).toBe("lorem ipsum edit");
    });
  });

  describe("failed updates", () => {
    it.only("should return error with empty content", async () => {
      const updateInput = {
        ...newPostTestData[0].input,
        content: "",
      };
      const { body, status } = await request(app)
        .put(`/posts/${postId}`)
        .set("userid", userId)
        .send(updateInput);
      const updaedPost = body;
      expect(status).toBe(400);
      expect(updaedPost).toHaveProperty("message");
      expect(updaedPost.message).toBe("Content is required");
    });

    it.only("should return error with input with invalid current user", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        content: "lorem ipsum edit 2",
      };
      const { body, status } = await request(app)
        .put(`/posts/${postId}`)
        .set("userid", dummyUserId)
        .send(updateInput);
      const updatedPost = body;
      expect(status).toBe(403);
      expect(updatedPost).toHaveProperty("message");
      expect(updatedPost.message).toBe(
        "You are forbidden from doing this action"
      );
    });
  });
});

describe("update Comment by Id", () => {
  describe("successful update", () => {
    it.only("should return the updated comment after success", async () => {
      const updateInput = {
        ...newCommentTestData[0].input,
        forumId,
        content: "lorem ipsum edit",
      };
      const { body, status } = await request(app)
        .put(`/comments/${commentId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedComment = body;
      expect(status).toBe(200);
      expect(updatedComment).toHaveProperty("_id");
      expect(updatedComment).toHaveProperty("content");
      expect(updatedComment.content).toBe("lorem ipsum edit");
    });
  });

  describe("failed updates", () => {
    it.only("should return error with empty content", async () => {
      const updateInput = {
        ...newCommentTestData[0].input,
        forumId,
        content: "",
      };
      const { body, status } = await request(app)
        .put(`/comments/${commentId}`)
        .set("userid", userId)
        .send(updateInput);
      const updatedComment = body;
      expect(status).toBe(400);
      expect(updatedComment).toHaveProperty("message");
      expect(updatedComment.message).toBe("Content is required");
    });
  });
});

describe("find Users based on their native language", () => {
  describe("successful fetch", () => {
    it.only("should return array of users after success", async () => {
      const nativeLanguage = newUserTestData[0].input.nativeLanguage;
      const { body, status } = await request(app)
        .get(`/users`)
        .query({ nativeLanguage })
        .set("userid", userId);
      const users = body;
      expect(status).toBe(200);
      expect(users).toHaveLength(2);
      expect(users[0]).toHaveProperty("_id");
      expect(users[0]).toHaveProperty("username");
      expect(users[0]).toHaveProperty("email");
      expect(users[0].nativeLanguage).toBe(nativeLanguage);
    });
  });

  describe("zero fetch", () => {
    it.only("should return error with empty content", async () => {
      const nativeLanguage = "English";
      const { body, status } = await request(app)
        .get(`/users`)
        .query({ nativeLanguage })
        .set("userid", userId);
      const users = body;
      expect(status).toBe(200);
      expect(typeof users).toBe("object");
      expect(users).toHaveLength(0);
    });
  });
});

describe("find User based on their id", () => {
  describe("successful fetch", () => {
    it.only("should return array of users after success", async () => {
      const { body, status } = await request(app)
        .get(`/users/${userId}`)
        .set("userid", userId);
      const user = body;
      expect(status).toBe(200);
      expect(typeof user).toBe("object");
      expect(user).toHaveProperty("_id");
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("comments");
      expect(user).toHaveProperty("posts");
      expect(user.posts).toHaveLength(1);
      expect(user.posts[0]).toHaveProperty("content");
      expect(user.comments).toHaveLength(1);
      expect(user.comments[0]).toHaveProperty("content");
    });
  });

  describe("fetch with nonexistant id", () => {
    it.only("should return array of users after success", async () => {
      const { body, status } = await request(app)
        .get(`/users/kuashfkahfhsf`)
        .set("userid", userId);
      const user = body;
      expect(status).toBe(404);
      expect(user).toHaveProperty("message");
      expect(user.message).toBe("Data not found");
    });
  });
});

describe("find Post based on their id", () => {
  describe("successful fetch", () => {
    it.only("should return post after success", async () => {
      const { body, status } = await request(app)
        .get(`/posts/${postId}`)
        .set("userid", userId);
      const post = body;
      expect(status).toBe(200);
      expect(typeof post).toBe("object");
      expect(post).toHaveProperty("_id");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("forumId");
      expect(post).toHaveProperty("userId");
      expect(post).toHaveProperty("comments");
      expect(post.comments).toHaveLength(1);
      expect(post.comments[0]).toHaveProperty("content");
      expect(post._id).toBe(postId);
    });
  });

  describe("fetch with nonexistant id", () => {
    it.only("should return error with wrong id", async () => {
      const { body, status } = await request(app)
        .get(`/posts/jakfjslkfkljfsjfljfs`)
        .set("userid", userId);
      const post = body;
      expect(status).toBe(404);
      expect(post).toHaveProperty("message");
      expect(post.message).toBe("Data not found");
    });
  });
});

describe("find Comment based on their id", () => {
  describe("successful fetch", () => {
    it.only("should return comment after success", async () => {
      const { body, status } = await request(app)
        .get(`/comments/${commentId}`)
        .set("userid", userId);
      const comment = body;
      expect(status).toBe(200);
      expect(typeof comment).toBe("object");
      expect(comment).toHaveProperty("_id");
      expect(comment).toHaveProperty("content");
      expect(comment).toHaveProperty("postId");
      expect(comment).toHaveProperty("userId");
      expect(comment._id).toBe(commentId);
    });
  });

  describe("fetch with nonexistant id", () => {
    it.only("should return array of users after success", async () => {
      const { body, status } = await request(app)
        .get(`/comments/14812904809248dvsd`)
        .set("userid", userId);
      const comment = body;
      expect(status).toBe(404);
      expect(comment).toHaveProperty("message");
      expect(comment.message).toBe("Data not found");
    });
  });
});

describe("find All Forums", () => {
  describe("successful fetch", () => {
    it.only("should return array of forums after success", async () => {
      const { body, status } = await request(app)
        .get(`/forums`)
        .set("userid", userId);
      const forums = body;
      expect(status).toBe(200);
      expect(typeof forums).toBe("object");
      expect(forums).toHaveLength(7);
      expect(forums[0]).toHaveProperty("_id");
      expect(forums[0]).toHaveProperty("name");
      expect(forums[0].name).toBe("English");
    });
  });
});

describe("find Forum By Id", () => {
  describe("successful fetch", () => {
    it.only("should return array of forums after success", async () => {
      const { body, status } = await request(app)
        .get(`/forums/${forumId}`)
        .set("userid", userId);
      const forum = body;
      expect(typeof forum).toBe("object");
      expect(forum).toHaveProperty("_id");
      expect(forum).toHaveProperty("name");
      expect(forum).toHaveProperty("posts");
      expect(forum.posts).toHaveLength(1);
      expect(forum.posts[0]).toHaveProperty("_id");
      expect(forum.posts[0]).toHaveProperty("content");
    });
  });

  describe("fetch with nonexistant id", () => {
    it.only("should return error with nonexistatnt id", async () => {
      const { body, status } = await request(app)
        .get(`/forums/kljflsjfjsfjsdfl`)
        .set("userid", userId);
      const forum = body;
      expect(status).toBe(404);
      expect(forum).toHaveProperty("message");
      expect(forum.message).toBe("Data not found");
    });
  });
});

describe("delete Comment by Id", () => {
  describe("successful delete", () => {
    it.only("should return a response message on success", async () => {
      const { body, status } = await request(app)
        .delete(`/comments/${commentId}`)
        .set("userid", userId);
      const deletedComment = body;
      expect(status).toBe(200);
      expect(typeof deletedComment).toBe("object");
      expect(deletedComment).toHaveProperty("message");
      expect(deletedComment.message).toBe(
        `Comment with id ${commentId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it.only("should return an error message on nonexistatnt id", async () => {
      const { body, status } = await request(app)
        .delete(`/comments/lkjfskjfsjfjsa`)
        .set("userid", userId);
      const deletedComment = body;
      expect(status).toBe(404);
      expect(deletedComment).toHaveProperty("message");
      expect(deletedComment.message).toBe("Data not found");
    });
  });
});

describe("delete Post by Id", () => {
  describe("successful delete", () => {
    it.only("should return a response message on success", async () => {
      const { body, status } = await request(app)
        .delete(`/posts/${postId}`)
        .set("userid", userId);
      const deletedPost = body;
      expect(status).toBe(200);
      expect(typeof deletedPost).toBe("object");
      expect(deletedPost).toHaveProperty("message");
      expect(deletedPost.message).toBe(
        `Post with id ${postId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it.only("should return an error message on nonexistatnt id", async () => {
      const { body, status } = await request(app)
        .delete(`/posts/lkjfskjfsjfjsa`)
        .set("userid", userId);
      const deletedPost = body;
      expect(status).toBe(404);
      expect(deletedPost).toHaveProperty("message");
      expect(deletedPost.message).toBe("Data not found");
    });
  });
});

describe("delete User by Id", () => {
  describe("successful delete", () => {
    it.only("should return a response message on success", async () => {
      const { body, status } = await request(app)
        .delete(`/users/${userId}`)
        .set("userid", userId);
      const deletedUser = body;
      expect(status).toBe(200);
      expect(typeof deletedUser).toBe("object");
      expect(deletedUser).toHaveProperty("message");
      expect(deletedUser.message).toBe(
        `User with id ${userId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it.only("should return an error message on nonexistatnt id", async () => {
      const { body, status } = await request(app)
        .delete(`/users/lkjfskjfsjfjsa`)
        .set("userid", dummyUserId);
      const deletedUser = body;
      expect(status).toBe(404);
      expect(deletedUser).toHaveProperty("message");
      expect(deletedUser.message).toBe("Data not found");
    });
  });
});

describe("delete Forum by Id", () => {
  describe("successful delete", () => {
    it.only("should return a response message on success", async () => {
      const { body, status } = await request(app)
        .delete(`/forums/${forumId}`)
        .set("userid", dummyUserId);
      const deletedForum = body;
      expect(status).toBe(200);
      expect(typeof deletedForum).toBe("object");
      expect(deletedForum).toHaveProperty("message");
      expect(deletedForum.message).toBe(
        `Forum with id ${forumId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it.only("should return an error message on nonexistatnt id", async () => {
      const { body, status } = await request(app)
        .delete(`/forums/asmlkasfkaSKAD`)
        .set("userid", dummyUserId);
      const deletedForum = body;
      expect(status).toBe(404);
      expect(typeof deletedForum).toBe("object");
      expect(deletedForum).toHaveProperty("message");
      expect(deletedForum.message).toBe("Data not found");
    });
  });
});