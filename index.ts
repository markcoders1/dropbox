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
                const url = await getImagePreviewUrl(file.path_display);
                return {
                    name: file.name,
                    url: url
                };
            } else {
                return {
                    name: file.name,
                    url: "No path available"
                };
            }
        });
        const fileInfo = await Promise.all(fileInfoPromises);
        console.log(fileInfo);
    } catch (error) {
        console.error(error);
    }
}

async function getImagePreviewUrl(filePath: string): Promise<string> {
    try {
        const response = await dbx.filesGetTemporaryLink({ path: filePath });
        return response.result.link; 
    } catch (error) {
        console.error("Error getting temporary link:", error);
        return "";  
    }
}

getCategoryData("sub-1");
// getMainCategory();
