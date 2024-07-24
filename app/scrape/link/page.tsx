'use client';

import { useState, useEffect } from 'react';

export default function ScrapePage() {
    const [url, setUrl] = useState<string>('');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (showNotification) {
            const timer = setTimeout(() => {
                setShowNotification(false);
            }, 1400); // Notification duration in milliseconds

            return () => clearTimeout(timer); // Cleanup timer on component unmount
        }
    }, [showNotification]);

    const handleScrape = async () => {
        setLoading(true);
        setData(null);
        setShowResults(false);
        try {
            const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
            const result = await response.json();
            setData(result);
            setShowResults(true);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
        setLoading(false);
    };

    const handleDownload = () => {
        if (!data) return;

        // Extract title from data, assuming it's in data.title
        const title = data.title ? data.title.replace(/[^a-zA-Z0-9]/g, '_') : 'listing';
        const filename = `${title}_scraped-data.json`;

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(data, null, 2))
            .then(() => setShowNotification(true))
            .catch(err => console.error('Error copying text:', err));
    };

    return (
        <div className="relative flex flex-col min-h-screen bg-blue-700 text-white p-8 transition-all duration-500">
            <div className={`transition-transform duration-500 ${showResults ? 'transform -translate-y-24' : 'translate-y-0'}`}>
                <h1 className="text-4xl font-extrabold mb-8">Scrape Trade Me Listings</h1>
                {!showResults && (
                    <>
                        <input
                            type="text"
                            placeholder="Enter URL to fetch"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full p-4 mb-4 rounded-lg bg-blue-900 text-white placeholder-gray-400 border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleScrape}
                            disabled={loading || !url}
                            className="bg-yellow-400 text-black px-6 py-3 rounded-lg shadow-md hover:bg-yellow-300 transition-colors duration-300"
                        >
                            {loading ? 'Scraping...' : 'Scrape Listing'}
                        </button>
                    </>
                )}
            </div>

            {showResults && (
                <div className="flex-1 bg-blue-900 p-6 rounded-lg shadow-lg mt-4 overflow-auto h-full flex flex-col">
                    <h2 className="text-2xl font-semibold mb-4">Scraped Data</h2>
                    <div className="flex-1 overflow-auto bg-gray-800 p-4 rounded-lg">
                        <pre className="text-sm whitespace-pre-wrap overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                    <div className="flex flex-col mt-4 gap-4">
                        <button
                            onClick={handleDownload}
                            className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-400 transition-colors duration-300"
                        >
                            Download JSON
                        </button>
                        <button
                            onClick={handleCopy}
                            className="bg-gray-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-gray-400 transition-colors duration-300"
                        >
                            Copy JSON
                        </button>
                        <button
                            onClick={() => {
                                setShowResults(false);
                                setUrl('');
                            }}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-400 transition-colors duration-300"
                        >
                            Go Again
                        </button>
                    </div>
                </div>
            )}

            {showNotification && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-gray-900 text-white p-6 rounded-lg shadow-lg animate-fade-in">
                        <p>Data copied to clipboard!</p>
                    </div>
                </div>
            )}
        </div>
    );
}
