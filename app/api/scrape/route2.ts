import { NextResponse } from 'next/server';
import * as puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const MIN_PAGE_DELAY = 3000;
const MAX_PAGE_DELAY = 7000;
const MIN_LISTING_DELAY = 1000;
const MAX_LISTING_DELAY = 3000;
const RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

interface Listing {
    link: string;
}


function getRandomDelay(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
async function scrapeListingDetails(page: puppeteer.Page, listingUrl: string) {
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

            const descriptionElements = document.querySelectorAll('.tm-markdown li');
            const description = Array.from(descriptionElements).map(element => (element as HTMLElement).innerText).join(', ');

            const imageElement = document.querySelector('.tm-property-listing-body__image') as HTMLImageElement;
            const imageUrl = imageElement ? imageElement.src : 'Image not found';

            return {
                url: "",
                title,
                address,
                price,
                attributes,
                extraValues,
                description,
                imageUrl
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


async function scrapePageListings(page: puppeteer.Page, pageUrl: string): Promise<Listing[]> {
    try {
        console.log(`Navigating to ${pageUrl}`);
        await page.goto(pageUrl, { waitUntil: 'networkidle2' });

        const baseUrl = 'https://www.trademe.co.nz';

        const combinedListings = await page.evaluate(() => {
            const listings: Listing[] = [];
            const premiumListingsElements = document.querySelectorAll('.tm-property-premium-listing-card__wrapper a');
            const standardListingsElements = document.querySelectorAll('.tm-property-search-card__wrapper div a');

            premiumListingsElements.forEach(linkElement => {
                const link = linkElement ? linkElement.getAttribute('href') : '';
                if (link) {
                    listings.push({ link });
                }
            });

            standardListingsElements.forEach(linkElement => {
                let link = linkElement ? linkElement.getAttribute('href') : '';
                if (link) {
                    link = `/a/${link}`;
                    listings.push({ link });
                }
            });

            if (listings.length === 0) {
                console.log('No listings found on this page.');
            }

            return listings;
        });

        const fullListings = combinedListings.map(listing => ({
            ...listing,
            link: `${baseUrl}/${listing.link}`.replace(/\/\//g, '/')
        }));

        console.log(`Found ${fullListings.length} listings on ${pageUrl}`);
        return fullListings;
    } catch (error) {
        console.error(`Error scraping page listings: ${(error as Error).message}`);
        return [];
    }
}



async function scrapeTradeMe() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });

    console.log('Starting the scraping process...');

    const pageUrl = 'https://www.trademe.co.nz/a/property/residential/rent/canterbury/christchurch-city?page=1';
    const listings = await scrapePageListings(page, pageUrl);

    const listing = listings[0]; // Fetch only the first listing for now
    const details = await scrapeListingDetails(page, listing.link);

    await browser.close();
    return details;
}

export async function GET() {
    try {
        const details = await scrapeTradeMe();
        return NextResponse.json(details);
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
