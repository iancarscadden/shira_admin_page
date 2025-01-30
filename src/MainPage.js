// src/MainPage.js

import React, { useState } from 'react';
import { checkOrCreateLanguageSection, uploadContent } from './firebase/firebaseService';
import Papa from 'papaparse'; // For parsing CSV files

const MainPage = () => {
    const [language, setLanguage] = useState('');
    const [contentNumber, setContentNumber] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [videoStart, setVideoStart] = useState('');
    const [videoEnd, setVideoEnd] = useState('');
    const [transcripts, setTranscripts] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];

        if (!file) {
            alert("Please upload a valid CSV file.");
            return;
        }

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            delimiter: ",",
            complete: (result) => {
                const data = result.data;

                if (!data || data.length === 0) {
                    alert("CSV file is empty or improperly formatted.");
                    return;
                }

                try {
                    const formattedTranscripts = data.map((row, index) => {
                        if (
                            !row.targetLanguage?.trim() ||
                            !row.nativeLanguage?.trim() ||
                            !row.startTime?.trim() ||
                            !row.endTime?.trim()
                        ) {
                            throw new Error(`Missing field in CSV at row ${index + 1}. Ensure all columns are correctly filled.`);
                        }

                        // Optionally, validate the format of startTime and endTime here

                        return {
                            targetLanguage: row.targetLanguage.trim(),
                            nativeLanguage: row.nativeLanguage.trim(),
                            startTime: row.startTime.trim(),
                            endTime: row.endTime.trim(),
                        };
                    });

                    setTranscripts(formattedTranscripts);
                } catch (error) {
                    alert(error.message);
                }
            },
            error: (error) => {
                alert('Failed to process CSV file. Please check the format.');
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (
            !language ||
            !contentNumber ||
            !title ||
            !description ||
            !youtubeUrl ||
            !videoStart ||
            !videoEnd ||
            transcripts.length === 0
        ) {
            alert('Please fill in all fields, enter YouTube URL, specify video start and end times, and upload a CSV file.');
            return;
        }

        // Validate YouTube URL format (basic check)
        const youtubeRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
        if (!youtubeRegex.test(youtubeUrl)) {
            alert('Please enter a valid YouTube URL.');
            return;
        }

        // Validate videoStart and videoEnd (format HH:MM:SS.mmm)
        const timeRegex = /^(\d{2}:)?([0-5]?\d):([0-5]?\d)(\.\d{1,3})?$/;
        if (!timeRegex.test(videoStart) || !timeRegex.test(videoEnd)) {
            alert('Please enter valid video start and end times in HH:MM:SS.mmm format.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedLanguage = language.trim().toLowerCase();
            const documentName = `${formattedLanguage}${contentNumber}`;

            await checkOrCreateLanguageSection(formattedLanguage);

            const contentData = {
                title: title.trim(),
                description: description.trim(),
                youtubeUrl: youtubeUrl.trim(),
                videoStart: videoStart.trim(),
                videoEnd: videoEnd.trim(),
                language: formattedLanguage,
                contentNumber: parseInt(contentNumber, 10),
                createdAt: new Date(),
                transcript: transcripts,
                contextualization: {},
                conversationalFluency: {},
                culturalImmersion: {},
            };

            await uploadContent(formattedLanguage, documentName, contentData);

            alert(`Content uploaded successfully to lessons/${formattedLanguage}/${documentName}`);

            // Clear the form
            setLanguage('');
            setContentNumber('');
            setTitle('');
            setDescription('');
            setYoutubeUrl('');
            setVideoStart('');
            setVideoEnd('');
            setTranscripts([]);
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

            <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="language">Language:</label>
                    <input
                        type="text"
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="e.g., Spanish, French"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="contentNumber">Content Number:</label>
                    <input
                        type="number"
                        id="contentNumber"
                        value={contentNumber}
                        onChange={(e) => setContentNumber(e.target.value)}
                        required
                        min="1"
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="e.g., 1"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="title">Title:</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="Enter title"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px', height: '80px' }}
                        placeholder="Enter description"
                    ></textarea>
                </div>

                {/* YouTube URL Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="youtubeUrl">YouTube URL:</label>
                    <input
                        type="url"
                        id="youtubeUrl"
                        value={youtubeUrl}
                        onChange={(e) => setYoutubeUrl(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="Enter YouTube video URL"
                    />
                </div>

                {/* Video Start Time Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="videoStart">Video Start Time (HH:MM:SS.mmm):</label>
                    <input
                        type="text"
                        id="videoStart"
                        value={videoStart}
                        onChange={(e) => setVideoStart(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="e.g., 00:01:30.250"
                    />
                </div>

                {/* Video End Time Field */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="videoEnd">Video End Time (HH:MM:SS.mmm):</label>
                    <input
                        type="text"
                        id="videoEnd"
                        value={videoEnd}
                        onChange={(e) => setVideoEnd(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                        placeholder="e.g., 00:05:00.500"
                    />
                </div>

                {/* Transcript CSV Upload */}
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="csvFile">Upload Transcript CSV:</label>
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        required
                        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        backgroundColor: isSubmitting ? '#ccc' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                    }}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Content'}
                </button>
            </form>
        </div>
    );

};

export default MainPage;
