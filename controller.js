const express = require("express");
const { Dropbox } = require("dropbox");

const router = express.Router();
const accessToken = process.env.DBX_TOKEN;

const dbx = new Dropbox({
    accessToken,
});

router.get("/get-categories", async (req, res) => {
    try {
        const mainCategories = await getMainCategory();
        res.status(200).send(mainCategories);
    } catch (error) {
        console.error(error);
        res.send("Error occurred");
    }
});

async function getMainCategory() {
    try {
        const response = await dbx.filesListFolder({ path: "/main" });
        const names = response.result.entries.map((entry) => entry.name);
        return names;
    } catch (error) {
        console.error(error);
        return [];
    }
}

router.get("/get-category-data", async (req, res) => {
    const category = req.query.category;
    if (!category) {
        res.status(400).send("Category is required");
        return;
    }
    try {
        const fileInfo = await getCategoryData(category);
        res.status(200).send(fileInfo);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error occurred");
    }
});

async function getCategoryData(category) {
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
        return fileInfo;
    } catch (error) {
        console.error(error);
        return [];
    }
}

async function getImageThumbnailUrl(filePath) {
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
