import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import commentModel from '../models/commentModel';
import userModel from '../models/userModel';
import { Express } from 'express';

let app: Express;

type User = {
    email: string;
    password: string;
    accessToken?: string;
    refreshToken?: string;
    _id?: string
};

const testUser: User = {
    email: 'test@user.com',
    password: 'testpassword'
};

let commentId = "";
const testComment = {
    comment: 'Test Comment 1',
    postId: "zxcvlker78ityknp4567uhnkl",
    owner: 'Coral'
}

const invalidComment = {
    comment: 'Test Comment 1',
}

beforeAll(async () => {
    app = await appInit();
    await commentModel.deleteMany();
    await userModel.deleteMany();

    await request(app).post('/auth/register').send(testUser);
    const response = await request(app).post('/auth/login').send(testUser);
    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
    expect(response.statusCode).toBe(200);
});

afterAll(() => {
    mongoose.connection.close();
});

describe("Comments test suite", () => {
    test("Comment test get all", async () => {
        const response = await request(app)
            .get('/comments')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    });

    test("Test adding new comment", async () => {
        const response = await request(app)
            .post('/comments')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(201);
        expect(response.body.comment).toBe(testComment.comment);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.owner);
        commentId = response.body._id;
    });

    test("Test adding invalid comment", async () => {
        const response = await request(app)
            .post('/comments')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(invalidComment);
        expect(response.statusCode).toBe(400);
    });

    test("Test get all comments after adding", async () => {
        const response = await request(app)
            .get('/comments')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    test("Test get comment by id", async () => {
        const response = await request(app)
            .get('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
        expect(response.body.comment).toBe(testComment.comment);
        expect(response.body.postId).toBe(testComment.postId);
        expect(response.body.owner).toBe(testComment.owner);
    });

    test("Test get comment by owner", async () => {
        const response = await request(app)
            .get('/comments?owner=' + testComment.owner)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].owner).toBe(testComment.owner);
    });

    // Add these tests after "Test get comment by owner" and before "Test update comment":

    test("Test get comment with invalid commentId", async () => {
        const response = await request(app)
            .get('/comments/zxdcui34589gbbnm9gh')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(400);
    });

    test("Test get non-existent comment", async () => {
        const response = await request(app)
            .get('/comments/' + new mongoose.Types.ObjectId())
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(404);
    });

    test("Test update comment with invalid postId", async () => {
        const response = await request(app)
            .put('/comments/a3s4d56g8b90j9hgf6ds4')
            .set('authorization', "JWT " + testUser.accessToken)
            .send(testComment);
        expect(response.statusCode).toBe(400);
    });

    test("Test update comment", async () => {
        const response = await request(app)
            .put('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken)
            .send({ comment: 'Updated Comment' });
        expect(response.statusCode).toBe(200);
        expect(response.body.comment).toBe('Updated Comment');
    });

    test('Test delete comment', async () => {
        const response = await request(app)
            .delete('/comments/' + commentId)
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(200);
    });

    test("Test delete comment with invalid commentId", async () => {
        const response = await request(app)
            .delete('/comments/as45xcfg89hvc6d5sd6f7g8h')
            .set('authorization', "JWT " + testUser.accessToken);
        expect(response.statusCode).toBe(400);
    });
});