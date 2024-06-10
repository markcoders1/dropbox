const express = require("express");
const { Dropbox } = require("dropbox");
const Model = require("./Model");
const { default: axios } = require("axios");
const router = express.Router();

router.get("/get-data", async (req, res) => {
    try {
        let data = {
            refresh_token: process.env.REFRESH_TOKEN,
            grant_type: "refresh_token",
            client_id: process.env.API_KEY,
            client_secret: process.env.API_SECRET,
        };

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://api.dropbox.com/oauth2/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data: data,
        };
        const response = await axios(config);
        let accessToken = response.data.access_token;
        const dbx = new Dropbox({
            accessToken,
        });
        if (!req.query.level) {
            res.status(400).send({ message: "Invalid parameters" });
            return;
        }
        if (req.query.level === "0" && req.query.folder) {
            const response = await dbx.filesListFolder({
                path: `/${req.query.folder}`,
            });
            const mainCategories = response.result.entries.map(
                (entry) => entry.name
            );
            res.status(200).send(mainCategories);
        } else if (req.query.level === "0") {
            const response = await dbx.filesListFolder({ path: "" });
            const names = response.result.entries.map((entry) => entry.name);
            res.status(200).send(names);
        } else if (req.query.level === "1" && req.query.folder) {
            const response = await dbx.filesListFolder({
                path: `/${req.query.folder}`,
            });
            const fileInfo = await generateFile(response.result.entries,dbx);
            res.status(200).send(fileInfo);
        } else {
            res.status(400).send({ message: "Invalid parameters" });
        }
    } catch (error) {
        console.error(error);
        res.send({
            message: error?.error?.error_summary || "Something went wrong :(",
        });
    }
});

async function generateFile(fileInfo,dbx) {
    try {
        const fileInfoPromises = fileInfo.map(async (file) => {
            if (file.path_display) {
                const buffer = await getImageThumbnailUrl(file.path_display,dbx);
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
        const file = await Promise.all(fileInfoPromises);
        return file;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getImageThumbnailUrl(filePath,dbx) {
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

function bufferToDataUrl(type, buffer) {
    return `data:${type};base64,${buffer.toString("base64")}`;
}

module.exports = router;
