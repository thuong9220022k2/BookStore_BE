// import cloudinary from "cloudinary";
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: 'dkny7in6p',
    api_key: '482728214737428',
    api_secret: 'T1mQZ3NYG4CT26CKCNfo_4jRfvc',
});

exports.handleUpload = async (file) => {
    try {
        console.log("file test", file)
        const res = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        console.log("response file", res)
        return res;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// export default handleUpload;


