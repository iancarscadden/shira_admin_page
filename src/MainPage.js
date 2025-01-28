// src/MainPage.js

import React, { useState } from 'react';
import { checkOrCreateLanguageSection, uploadContent, uploadVideo } from './firebase/firebaseService';

const MainPage = () => {
    const [language, setLanguage] = useState('');
    const [contentNumber, setContentNumber] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [transcripts, setTranscripts] = useState([
        { targetLanguage: '', nativeLanguage: '', timestamp: '' },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addTranscriptRow = () => {
        setTranscripts([...transcripts, { targetLanguage: '', nativeLanguage: '', timestamp: '' }]);
    };

    const handleTranscriptChange = (index, field, value) => {
        const updatedTranscripts = transcripts.map((row, i) =>
            i === index ? { ...row, [field]: value } : row
        );
        setTranscripts(updatedTranscripts);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (
            !language ||
            !contentNumber ||
            !title ||
            !description ||
            !videoFile ||
            transcripts.some(
                (t) => !t.targetLanguage || !t.nativeLanguage || !t.timestamp
            )
        ) {
            alert('Please fill in all fields and complete all transcript lines.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Format the document name (e.g., spanish1)
            const formattedLanguage = language.trim().toLowerCase();
            const documentName = `${formattedLanguage}${contentNumber}`;

            // Check or create the language section in Firestore
            await checkOrCreateLanguageSection(formattedLanguage);

            // Upload the video to Firebase Storage
            const videoUrl = await uploadVideo(videoFile, formattedLanguage, documentName);

            // Prepare the content data
            const contentData = {
                title: title.trim(),
                description: description.trim(),
                videoUrl,
                language: formattedLanguage,
                contentNumber: parseInt(contentNumber, 10),
                createdAt: new Date(),
                transcript: transcripts.map((t) => ({
                    targetLanguage: t.targetLanguage.trim(),
                    nativeLanguage: t.nativeLanguage.trim(),
                    timestamp: t.timestamp.trim(),
                })),
                // Placeholder for nested documents; can be expanded later
                contextualization: {},
                conversationalFluency: {},
                culturalImmersion: {},
            };

            // Upload the content to Firestore
            await uploadContent(formattedLanguage, documentName, contentData);

            alert(`Content uploaded successfully to lessons/${formattedLanguage}/contentList/${documentName}`);

            // Clear the form
            setLanguage('');
            setContentNumber('');
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setTranscripts([{ targetLanguage: '', nativeLanguage: '', timestamp: '' }]);
        } catch (error) {
            console.error('Error uploading content:', error);
            alert('Failed to upload content. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Admin Content Management</h1>
            <p>Enter details for a new piece of content:</p>

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                {/* Language Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="language" style={{ display: 'block', marginBottom: '5px' }}>
                        Language (e.g., "spanish", "french"):
                    </label>
                    <input
                        type="text"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        placeholder="Enter language"
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        required
                    />
                </div>

                {/* Content Number Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="contentNumber" style={{ display: 'block', marginBottom: '5px' }}>
                        Content Number (e.g., "1" for the first video in the language):
                    </label>
                    <input
                        type="number"
                        id="contentNumber"
                        value={contentNumber}
                        onChange={(e) => setContentNumber(e.target.value)}
                        placeholder="Enter content number"
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        required
                        min="1"
                    />
                </div>

                {/* Title Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="title" style={{ display: 'block', marginBottom: '5px' }}>
                        Title:
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title"
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        required
                    />
                </div>

                {/* Description Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>
                        Description:
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter description"
                        style={{ width: '100%', padding: '10px', fontSize: '16px', height: '80px' }}
                        required
                    />
                </div>

                {/* Video Upload Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="videoFile" style={{ display: 'block', marginBottom: '5px' }}>
                        Upload Video:
                    </label>
                    <input
                        type="file"
                        id="videoFile"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        required
                    />
                </div>

                {/* Transcript Table */}
                <div style={{ marginBottom: '15px' }}>
                    <h3>Transcript</h3>
                    <table border="1" style={{ width: '100%', marginBottom: '10px' }}>
                        <thead>
                        <tr>
                            <th>Target Language</th>
                            <th>Native Language</th>
                            <th>Timestamp</th>
                        </tr>
                        </thead>
                        <tbody>
                        {transcripts.map((row, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        value={row.targetLanguage}
                                        onChange={(e) => handleTranscriptChange(index, 'targetLanguage', e.target.value)}
                                        placeholder="Enter target language text"
                                        style={{ width: '100%', padding: '5px' }}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.nativeLanguage}
                                        onChange={(e) => handleTranscriptChange(index, 'nativeLanguage', e.target.value)}
                                        placeholder="Enter native language text"
                                        style={{ width: '100%', padding: '5px' }}
                                        required
                                    />
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        value={row.timestamp}
                                        onChange={(e) => handleTranscriptChange(index, 'timestamp', e.target.value)}
                                        placeholder="e.g., 00:00:05"
                                        style={{ width: '100%', padding: '5px' }}
                                        required
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <button
                        type="button"
                        onClick={addTranscriptRow}
                        style={{ padding: '8px 16px', fontSize: '14px' }}
                    >
                        Add Line
                    </button>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    style={{ padding: '10px 20px', fontSize: '16px' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Content'}
                </button>
            </form>
        </div>
    );
};

export default MainPage;
