import * as dotenv from "dotenv";
import axios from "axios";
import { Dropbox } from "dropbox";
const express = require("express");
const app = express();

dotenv.config();

const accessToken: string = process.env.DBX_TOKEN as string;

const dbx: Dropbox = new Dropbox({
    accessToken,
});

app.get("/", (req: any, res: any) => {
    res.send("Hello World!");
});

async function getMainCategory(): Promise<void> {
    try {
        const response = await dbx.filesListFolder({ path: "/main" });
        const names: string[] = response.result.entries.map(
            (entry) => entry.name
        );
        console.log(names);
    } catch (error) {
        console.error(error);
    }
}

async function getCategoryData(category: string): Promise<void> {
    try {
        const response = await dbx.filesListFolder({
            path: `/main/${category}`,
        });
        const fileInfoPromises = response.result.entries.map(async (file) => {
            if (file.path_display) {
                const buffer = await getImageThumbnailUrl(file.path_display);                
                const url = bufferToDataUrl("image/png", buffer.fileBinary);
                return {
                    name: file.name,
                    image: url,
                };
            } else {
                return {
                    name: file.name,
                    image: "No path available",
                };
            }
        });
        const fileInfo = await Promise.all(fileInfoPromises);
        console.log(fileInfo);
    } catch (error) {
        console.error(error);
    }
}

async function getImageThumbnailUrl(filePath: string): Promise<any> {
    try {
        const response = await dbx.filesGetThumbnail({
            path: filePath,
        });
        return response.result;
    } catch (error) {
        console.error("Error getting thumbnail link:", error);
        return "";
    }
}

function bufferToDataUrl(type: string, buffer: Buffer): string {
    return `data:${type};base64,${buffer.toString('base64')}`;
}

getCategoryData("sub-1");
getMainCategory();
