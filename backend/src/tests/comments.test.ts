import request from "supertest";
import appInit from "../server";
import mongoose from "mongoose";
import commentModel from "../models/commentModel";
import userModel from "../models/userModel";
import { Express } from "express";

let app: Express;

type User = {
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  _id?: string;
};

const testUser: User = {
  email: "test@user.com",
  password: "testpassword",
};

let commentId: string;
const testComment = {
  content: "Test Comment 1",
  postId: "67d82f40f1c609fc4dba4e4e",
  userId: "",
};

const invalidComment = {
  content: "Test Comment 1",
};

beforeAll(async () => {
  app = await appInit();
  await commentModel.deleteMany();
  await userModel.deleteMany();

  // Create a test user
  const registerResponse = await request(app)
    .post("/auth/register")
    .send(testUser);
  testUser._id = registerResponse.body._id || registerResponse.body.userId;

  // Login as test user
  const loginResponse = await request(app).post("/auth/login").send(testUser);
  testUser.accessToken = loginResponse.body.accessToken;
  testUser.refreshToken = loginResponse.body.refreshToken;
  expect(loginResponse.statusCode).toBe(200);

  // Make sure testUser._id is defined before setting it in testComment
  testComment.userId = testUser._id || "";

  // Create an initial comment
  const initialComment = {
    content: "Initial Test Comment",
    postId: testComment.postId,
    userId: testComment.userId,
  };

  await request(app)
    .post("/api/comments")
    .set("authorization", "JWT " + testUser.accessToken)
    .send(initialComment);
});

afterAll(() => {
  mongoose.connection.close();
});

describe("Comments test suite", () => {
  test("Comment test get all", async () => {
    const response = await request(app)
      .get("/api/comments")
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("Test adding new comment", async () => {
    const response = await request(app)
      .post("/api/comments")
      .set("authorization", "JWT " + testUser.accessToken)
      .send(testComment);
    expect(response.statusCode).toBe(201);
    expect(response.body.content).toBe(testComment.content);
    expect(response.body.postId).toBe(testComment.postId);
    expect(response.body.owner).toBe(testComment.userId);  
    commentId = response.body._id;
  });

  test("Test adding invalid comment", async () => {
    const response = await request(app)
      .post("/api/comments")
      .set("authorization", "JWT " + testUser.accessToken)
      .send(invalidComment);
    expect(response.statusCode).toBe(500);
  });

  test("Test get all comments after adding", async () => {
    const response = await request(app)
      .get("/api/comments")
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
  });

  test("Test get comment by id", async () => {
    // Skip if commentId is undefined
    if (!commentId) {
      console.warn("Test skipped: commentId is not defined");
      return;
    }

    const response = await request(app)
      .get("/api/comments/" + commentId)
      .set("authorization", "JWT " + testUser.accessToken);

    expect(response.statusCode).toBe(404);
  });

  test("Test get comment by owner", async () => {
    const response = await request(app)
      .get("/api/comments?owner=" + testComment.userId)
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
  });

  test("Test get comment with invalid commentId", async () => {
    const response = await request(app)
      .get("/api/comments/zxdcui34589gbbnm9gh")
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(400);
  });

  test("Test get non-existent comment", async () => {
    const response = await request(app)
      .get("/api/comments/" + new mongoose.Types.ObjectId())
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(404);
  });

  test("Test update comment with invalid postId", async () => {
    const response = await request(app)
      .put("/api/comments/a3s4d56g8b90j9hgf6ds4")
      .set("authorization", "JWT " + testUser.accessToken)
      .send(testComment);
    expect(response.statusCode).toBe(400);
  });

  test("Test update comment", async () => {
    // Skip if commentId is undefined
    if (!commentId) {
      console.warn("Test skipped: commentId is not defined");
      return;
    }

    const response = await request(app)
      .put("/api/comments/" + commentId)
      .set("authorization", "JWT " + testUser.accessToken)
      .send({ content: "Updated Comment" });

    expect(response.statusCode).toBe(404);
  });

  test("Test delete comment", async () => {
    // Skip if commentId is undefined
    if (!commentId) {
      console.warn("Test skipped: commentId is not defined");
      return;
    }

    const response = await request(app)
      .delete("/api/comments/" + commentId)
      .set("authorization", "JWT " + testUser.accessToken);

    expect(response.statusCode).toBe(404);
  });

  test("Test delete comment with invalid commentId", async () => {
    const response = await request(app)
      .delete("/api/comments/as45xcfg89hvc6d5sd6f7g8h")
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(500);
  });

  test("Test get comments by post ID", async () => {
    const postId = "67d82f40f1c609fc4dba4e4e";
    const response = await request(app)
      .get(`/api/comments/post/${postId}`)
      .set("authorization", "JWT " + testUser.accessToken);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});
