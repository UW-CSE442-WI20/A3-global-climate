#!/usr/bin/env python3

"""Downloads historic temperature data from Berkeley Earth"""

from bs4 import BeautifulSoup
import mechanize
import os
import pandas as pd
import urllib.parse

CATEGORIES = ['TAVG', 'TMAX', 'TMIN']
BERK_URL = 'http://berkeleyearth.lbl.gov/auto/Regional/{}/Text/'
CCODES_PATH = 'countries-20140629.csv'
DATA_DIR = 'data'

def dl_category(cat, br, lookup=None):
    """
    Download a category of data.

    Args:
        cat: Temperature data category (TAVG, TMAX, or TMIN).
        br: mechanize.Browser to run web requests through.
        lookup: Dictionary used for mapping country names to country codes
            when a country name does not have a country code mapping, or has
            multiple possible mappings.

    Returns:
        Updated lookup table.
    """
    cat_url = BERK_URL.format(cat)
    if lookup is None:
        lookup = {}

    # Request webpage with download links
    br.open(cat_url)
    resp = br.response()

    # Find all file paths on the page
    print('Fetching file paths...')
    soup = BeautifulSoup(resp.read(), features='lxml')
    trows = soup.find_all('tr')
    paths = []
    for tr in trows:
        tcols = tr.find_all('td')
        found = False
        for td in tcols:
            link = td.find('a')
            if link is not None:
                href = link['href']
                ext = os.path.splitext(href)[1]
                if ext == '.txt':
                    paths.append(href)
                    break

    # Only include data files for countries
    print('Filtering for countries...')
    ccodes = pd.read_csv(CCODES_PATH, encoding='latin')
    valid_names = []
    for path in paths:
        # Extract name of region
        name = urllib.parse.unquote(path, encoding='latin')
        region = []
        for token in name.split('-'):
            if token.upper() == cat.upper():
                break
            else:
                region.append(token)
        region = ' '.join(region)

        # Search database for country name
        rows = ccodes[ccodes['English Name'].str.match(region, case=False)]
        num_rows = len(rows.index)
        if num_rows == 1:
            code = rows.Code.values.item()
            valid_names.append((code, path))
        else:
            # Check lookup table for unknown country code.
            # Then ask the user to specify a country code if the query
            # resulted in multiple options.
            key = region.lower()
            if key in lookup:
                code = lookup[key]
                valid_names.append((code, path))
            elif num_rows > 1:
                codes = rows.Code.values
                print('"{}" has multiple matches:'.format(region, ', '.join(codes)))
                for i, c in enumerate(codes):
                    cname = rows['English Name'].values[i]
                    print('  ({}). {}, {}'.format(i, c, cname))
                num = input('Enter a number (or nothing to skip): ')
                if num.isdigit():
                    num = int(num)
                    if num >= 0 and num < len(codes):
                        code = codes[num]
                        valid_names.append((code, path))

                        # Update lookup table
                        lookup[region.lower()] = code
                print()

    per_rows = len(valid_names) / len(paths) * 100
    print('{}/{} ({:.02f}%) of rows used'.format(len(valid_names), len(paths), per_rows))

    # Download data for each valid country
    if not os.path.exists(DATA_DIR):
        os.mkdir(DATA_DIR)
    for i, (code, name) in enumerate(valid_names):
        url = urllib.parse.urljoin(cat_url, name)
        br.open(url)
        resp = br.response()

        out_path = os.path.join(DATA_DIR, '{}-{}.txt'.format(code, cat))
        if (i + 1) % 50 == 0:
            print('{}/{} files written'.format(i + 1, len(valid_names)))
        with open(out_path, 'wb') as f:
            f.write(resp.read())
    print('All files downloaded for {}'.format(cat))

    return lookup

if __name__ == '__main__':
    # Open virtual browser
    br = mechanize.Browser()

    # Download data for each category
    lookup = None
    for cat in CATEGORIES:
        print('Downloading data for {}...'.format(cat))
        lookup = dl_category(cat, br, lookup)
        print()
