// src/firebase/firebaseService.js

import { db, storage } from './firebaseConfig'; // Import db and storage
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

/**
 * Check if a language section exists in Firestore under lessons/<language>.
 * If not, create it.
 * @param {string} language - The language section to check/create.
 */
export const checkOrCreateLanguageSection = async (language) => {
    try {
        const languageRef = doc(db, `lessons/${language}`);
        const docSnapshot = await getDoc(languageRef);

        if (!docSnapshot.exists()) {
            await setDoc(languageRef, { createdAt: new Date() });
            console.log(`Created language section: ${language}`);
        }
    } catch (error) {
        console.error("Error checking/creating language section:", error);
        throw new Error("Failed to check/create language section.");
    }
};

/**
 * Upload a video file to Firebase Storage with progress tracking and return its URL.
 * @param {File} file - The video file to upload.
 * @param {string} language - The language category for organizing storage.
 * @param {string} documentName - The name of the document for naming the file.
 * @param {function} [onProgress] - (Optional) Callback to track upload progress.
 * @returns {Promise<string>} - The download URL of the uploaded video.
 */
export const uploadVideo = (file, language, documentName, onProgress = () => {}) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `videos/${language}/${documentName}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                onProgress(progress);
                console.log(`Upload is ${progress}% done`);
            },
            (error) => {
                console.error('Upload failed:', error);
                reject(new Error('Failed to upload video.'));
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log(`Video uploaded successfully: ${downloadURL}`);
                    resolve(downloadURL);
                } catch (err) {
                    console.error("Error retrieving download URL:", err);
                    reject(new Error("Failed to retrieve video URL."));
                }
            }
        );
    });
};

/**
 * Add a content document to Firestore under lessons/<language>/contentList/<documentName>.
 * @param {string} language - The language section.
 * @param {string} documentName - The document name for the content.
 * @param {Object} data - The content data to upload.
 */
export const uploadContent = async (language, documentName, data) => {
    try {
        const contentRef = doc(db, `lessons/${language}/contentList/${documentName}`);
        await setDoc(contentRef, data);
        console.log(`Uploaded content successfully to: lessons/${language}/contentList/${documentName}`);
    } catch (error) {
        console.error("Error uploading content:", error);
        throw new Error("Failed to upload content.");
    }
};
