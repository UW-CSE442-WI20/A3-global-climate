#!/usr/bin/env python3

"""Extract the countries used by our chloropleth"""

import json
import pandas as pd

GEOJSON_PATH = 'sources/world-110m.geojson'
CCODES_PATH = 'sources/country-regional-codes.csv'
OUTPUT_PATH = 'prepared/country_codes.csv'

if __name__ == '__main__':
    # Get all alpha3 country codes
    a3codes = []
    with open(GEOJSON_PATH, 'r') as f:
        data = json.load(f)
        for feat in data['features']:
            a3codes.append(feat['id'])

    # Match alpha3 codes with country names
    df = pd.read_csv(CCODES_PATH, encoding='latin')[['name', 'alpha-3']]
    df = df.rename(columns={
        'alpha-3': 'code'
    })
    all_df = df
    df = df.loc[df['code'].isin(a3codes)]
    print(df.head())

    gotten = len(df.index)
    out_of = len(a3codes)
    print('{}/{} countries found for the chloropleth'.format(gotten, out_of))

    # Show the missing countries
    print('Missing countries:')
    for code in a3codes:
        match = df.loc[df['code'] == code]
        if len(match.index) == 0:
            print('    {}'.format(code))
    print()

    # Output resulting data
    print('Writing to {}...'.format(OUTPUT_PATH))
    df.to_csv(OUTPUT_PATH, encoding='latin', index=False)

    print('Done.')
