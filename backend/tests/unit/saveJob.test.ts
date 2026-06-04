import{Request, Response} from 'express';
import {saveJob} from "../../controller/aiController";
import { json } from 'node:stream/consumers';

describe("Save Job Controller", ()=>{
    test("should return 401 if user not authenticated", async ()=>{
        const req = {
            body:{}
        } as Request;

        const res ={
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        } as any;

        await saveJob(req,res);

        expect(res.status).toHaveBeenCalledWith(401);
    });
});