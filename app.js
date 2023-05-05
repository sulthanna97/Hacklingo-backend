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
    comments: [Comment]
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
    findUsersByNativeLanguage(nativeLanguage: String): [User]
    findUserById(id: String): User
    findAllForums: [Forum]
    findForumById(id: String): Forum
    findPostById(id: String): Post
    findCommentById(id: String): Comment
  }

  type Mutation {
    insertNewUser(input: SignUpInput!): User
    updateUserById(input: SignUpInput!, id: String): User
    deleteUserById(id: String!): ResponseMessage
    insertNewPost(input: PostInput!): Post
    updatePostById(input: PostInput!, id: String): Post
    deletePostById(id: String!): ResponseMessage
    insertForums(input: [ForumInput]!): ResponseMessage
    deleteForumById(id: String!): ResponseMessage
    insertNewComment(input: CommentInput!): Comment
    updateCommentById(input: CommentInput!, id: String): Comment
    deleteCommentById(id: String!): ResponseMessage
  }
`;

const resolvers = {
  Query: {
    findUsersByNativeLanguage: async (_, args) => {
      try {
        const users = await User.find({ nativeLanguage: args.nativeLanguage });
        return users;
      } catch (err) {
        throw err;
      }
    },

    findUserById: async (_, args) => {
      try {
        const user = await User.findById(args.id).populate([
          "posts",
          "comments",
        ]);
        if (!user) {
          throw "User not found";
        }
        return user;
      } catch (err) {
        throw err;
      }
    },

    findAllForums: async () => {
      try {
        const forums = await Forum.find();
        return forums;
      } catch (err) {
        throw err;
      }
    },

    findForumById: async (_, args) => {
      try {
        const forum = await Forum.findById(args.id).populate("posts");
        if (!forum) {
          throw "Forum not found";
        }
        return forum;
      } catch (err) {
        throw err;
      }
    },

    findPostById: async (_, args) => {
      try {
        const post = await Post.findById(args.id).populate("comments");
        if (!post) {
          throw "Post not found";
        }
        return post;
      } catch (err) {
        throw err;
      }
    },

    findCommentById: async (_, args) => {
      try {
        const comment = await Comment.findById(args.id);
        if (!comment) {
          throw "Comment not found";
        }
        return comment;
      } catch (err) {
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
        throw err;
      }
    },

    updateUserById: async (_, args) => {
      try {
        const updatedUser = await User.findByIdAndUpdate(args.id, args.input, {
          returnDocument: "after",
          runValidators: true,
        });
        return updatedUser;
      } catch (err) {
        throw err;
      }
    },

    deleteUserById: async (_, args) => {
      try {
        const deleted = await User.findByIdAndDelete(args.id);
        if (!deleted)
          throw `User not found`;
        return {
          message: `User with id ${args.id} has been deleted`,
        };
      } catch (err) {
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
        throw err;
      }
    },

    updatePostById: async (_, args) => {
      try {
        const updatedPost = await Post.findByIdAndUpdate(args.id, args.input, {
          returnDocument: "after",
          runValidators: true,
        }).populate("comments");
        return updatedPost;
      } catch (err) {
        throw err;
      }
    },

    deletePostById: async (_, args) => {
      try {
        const deleted = await Post.findByIdAndDelete(args.id);
        if (!deleted)
          throw "Post not found";
        return {
          message: `Post with id ${args.id} has been deleted`,
        };
      } catch (err) {
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
        throw err;
      }
    },

    deleteForumById: async (_, args) => {
      try {
        const deleted = await Forum.findByIdAndDelete(args.id);
        if (!deleted)
          throw "Forum not found";
        return {
          message: `Forum with id ${args.id} has been deleted`,
        };
      } catch (err) {
        throw err;
      }
    },

    insertNewComment: async (_, args) => {
      try {
        const newComment = new Comment(args.input);
        const user = await User.findById(args.input.userId);
        const post = await Post.findById(args.input.postId);
        await newComment.save();
        user.comments.push(newComment._id);
        post.comments.push(newComment._id);
        await user.save();
        await post.save();
        return newComment;
      } catch (err) {
        throw err;
      }
    },

    updateCommentById: async (_, args) => {
      try {
        const updatedComment = await Comment.findByIdAndUpdate(
          args.id,
          args.input,
          {
            returnDocument: "after",
            runValidators: true,
          }
        );
        return updatedComment;
      } catch (err) {
        throw err;
      }
    },

    deleteCommentById: async (_, args) => {
      try {
        const deleted = await Comment.findByIdAndDelete(args.id);
        if (!deleted)
          throw `Comment not found`;
        return {
          message: `Comment with id ${args.id} has been deleted`,
        };
      } catch (err) {
        throw err;
      }
    },
  },
};

const server = new ApolloServer({
  typeDefs,

  resolvers,
});

async function createApolloServer({ port }) {
  return startStandaloneServer(server, {
    listen: { port: port || 4000 },
  });
}

module.exports = createApolloServer;
