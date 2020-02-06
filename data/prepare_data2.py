#!/usr/bin/env python3

from glob import glob
import os
import pandas as pd

CATEGORIES = ['TAVG', 'TMAX', 'TMIN']
PREP_DIR = 'prepared'
CCODES_PATH = 'sources/country-regional-codes.csv'

ccodes = None

def combine_temp_on_cat(cat):
    """
    Combines temperature data for all countries for a given temperature category.

    Args:
        cat: Temperature data category (TAVG, TMAX, or TMIN).

    Returns:
        Merged temperature data as a pd.DataDrame. None if no files were found.
    """
    global ccodes
    COLUMNS = ['year', '1yr_temp', '5yr_temp', '10yr_temp', '20yr_temp']
    NEW_COLUMNS = ['name', 'code', 'year',
                   '1yr_temp', '5yr_temp',
                   '10yr_temp', '20yr_temp']

    print('Merging temperature data for {}...'.format(cat))
    raw_txts = glob(os.path.join(PREP_DIR, '*-{}.csv'.format(cat)))
    if len(raw_txts) == 0:
        return None

    # Load country code data if it is not already loaded.
    if ccodes is None:
        ccodes = pd.read_csv(CCODES_PATH, encoding='latin')

    # Read and transform temperature data for all countries.
    print('Transforming relevant data...')
    all_dfs = []
    for i, path in enumerate(raw_txts):
        fname = os.path.splitext(os.path.basename(path))[0]
        df = pd.read_csv(path)[COLUMNS]

        # Get the name associated with this country.
        a3code = fname.split('-')[0]
        cname = ccodes.loc[ccodes['alpha-3'] == a3code]['name'].values
        if len(cname) == 0:
            continue
        cname = cname.item()

        # Add country name and code to all rows.
        df['name'] = cname
        df['code'] = a3code

        all_dfs.append(df)

        if (i + 1) % 50 == 0:
            print('    ({}/{}) files transformed...'.format(i + 1, len(raw_txts)))

    # Concatenate all transformed data.
    print('Combining data...')
    big_df = pd.concat(all_dfs)[NEW_COLUMNS]

    return big_df

if __name__ == '__main__':
    for cat in CATEGORIES:
        df = combine_temp_on_cat(cat)
        if df is None:
            print('No data found for {}'.format(cat))
        else:
            output_path = os.path.join(PREP_DIR, '{}-all.csv'.format(cat))
            df.to_csv(output_path, index=False, encoding='latin')
            print('Wrote combined {} data to {}'.format(cat, output_path))
        print()

    print('Done')
