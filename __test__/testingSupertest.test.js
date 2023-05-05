// we import a function that we wrote to create a new instance of Apollo Server
const createApolloServer = require("../app.js");

// we'll use supertest to test our server
const request = require("supertest");
const newUserTestData = require("./userTestData.json");
const newForumTestData = require("./forumTestData.json");
const newPostTestData = require("./postTestData.json");
const newCommentTestData = require("./commentTestData.json");
const User = require("../models/User.js");
const Post = require("../models/Post");
const Forum = require("../models/Forum.js");
const Comment = require("../models/Comment.js");

let server, url;
let userId = "";
let forumId = "";
let postId = "";
// before the tests we spin up a new Apollo Server
beforeAll(async () => {
  const forums = await Forum.bulkWrite(
    newForumTestData.map((el) => ({
      insertOne: {
        document: el,
      },
    })),
    { ordered: true }
  );
  forumId = forums.insertedIds["0"].toString(); // forumId English
  ({ server, url } = await createApolloServer({ port: 0 }));
});

// after the tests we'll stop the server
afterAll(async () => {
  await Forum.deleteMany();
  await User.deleteMany();
  await Post.deleteMany();
  await Comment.deleteMany();
  await server?.stop();
});

describe("insert new User", () => {
  // this is the query for our test
  const insertNewUserQuery = `
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

  describe("successful inserts", () => {
    it("should return a new user after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[0].input,
          },
        });
      const data = response.body.data.insertNewUser;
      userId = data._id;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("username");
      expect(data).toHaveProperty("email");
      expect(data).toHaveProperty("password");
      expect(data.username).toBe("test");
    });
  });

  describe("failed inserts", () => {
    it("should return error with input without email", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[1].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: email: Email is required"
      );
    });

    it("should return error with input without password", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[2].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: password: Password is required"
      );
    });

    it("should return error with input without proper role", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[3].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: role: Role must be either 'regular' or 'moderator'"
      );
    });

    it("should return error with input without proper native language", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[4].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: nativeLanguage: Native language is not in any of the options"
      );
    });

    it("should return error with duplicate input", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[5].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/E11000/);
    });

    it("should return error with empty username", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[6].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: username: Username is required"
      );
    });

    it("should return error with empty email", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[7].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: email: Email is required"
      );
    });

    it("should return error with empty password", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[8].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: password: Password is required"
      );
    });

    it("should return error with password that didnt match regex", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[9].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "User validation failed: password: Password has to have at least 1 number and 1 capital letter"
      );
    });

    it("should return error with target language that doesn't pass array", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewUserQuery,
          variables: {
            input: newUserTestData[10].input,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Target language is not in any of the options/
      );
    });
  });
});

describe("insert new Post", () => {
  // this is the query for our test
  const insertNewPostQuery = `
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

  describe("successful inserts", () => {
    it("should return a new post after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[0].input,
              userId, // From submitted user earlier
              forumId, // From beforeAll, should be English
            },
          },
        });
      const data = response.body.data.insertNewPost;
      postId = data._id;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("forumId");
      expect(data).toHaveProperty("content");
      expect(data.content).toBe("lorem ipsum solor der amet");
    });
  });

  describe("failed inserts", () => {
    it("should return an error with input without userId", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[1].input,
              // userId, // From submitted user earlier
              forumId, // From beforeAll, should be English
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Post validation failed: userId: User Id is required"
      );
    });

    it("should return an error with input without forumId", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[2].input,
              userId, // From submitted user earlier
              // forumId // From beforeAll, should be English
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Post validation failed: forumId: Forum Id is required"
      );
    });

    it("should return an error with input without title", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[3].input,
              userId, // From submitted user earlier
              forumId, // From beforeAll, should be English
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Post validation failed: title: Title is required"
      );
    });

    it("should return an error with input without content", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[4].input,
              userId, // From submitted user earlier
              forumId, // From beforeAll, should be English
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Post validation failed: content: Content is required"
      );
    });

    it("should return an error with input title above 120 characters", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewPostQuery,
          variables: {
            input: {
              ...newPostTestData[5].input,
              userId, // From submitted user earlier
              forumId, // From beforeAll, should be English
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Post validation failed: title: Max title length is 120 characters"
      );
    });
  });
});

describe("insert new Comment", () => {
  // this is the query for our test
  const insertNewCommentQuery = `
  mutation InsertComment($input: CommentInput!) {
    insertNewComment(input: $input) {
      _id
      userId
      content
      postId
    }
  }
    `;

  describe("successful inserts", () => {
    it("should return a new comment after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewCommentQuery,
          variables: {
            input: {
              ...newCommentTestData[0].input,
              userId, // From submitted user earlier
              postId, // From submitted post earlier
            },
          },
        });
      const data = response.body.data.insertNewComment;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("postId");
      expect(data).toHaveProperty("content");
      expect(data.content).toBe("balesan lorem ipsum solor der amet");
    });
  });

  describe("failed inserts", () => {
    it("should return an error with input without userId", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewCommentQuery,
          variables: {
            input: {
              ...newCommentTestData[1].input,
              // userId, // From submitted user earlier
              postId, // From submitted post earlier
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Comment validation failed: userId: User Id is required"
      );
    });

    it("should return an error with input without postId", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewCommentQuery,
          variables: {
            input: {
              ...newCommentTestData[2].input,
              userId, // From submitted user earlier
              // postId, // From submitted post earlier
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Comment validation failed: postId: Post Id is required"
      );
    });

    it("should return an error with input without content", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewCommentQuery,
          variables: {
            input: {
              ...newCommentTestData[3].input,
              userId, // From submitted user earlier
              postId, // From submitted post earlier
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Comment validation failed: content: Content is required"
      );
    });

    it("should return an error with empty content", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: insertNewCommentQuery,
          variables: {
            input: {
              ...newCommentTestData[4].input,
              userId, // From submitted user earlier
              postId, // From submitted post earlier
            },
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        "Comment validation failed: content: Content is required"
      );
    });
  });
});

describe("update User by Id", () => {
  // this is the query for our test
  const updateUserByIdQuery = `
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
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "English",
        targetLanguage: [
          "German/Deutsch",
          "English",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      const data = response.body.data.updateUserById;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("username");
      expect(data).toHaveProperty("password");
      expect(data).toHaveProperty("nativeLanguage");
      expect(data).toHaveProperty("targetLanguage");
      expect(data.username).toBe("test edit");
      expect(data.password).toBe("Test123Edit");
      expect(data.nativeLanguage).toBe("English");
      expect(data.targetLanguage).toContain("German/Deutsch");
    });
  });

  describe("failed inserts", () => {
    it("should return error with input without username", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "",
        password: "Test123Edit",
        nativeLanguage: "English",
        targetLanguage: [
          "German/Deutsch",
          "English",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Username is required/
      );
    });

    it("should return error with input without password", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "",
        nativeLanguage: "English",
        targetLanguage: [
          "German/Deutsch",
          "English",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Password is required/
      );
    });

    it("should return error with input without nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "",
        targetLanguage: [
          "German/Deutsch",
          "English",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Native language is required/
      );
    });

    it("should return error with input with improper nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "aksjlkjKLKL",
        targetLanguage: [
          "German/Deutsch",
          "English",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      console.log(JSON.parse(response.text).errors[0].message);
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Native language is not in any of the options/
      );
    });

    it("should return error with input with improper nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "English",
        targetLanguage: [
          "German/Deutsch",
          "kfjlksjflkjfjSKF",
        ]
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId
          },
        });
      console.log(JSON.parse(response.text).errors[0].message);
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Target language is not in any of the options/
      );
    });

  });
});
