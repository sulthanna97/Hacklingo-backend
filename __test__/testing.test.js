const newUserTestData = require("./userTestData.json");
const newForumTestData = require("./forumTestData.json");
const newPostTestData = require("./postTestData.json");
const newCommentTestData = require("./commentTestData.json");
const { request, gql } = require("graphql-request");
const User = require("../models/User.js");
const Post = require("../models/Post");
const Forum = require("../models/Forum.js");
const Comment = require("../models/Comment.js");

let userId = "";
let forumId = "";
let postId = "";

beforeAll(async () => {
  const forums = await Forum.bulkWrite(
    newForumTestData.map((el) => ({
      insertOne: {
        document: el,
      },
    })),
    { ordered: true }
  );
  forumId = forums.insertedIds["0"].toString();
});

afterAll(async () => {
  await Forum.deleteMany();
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();
});

describe("insert new User", () => {
  const insertUserQuery = gql`
    mutation InsertNewUser($input: SignUpInput!) {
      insertNewUser(input: $input) {
        _id
        username
        email
        password
        role
        nativeLanguage
        targetLanguage
      }
    }
  `;

  describe("successful insertions", () => {
    it("should return the newUser after insertion", async () => {
      const response = await request(
        "http://localhost:4000/graphql",
        insertUserQuery,
        newUserTestData[0]
      );
      userId = response.insertNewUser._id;
      expect(typeof response).toBe("object");
      expect(response.insertNewUser).toHaveProperty("_id");
    });
  });

  // Error Tests

  describe("failed insertions", () => {
    it("should return error with input without email", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[1]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "User validation failed: email: Email is required"
        );
      }
    });

    it("should return error with input without password", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[2]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "User validation failed: password: Password is required"
        );
      }
    });

    it("should return error with input role without proper role", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[3]
        );
      } catch (err) {
        console.log(err.response.errors);
        expect(err.response.errors[0].message).toBe(
          "User validation failed: role: Role must be either 'regular' or 'moderator'"
        );
      }
    });

    it("should return error with input role without proper native language", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[4]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "User validation failed: nativeLanguage: Native language is not in any of the options"
        );
      }
    });

    it("should return error with duplicate username", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[5]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(/E11000/);
      }
    });

    it("should return error with empty username", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[6]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: username: Username is required"
        );
      }
    });

    it("should return error with empty email", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[7]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: email: Email is required"
        );
      }
    });

    it("should return error with empty password", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[8]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: password: Password is required"
        );
      }
    });

    it("should return error with password that didnt match regex", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[9]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: password: Password has to have at least 1 number and 1 capital letter"
        );
      }
    });

    it("should return error with target language that doesn't pass array", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[10]
        );
      } catch (err) {
        expect(err.response.errors[0].message).toMatch(
          /Target language is not in any of the options/
        );
      }
    });
  });
});

describe("insert new Post", () => {
  const insertPostQuery = gql`
    mutation InsertNewPost($input: PostInput!) {
      insertNewPost(input: $input) {
        _id
        userId
        content
        title
        forumId
        comments {
          _id
          userId
          content
          postId
        }
      }
    }
  `;

  describe("successful insertions", () => {
    it("should return a new Post after success", async () => {
      const postInput = newPostTestData[0];
      postInput.input.userId = userId;
      postInput.input.forumId = forumId; // Should be English
      const response = await request(
        "http://localhost:4000/graphql",
        insertPostQuery,
        postInput
      );
      postId = response.insertNewPost._id;
      expect(typeof response).toBe("object");
      expect(response.insertNewPost).toHaveProperty("_id");
    });
  });

  describe("failed insertions", () => {
    it("should return an error with input without userId", async () => {
      try {
        const postInput = newPostTestData[1];
        postInput.input.forumId = forumId; // Should be English
        const response = await request(
          "http://localhost:4000/graphql",
          insertPostQuery,
          postInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Post validation failed: userId: User Id is required"
        );
      }
    });

    it("should return an error with input without forumId", async () => {
      try {
        const postInput = newPostTestData[2];
        postInput.input.userId = userId;
        const response = await request(
          "http://localhost:4000/graphql",
          insertPostQuery,
          postInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Post validation failed: forumId: Forum Id is required"
        );
      }
    });

    it("should return an error with input without title", async () => {
      try {
        const postInput = newPostTestData[3];
        postInput.input.userId = userId;
        postInput.input.forumId = forumId; // Should be English
        const response = await request(
          "http://localhost:4000/graphql",
          insertPostQuery,
          postInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Post validation failed: title: Title is required"
        );
      }
    });

    it("should return an error with input without content", async () => {
      try {
        const postInput = newPostTestData[4];
        postInput.input.userId = userId;
        postInput.input.forumId = forumId; // Should be English
        const response = await request(
          "http://localhost:4000/graphql",
          insertPostQuery,
          postInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Post validation failed: content: Content is required"
        );
      }
    });

    it("should return an error with input title above 120 characters", async () => {
      try {
        const postInput = newPostTestData[5];
        postInput.input.userId = userId;
        postInput.input.forumId = forumId; // Should be English
        const response = await request(
          "http://localhost:4000/graphql",
          insertPostQuery,
          postInput
        );
        console.log("sampai ke sini");
      } catch (err) {
        console.log(err);
        expect(err.response.errors[0].message).toBe(
          "Post validation failed: title: Max title length is 120 characters"
        );
      }
    });
  });
});

describe("insert new Comment", () => {
  const insertCommentQuery = gql`
    mutation InsertComment($input: CommentInput!) {
      insertComment(input: $input) {
        _id
        userId
        content
        postId
      }
    }
  `;

  describe("successful insertions", () => {
    it("should return a new comment after successful insert", async () => {
      const commentInput = newCommentTestData[0];
      commentInput.input.userId = userId;
      commentInput.input.postId = postId; // Should be English
      const response = await request(
        "http://localhost:4000/graphql",
        insertCommentQuery,
        commentInput
      );
      expect(typeof response).toBe("object");
      expect(response.insertComment).toHaveProperty("_id");
      expect(response.insertComment).toHaveProperty("content");
    });
  });

  describe("failed insertions", () => {
    it("should return an error with input without userId", async () => {
      try {
        const commentInput = newCommentTestData[1];
        commentInput.input.postId = postId;
        const response = await request(
          "http://localhost:4000/graphql",
          insertCommentQuery,
          commentInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Comment validation failed: userId: User Id is required"
        );
      }
    });

    it("should return an error with input without postId", async () => {
      try {
        const commentInput = newCommentTestData[2];
        commentInput.input.userId = userId;
        const response = await request(
          "http://localhost:4000/graphql",
          insertCommentQuery,
          commentInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Comment validation failed: postId: Post Id is required"
        );
      }
    });

    it("should return an error with input without content", async () => {
      try {
        const commentInput = newCommentTestData[3];
        commentInput.input.userId = userId;
        commentInput.input.postId = postId;
        const response = await request(
          "http://localhost:4000/graphql",
          insertCommentQuery,
          commentInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Comment validation failed: content: Content is required"
        );
      }
    });

    it("should return an error with input with empty content", async () => {
      try {
        const commentInput = newCommentTestData[4];
        commentInput.input.userId = userId;
        commentInput.input.postId = postId;
        const response = await request(
          "http://localhost:4000/graphql",
          insertCommentQuery,
          commentInput
        );
      } catch (err) {
        expect(err.response.errors[0].message).toBe(
          "Comment validation failed: content: Content is required"
        );
      }
    });
  });
});

describe("update User by Id", () => {
  const updateUserByIdQuery = gql`
    mutation UpdateUserById($input: SignUpInput!, $updateUserByIdId: String) {
      updateUserById(input: $input, id: $updateUserByIdId) {
        _id
        username
        email
        password
        role
        nativeLanguage
        targetLanguage
      }
    }
  `;

  describe("successful update", () => {
    it("should return the updated user after success", async () => {
      try {
        const userInput = newUserTestData[0];
        // User can only change their username, password, nativelanguage and targetlanguage
        userInput.input.username = "test edit";
        userInput.input.password = "Test123Edit";
        userInput.input.nativeLanguage = "English";
        userInput.input.targetLanguage = [
          "Indonesian/Bahasa Indonesia",
          "English",
          "German/Deutsch",
        ];

        const variables = { ...userInput, updateUserByIdId: userId };
        const response = await request(
          "http://localhost:4000/graphql",
          updateUserByIdQuery,
          variables
        );
        expect(typeof response).toBe("object");
        expect(response.updateUserById).toHaveProperty("_id");
        expect(response.updateUserById).toHaveProperty("username");
        expect(response.updateUserById.username).toBe("test edit");
        expect(response.updateUserById.nativeLanguage).toBe("English");
        expect(response.updateUserById.targetLanguage).toContain(
          "German/Deutsch"
        );
      } catch (err) {
        console.log(err);
      }
    });
  });

  describe("failed update", () => {
    it("should return error with input without username", async () => {
      try {
        const userInput = newUserTestData[0];
        // User can only change their username, password, nativelanguage and targetlanguage
        userInput.input.username = "";
        userInput.input.password = "Test123Edit";
        userInput.input.nativeLanguage = "English";
        userInput.input.targetLanguage = [
          "Indonesian/Bahasa Indonesia",
          "English",
          "German/Deutsch",
        ];

        const variables = { ...userInput, updateUserByIdId: userId };
        const response = await request(
          "http://localhost:4000/graphql",
          updateUserByIdQuery,
          variables
        );
      } catch (err) {
        console.log(err);
        expect(err.response.errors[0].message).toBe(
          "User validation failed: password: Password is required"
        );
      }
    });
  });
});
