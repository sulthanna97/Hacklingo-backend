// we import a function that we wrote to create a new instance of Apollo Server
const createApolloServer = require("../app.js");

// we'll use supertest to test our server
const request = require("supertest");
const newUserTestData = require("./testData/userTestData.json");
const newForumTestData = require("./testData/forumTestData.json");
const newPostTestData = require("./testData/postTestData.json");
const newCommentTestData = require("./testData/commentTestData.json");
const User = require("../models/User.js");
const Post = require("../models/Post");
const Forum = require("../models/Forum.js");
const Comment = require("../models/Comment.js");

let server, url;
let userId = "";
let forumId = "";
let postId = "";
let commentId = "";
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
      commentId = data._id;
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
        nativeLanguage: "Indonesian/Bahasa Indonesia",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
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
        targetLanguage: ["German/Deutsch", "English"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/Username is required/);
    });

    it("should return error with input without password", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "",
        nativeLanguage: "English",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/Password is required/);
    });

    it("should return error with input without nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/Native language is required/);
    });

    it("should return error with input with improper nativeLanguage", async () => {
      const updateInput = {
        ...newUserTestData[0].input,
        username: "test edit",
        password: "Test123Edit",
        nativeLanguage: "aksjlkjKLKL",
        targetLanguage: ["German/Deutsch", "English"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
          },
        });
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
        targetLanguage: ["German/Deutsch", "kfjlksjflkjfjSKF"],
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateUserByIdQuery,
          variables: {
            input: updateInput,
            updateUserByIdId: userId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(
        /Target language is not in any of the options/
      );
    });
  });
});

describe("update Post by Id", () => {
  // this is the query for our test
  const updatePostByIdQuery = `
  mutation UpdatePostById($input: PostInput!, $updatePostByIdId: String) {
    updatePostById(input: $input, id: $updatePostByIdId) {
      _id
      userId
      content
      title
      forumId
    }
  }
    `;

  describe("successful update", () => {
    it("should return the updated post after success", async () => {
      const updateInput = {
        ...newPostTestData[0].input,
        userId, // From submitted user earlier
        forumId, // From beforeAll, should be English
        // User can only change the post content
        content: "lorem ipsum edit",
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updatePostByIdQuery,
          variables: {
            input: updateInput,
            updatePostByIdId: postId,
          },
        });
      const data = response.body.data.updatePostById;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("content");
      expect(data.content).toBe("lorem ipsum edit");
    });
  });

  describe("failed inserts", () => {
    it("should return error with empty content", async () => {
      const updateInput = {
        ...newPostTestData[0].input,
        userId, // From submitted user earlier
        forumId, // From beforeAll, should be English
        // User can only change the post content
        content: "",
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updatePostByIdQuery,
          variables: {
            input: updateInput,
            updatePostByIdId: postId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/Content is required/);
    });
  });
});

describe("update Comment by Id", () => {
  // this is the query for our test
  const updateCommentByIdQuery = `
  mutation UpdateCommentById($input: CommentInput!, $updateCommentByIdId: String) {
    updateCommentById(input: $input, id: $updateCommentByIdId) {
      _id
      userId
      content
      postId
    }
  }
    `;

  describe("successful update", () => {
    it("should return the updated post after success", async () => {
      const updateInput = {
        ...newCommentTestData[0].input,
        userId, // From submitted user earlier
        postId, // From beforeAll, should be English
        // User can only change the post content
        content: "lorem ipsum edit",
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateCommentByIdQuery,
          variables: {
            input: updateInput,
            updateCommentByIdId: commentId,
          },
        });
      const data = response.body.data.updateCommentById;
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("content");
      expect(data.content).toBe("lorem ipsum edit");
    });
  });

  describe("failed inserts", () => {
    it("should return error with empty content", async () => {
      const updateInput = {
        ...newCommentTestData[0].input,
        userId, // From submitted user earlier
        postId, // From beforeAll, should be English
        // User can only change the post content
        content: "",
      };
      const response = await request(url)
        .post("/")
        .send({
          query: updateCommentByIdQuery,
          variables: {
            input: updateInput,
            updateCommentByIdId: commentId,
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toMatch(/Content is required/);
    });
  });
});

describe("find Users based on their native language", () => {
  // this is the query for our test
  const findUsersByNativeLanguage = `
  query Query($nativeLanguage: String) {
    findUsersByNativeLanguage(nativeLanguage: $nativeLanguage) {
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

  describe("successful fetch", () => {
    it("should return array of users after success", async () => {
      const nativeLanguage = newUserTestData[0].input.nativeLanguage;
      const response = await request(url).post("/").send({
        query: findUsersByNativeLanguage,
        variables: {
          nativeLanguage,
        },
      });
      const data = response.body.data.findUsersByNativeLanguage;
      expect(typeof data).toBe("object");
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty("_id");
      expect(data[0]).toHaveProperty("username");
      expect(data[0]).toHaveProperty("email");
      expect(data[0].nativeLanguage).toBe(nativeLanguage);
    });
  });

  describe("zero fetch", () => {
    it("should return error with empty content", async () => {
      const nativeLanguage = "English";
      const response = await request(url).post("/").send({
        query: findUsersByNativeLanguage,
        variables: {
          nativeLanguage,
        },
      });
      const data = response.body.data.findUsersByNativeLanguage;
      expect(typeof data).toBe("object");
      expect(data).toHaveLength(0);
    });
  });
});

describe("find User based on their id", () => {
  // this is the query for our test
  const findUserByIdQuery = `
  query FindUserById($findUserByIdId: String) {
    findUserById(id: $findUserByIdId) {
      _id
      username
      email
      password
      role
      nativeLanguage
      targetLanguage
      posts {
        _id
        userId
        content
        title
        forumId
      }
      comments {
        _id
        userId
        content
        postId
      }
    }
  }
    `;

  describe("successful fetch", () => {
    it("should return array of users after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findUserByIdQuery,
          variables: {
            findUserByIdId: userId,
          },
        });
      const data = response.body.data.findUserById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("username");
      expect(data).toHaveProperty("email");
      expect(data).toHaveProperty("comments");
      expect(data).toHaveProperty("posts");
      expect(data.posts).toHaveLength(1);
      expect(data.posts[0]).toHaveProperty("content");
      expect(data.comments).toHaveLength(1);
      expect(data.comments[0]).toHaveProperty("content");
    });
  });

  describe("fetch with nonexistant id", () => {
    it("should return array of users after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findUserByIdQuery,
          variables: {
            findUserByIdId: "dshshfkjskfj",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe('Unexpected error value: "User not found"');
    });
  });
});

describe("find Post based on their id", () => {
  // this is the query for our test
  const findPostByIdQuery = `
  query FindPostById($findPostByIdId: String) {
    findPostById(id: $findPostByIdId) {
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

  describe("successful fetch", () => {
    it("should return post after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findPostByIdQuery,
          variables: {
            findPostByIdId: postId,
          },
        });
      const data = response.body.data.findPostById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("content");
      expect(data).toHaveProperty("forumId");
      expect(data).toHaveProperty("userId");
      expect(data).toHaveProperty("comments");
      expect(data.comments).toHaveLength(1);
      expect(data.comments[0]).toHaveProperty("content");
      expect(data._id).toBe(postId);
    });
  });

  describe("fetch with nonexistant id", () => {
    it("should return error with wrong id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findPostByIdQuery,
          variables: {
            findPostByIdId: "dshshfkjskfj",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe('Unexpected error value: "Post not found"');
    });
  });
});

describe("find Comment based on their id", () => {
  // this is the query for our test
  const findCommentByIdQuery = `
  query FindCommentById($findCommentByIdId: String) {
    findCommentById(id: $findCommentByIdId) {
      _id
      userId
      content
      postId
    }
  }
    `;

  describe("successful fetch", () => {
    it("should return comment after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findCommentByIdQuery,
          variables: {
            findCommentByIdId: commentId,
          },
        });
      const data = response.body.data.findCommentById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("content");
      expect(data).toHaveProperty("postId");
      expect(data).toHaveProperty("userId");
      expect(data._id).toBe(commentId);
    });
  });

  describe("fetch with nonexistant id", () => {
    it("should return array of users after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findCommentByIdQuery,
          variables: {
            findCommentByIdId: "dshshfkjskfj",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe('Unexpected error value: "Comment not found"');
    });
  });
});

describe("find All Forums", () => {
  // this is the query for our test
  const findAllForums = `
  query FindCommentById {
    findAllForums {
      _id
      name
    }
  }
    `;

  describe("successful fetch", () => {
    it("should return array of forums after success", async () => {
      const response = await request(url).post("/").send({
        query: findAllForums,
      });
      const data = response.body.data.findAllForums;
      expect(typeof data).toBe("object");
      expect(data).toHaveLength(7);
      expect(data[0]).toHaveProperty("_id");
      expect(data[0]).toHaveProperty("name");
      expect(data[0].name).toBe("English");
    });
  });
});

describe("find Forum By Id", () => {
  // this is the query for our test
  const findForumByIdQuery = `
  query FindForumById($findForumByIdId: String) {
    findForumById(id: $findForumByIdId) {
      _id
      name
      posts {
        _id
        userId
        content
        title
        forumId
      }
    }
  }
    `;

  describe("successful fetch", () => {
    it("should return array of forums after success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findForumByIdQuery,
          variables: {
            findForumByIdId: forumId,
          },
        });
      const data = response.body.data.findForumById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("_id");
      expect(data).toHaveProperty("name");
      expect(data).toHaveProperty("posts");
      expect(data.posts).toHaveLength(1);
      expect(data.posts[0]).toHaveProperty("_id");
      expect(data.posts[0]).toHaveProperty("content");
    });
  });

  describe("fetch with nonexistant id", () => {
    it("should return error with nonexistatnt id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: findForumByIdQuery,
          variables: {
            findForumByIdId: "dshshfkjskfj",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe('Unexpected error value: "Forum not found"');
    });
  });
});

describe("delete Comment by Id", () => {
  const deleteCommentByIdQuery = `
  mutation DeleteCommentById($deleteCommentByIdId: String!) {
    deleteCommentById(id: $deleteCommentByIdId) {
      message
    }
  }
  `;

  describe("successful delete", () => {
    it("should return a response message on success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteCommentByIdQuery,
          variables: {
            deleteCommentByIdId: commentId,
          },
        });
      const data = response.body.data.deleteCommentById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("message");
      expect(data.message).toBe(
        `Comment with id ${commentId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it("should return an error message on nonexistatnt id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteCommentByIdQuery,
          variables: {
            deleteCommentByIdId: "akjjfjsafdas",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        'Unexpected error value: "Comment not found"'
      );
    });
  });
});

describe("delete Post by Id", () => {
  const deletePostByIdQuery = `
  mutation DeletePostById($deletePostByIdId: String!) {
    deletePostById(id: $deletePostByIdId) {
      message
    }
  }
  `;

  describe("successful delete", () => {
    it("should return a response message on success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deletePostByIdQuery,
          variables: {
            deletePostByIdId: postId,
          },
        });
      const data = response.body.data.deletePostById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("message");
      expect(data.message).toBe(
        `Post with id ${postId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it("should return an error message on nonexistatnt id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deletePostByIdQuery,
          variables: {
            deletePostByIdId: "akjjfjsafdas",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        'Unexpected error value: "Post not found"'
      );
    });
  });
});

describe("delete User by Id", () => {
  const deleteUserByIdQuery = `
  mutation DeleteUserById($deleteUserByIdId: String!) {
    deleteUserById(id: $deleteUserByIdId) {
      message
    }
  }
  `;

  describe("successful delete", () => {
    it("should return a response message on success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteUserByIdQuery,
          variables: {
            deleteUserByIdId: userId,
          },
        });
      const data = response.body.data.deleteUserById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("message");
      expect(data.message).toBe(
        `User with id ${userId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it("should return an error message on nonexistatnt id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteUserByIdQuery,
          variables: {
            deleteUserByIdId: "akjjfjsafdas",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        'Unexpected error value: "User not found"'
      );
    });
  });
});

describe("delete Forum by Id", () => {
  const deleteForumByIdQuery = `
  mutation DeleteForumById($deleteForumByIdId: String!) {
    deleteForumById(id: $deleteForumByIdId) {
      message
    }
  }
  `;

  describe("successful delete", () => {
    it("should return a response message on success", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteForumByIdQuery,
          variables: {
            deleteForumByIdId: forumId,
          },
        });
      const data = response.body.data.deleteForumById;
      expect(typeof data).toBe("object");
      expect(data).toHaveProperty("message");
      expect(data.message).toBe(
        `Forum with id ${forumId} has been deleted`
      );
    });
  });

  describe("failed delete", () => {
    it("should return an error message on nonexistatnt id", async () => {
      const response = await request(url)
        .post("/")
        .send({
          query: deleteForumByIdQuery,
          variables: {
            deleteForumByIdId: "akjjfjsafdas",
          },
        });
      const errMessage = JSON.parse(response.text).errors[0].message;
      expect(errMessage).toBe(
        'Unexpected error value: "Forum not found"'
      );
    });
  });
});
