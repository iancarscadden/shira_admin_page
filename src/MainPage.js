import React, { useState } from 'react';
import { checkOrCreateLanguageSection, uploadContent, uploadVideo } from './firebase/firebaseService';
import Papa from 'papaparse'; // For parsing CSV files

const MainPage = () => {
    const [language, setLanguage] = useState('');
    const [contentNumber, setContentNumber] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [videoFile, setVideoFile] = useState(null);
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

                const formattedTranscripts = data.map((row, index) => {
                    if (!row.targetLanguage?.trim() || !row.nativeLanguage?.trim() || !row.startTime?.trim() || !row.endTime?.trim()) {
                        throw new Error(`Missing field in CSV at row ${index + 1}. Ensure all columns are correctly filled.`);
                    }

                    return {
                        targetLanguage: row.targetLanguage.trim(),
                        nativeLanguage: row.nativeLanguage.trim(),
                        startTime: row.startTime.trim(),
                        endTime: row.endTime.trim(),
                    };
                });

                setTranscripts(formattedTranscripts);
            },
            error: (error) => {
                alert('Failed to process CSV file. Please check the format.');
            },
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!language || !contentNumber || !title || !description || !videoFile || transcripts.length === 0) {
            alert('Please fill in all fields and upload a CSV file.');
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedLanguage = language.trim().toLowerCase();
            const documentName = `${formattedLanguage}${contentNumber}`;

            await checkOrCreateLanguageSection(formattedLanguage);

            const videoUrl = await uploadVideo(videoFile, formattedLanguage, documentName);

            const contentData = {
                title: title.trim(),
                description: description.trim(),
                videoUrl,
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

            setLanguage('');
            setContentNumber('');
            setTitle('');
            setDescription('');
            setVideoFile(null);
            setTranscripts([]);
        } catch (error) {
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
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="videoFile">Upload Video:</label>
                    <input
                        type="file"
                        id="videoFile"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        required
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="csvFile">Upload Transcript CSV:</label>
                    <input
                        type="file"
                        id="csvFile"
                        accept=".csv"
                        onChange={handleCsvUpload}
                        required
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Content'}
                </button>
            </form>
        </div>
    );
};

export default MainPage;
