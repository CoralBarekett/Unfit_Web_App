import request from 'supertest';
import appInit from '../server';
import mongoose from 'mongoose';
import postModel from '../models/postModel';
import userModel from '../models/userModel';
import testPostsData from './testPosts.json';
import { Express } from 'express';

let app: Express;
let ownerIdFromResponse: string;

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


type Post = {
    title: string;
    content: string;
    owner: string;
    _id?: string;
}

const testPosts: Post[] = testPostsData;


beforeAll(async () => {
    console.log('Before all tests');
    app = await appInit();
    await postModel.deleteMany();
    await userModel.deleteMany();

    await request(app).post('/auth/register').send(testUser);
    const response = await request(app).post('/auth/login').send(testUser);
    testUser.accessToken = response.body.accessToken;  // Change this line
    testUser.refreshToken = response.body.refreshToken;  // And this line
    expect(response.statusCode).toBe(200);
});

afterAll(() => {
    console.log('After all tests');
    mongoose.connection.close();
});

describe("Posts test", () => {
    test("Test get all post empty", async () => {
        const response = await request(app).get('/api/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });

    test("Test create new post", async () => {
        for (const post of testPosts) {
            const response = await request(app)
                .post('/posts')
                .set('authorization', "JWT " + testUser.accessToken)
                .send({
                    title: post.title,
                    content: post.content
                    // owner will be set by the controller
                });
            console.log('Create post response:', response.body);
            expect(response.statusCode).toBe(201);
            expect(response.body.title).toBe(post.title);
            expect(response.body.content).toBe(post.content);
            ownerIdFromResponse = response.body.owner;
            // expect(response.body.owner).toBeDefined();
            post._id = response.body._id;
        }
    });

    // Test invalid post creation
    test("Test create invalid post", async () => {
        const response = await request(app)
            .post('/api/posts')
            .set({ authorization: "JWT " + testUser.accessToken })
            .send({
                // Missing title and content
                owner: "Test Owner"
            });
        expect(response.statusCode).toBe(400);
    });

    test("Test get all post", async () => {
        const response = await request(app).get('/api/posts');
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test("Test get post by id", async () => {
        const response = await request(app).get('/api/posts/' + testPosts[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testPosts[0]._id);
    });

    // Test get post with invalid ID
    test("Test get post with invalid id", async () => {
        const response = await request(app).get('/api/posts/invalidid');
        expect(response.statusCode).toBe(400);
    });

    // Test get non-existent post
    test("Test get non-existent post", async () => {
        const response = await request(app).get('/api/posts/' + new mongoose.Types.ObjectId());
        expect(response.statusCode).toBe(404);
    });

    test("Test get post by owner", async () => {
        const response = await request(app).get('/api/posts?owner=' + ownerIdFromResponse);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });

    test("Test update post", async () => {
        const newPost = {
            title: 'Test Post 1 updated',
            content: 'Test Post 1 content updated',
            owner: 'Coral'
        };
        const response = await request(app)
            .put('/api/posts/' + testPosts[0]._id)
            .set({ authorization: "JWT " + testUser.accessToken })
            .send(newPost);
        expect(response.statusCode).toBe(200);
        expect(response.body.title).toBe(newPost.title);
        expect(response.body.content).toBe(newPost.content);
        expect(response.body.owner).toBe(newPost.owner);
    });

    // Test update with invalid ID
    test("Test update post with invalid id", async () => {
        const response = await request(app)
            .put('/api/posts/3456tdfgy6567uy')
            .set({ authorization: "JWT " + testUser.accessToken })
            .send(testPosts[0]);
        expect(response.statusCode).toBe(400);
    });

    test('Test delete post', async () => {
        const response = await request(app).delete('/api/posts/' + testPosts[0]._id)
            .set({ authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(200);

        const responseGet = await request(app).get('/api/posts/' + testPosts[0]._id);
        expect(responseGet.statusCode).toBe(404);
    });

    // Test delete with invalid ID
    test("Test delete post with invalid id", async () => {
        const response = await request(app).delete('/api/posts/s45d6fvbuj9gfh8jinf67gh')
            .set({ authorization: "JWT " + testUser.accessToken });
        expect(response.statusCode).toBe(400);
    });

});