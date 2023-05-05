const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const Forum = require("./models/Forum.js");
const Comment = require("./models/Comment.js");

const typeDefs = `#graphql

  type User {
    _id: String
    username: String
    email: String
    password: String
    role: String
    nativeLanguage: String
    targetLanguage: [String]
    posts: [Post]
  }

  type Comment {
    _id: String
    userId: String
    content: String
    postId: String
  }

  type ResponseMessage {
    message: String
  }

  type Comment {
    _id: String
    userId: String
    content: String
    postId: String
  }

  type Post {
    _id: String
    userId: String
    content: String
    title: String
    forumId: String
    comments: [Comment]
  }

  type Forum {
    _id: String
    name: String
    posts: [Post]
  }

  input SignUpInput {
    username: String
    email: String
    password: String
    role: String
    nativeLanguage: String
    targetLanguage: [String]
  }

  input PostInput {
    userId: String
    content: String
    title: String
    forumId: String
  }

  input CommentInput {
    userId: String
    content: String
    postId: String
  }

  input ForumInput {
    name: String
  }

  type Query {
    findAllUsers: [User]
    findUserById(id: String): User
    findForumById(id: String): Forum
    findPostById(id: String): Post
    findCommentById(id: String): Comment
  }

  type Mutation {
    insertNewUser(input: SignUpInput!): User
    deleteUserById(id: String!): ResponseMessage
    insertNewPost(input: PostInput!): Post
    updatePostById(input: PostInput!, id: String): Post
    deletePostById(id: String!): ResponseMessage
    insertForums(input: [ForumInput]!): ResponseMessage
    deleteForumById(id: String!): ResponseMessage
    insertComment(input: CommentInput!): Comment
    deleteCommentById(id: String!): ResponseMessage
  }
`;

const resolvers = {
  Query: {
    findAllUsers: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    findUserById: async (_, args) => {
      try {
        const user = await User.findById(args.id).populate("posts");
        return user;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    findForumById: async (_, args) => {
      try {
        const forum = await Forum.findById(args.id).populate("posts");
        return forum;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    findPostById: async (_, args) => {
      try {
        const post = await Post.findById(args.id).populate("comments");
        return post;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    findCommentById: async (_, args) => {
      try {
        const comment = await Comment.findById(args.id);
        return comment;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },

  Mutation: {
    insertNewUser: async (_, args) => {
      try {
        const newUser = new User(args.input);
        await newUser.save();
        return newUser;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    deleteUserById: async (_, args) => {
      try {
        const deleted = await User.findByIdAndDelete(args.id);
        if (!deleted)
          throw {
            message: `User with id ${args.id} not found`,
          };
        return {
          message: `User with id ${args.id} has been deleted`,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    insertNewPost: async (_, args) => {
      try {
        const newPost = new Post(args.input);
        const user = await User.findById(args.input.userId);
        const forum = await Forum.findById(args.input.forumId);
        await newPost.save();
        user.posts.push(newPost._id);
        forum.posts.push(newPost._id);
        await user.save();
        await forum.save();
        return newPost;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    updatePostById: async (_, args) => {
      try {
        const updatedPost = Post.findByIdAndUpdate(args.id, args.input, {
          returnDocument: "after",
        }).populate("comments");
        return updatedPost;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    deletePostById: async (_, args) => {
      try {
        const deleted = await Post.findByIdAndDelete(args.id);
        if (!deleted)
          throw {
            message: `Post with id ${args.id} not found`,
          };
        return {
          message: `Post with id ${args.id} has been deleted`,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    insertForums: async (_, args) => {
      try {
        await Forum.bulkWrite(
          args.input.map((el) => ({
            insertOne: {
              document: el,
            },
          })),
          { ordered: true }
        );
        return {
          message: "Insert Forums Success!!",
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    deleteForumById: async (_, args) => {
      try {
        const deleted = await Forum.findByIdAndDelete(args.id);
        if (!deleted)
          throw {
            message: `Forum with id ${args.id} not found`,
          };
        return {
          message: `Forum with id ${args.id} has been deleted`,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    insertComment: async (_, args) => {
      try {
        const newComment = new Comment(args.input);
        const user = await User.findById(args.input.userId);
        const post = await Post.findById(args.input.postId);
        await newComment.save();
        user.posts.push(newComment._id);
        post.comments.push(newComment._id);
        await user.save();
        await post.save();
        return newComment;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },

    deleteCommentById: async (_, args) => {
      try {
        const deleted = await Comment.findByIdAndDelete(args.id);
        if (!deleted)
          throw {
            message: `Comment with id ${args.id} not found`,
          };
        return {
          message: `Comment with id ${args.id} has been deleted`,
        };
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,

  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => console.log(`🚀  Server ready at: ${url}`));

module.exports = { typeDefs, resolvers };
