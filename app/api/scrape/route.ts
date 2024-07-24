import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';

interface ListingDetails {
    url: string;
    title: string;
    address: string;
    price: string;
    attributes: string[];
    extraValues: { [key: string]: string };
    description: string;
    imageUrls: string[];
}

async function scrapeListingDetails(page: puppeteer.Page, listingUrl: string): Promise<ListingDetails | null> {
    try {
        if (!listingUrl) {
            console.error('Invalid URL for listing details.');
            return null;
        }

        console.log(`Scraping details for listing: ${listingUrl}`);
        await page.goto(listingUrl, { waitUntil: 'networkidle2' });

        const details = await page.evaluate(() => {
            const titleElement = document.querySelector('.tm-property-listing-body__title') as HTMLElement;
            const title = titleElement ? titleElement.innerText : 'Title not found';

            const addressElement = document.querySelector('.tm-property-listing-body__location') as HTMLElement;
            const address = addressElement ? addressElement.innerText : 'Address not found';

            const priceElement = document.querySelector('.tm-property-listing-body__price') as HTMLElement;
            const price = priceElement ? priceElement.innerText : 'Price not found';

            const attributes = Array.from(document.querySelectorAll('.tm-property-listing-attribute-tag__tag--content'))
                .map(element => (element as HTMLElement).innerText);

            const extraValues: { [key: string]: string } = {};
            document.querySelectorAll('.o-table tr').forEach(row => {
                const key = row.querySelector('td:first-child') as HTMLElement;
                const value = row.querySelector('td:last-child') as HTMLElement;
                if (key && value) {
                    extraValues[key.innerText] = value.innerText;
                }
            });

            const descriptionElements = document.querySelectorAll('.tm-markdown p');
            const description = Array.from(descriptionElements).map(element => (element as HTMLElement).innerText).join(', ');

// Query all img elements on the page
const imageElements = document.querySelectorAll('img');

// Extract the src attributes from the img elements
const imageUrls = Array.from(imageElements).map(img => img.src);

            return {
                url: "",
                title,
                address,
                price,
                attributes,
                extraValues,
                description,
                imageUrls
            };
        });

        details.url = listingUrl;

        console.log(`Successfully scraped details for listing: ${listingUrl}`);
        return details;
    } catch (error) {
        console.error(`Error scraping listing details: ${(error as Error).message}`);
        return null;
    }
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url).searchParams.get('url');
        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        await page.setViewport({ width: 1280, height: 800 });

        console.log('Starting the scraping process...');
        const details = await scrapeListingDetails(page, url);

        await browser.close();

        if (!details) {
            return NextResponse.json({ error: 'Failed to fetch listing details' }, { status: 500 });
        }

        return NextResponse.json(details);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
