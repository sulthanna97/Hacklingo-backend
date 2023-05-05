const newUserTestData = require("./userTestData.json");
const newForumTestData = require("./forumTestData.json");
const { request, gql } = require("graphql-request");
const User = require("../models/User.js");
const Post = require("../models/Post");
const Forum = require("../models/Forum.js");
const Comment = require("../models/Comment.js");

beforeAll(async () => {
  await Forum.bulkWrite(
    newForumTestData.map((el) => ({
      insertOne: {
        document: el,
      },
    })),
    { ordered: true }
  );
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
    it.only("should return the newUser after insertion", async () => {
      const response = await request(
        "http://localhost:4000/graphql",
        insertUserQuery,
        newUserTestData[0]
      );
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
        console.log(err.response.errors);
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
        console.log(err.response.errors);
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: username: Username is required"
        );
      }
    });

    it.only("should return error with empty email", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[7]
        );
      } catch (err) {
        console.log(err.response.errors);
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: email: Email is required"
        );
      }
    });

    it.only("should return error with empty password", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[8]
        );
      } catch (err) {
        console.log(err.response.errors);
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: password: Password is required"
        );
      }
    });

    it.only("should return error with password that didnt match regex", async () => {
      try {
        const response = await request(
          "http://localhost:4000/graphql",
          insertUserQuery,
          newUserTestData[9]
        );
      } catch (err) {
        console.log(err.response.errors);
        expect(err.response.errors[0].message).toMatch(
          "User validation failed: password: Password is required"
        );
      }
    });
    
  });
});
