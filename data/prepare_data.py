#!/usr/bin/env python3

"""Prepares historic temperature data downloaded with download_data.py"""

from glob import glob
from numpy import nan
import pandas as pd
import os

CATEGORIES = ['TAVG', 'TMAX', 'TMIN']
DATA_DIR = 'data'

def is_number(s):
    """Checks if a string is a valid number"""
    try:
        float(s)
        return True
    except ValueError:
        return False

def parse_temp_data(path):
    """
    Parses a raw temperature data file downloaded from Berkeley Earth.

    Args:
        path: Path to raw data file (a text file).
    """

    TEMP_SEARCH = 'Estimated Jan 1951-Dec 1980 absolute temperature (C):'
    YEAR_COL = 0
    MONTH_COL = 1
    ANN_ANOM_COL = 4
    ANN_UNC_COL = 5
    YR5_ANOM_COL = 6
    YR5_UNC_COL = 7
    YR10_ANOM_COL = 8
    YR10_UNC_COL = 9
    YR20_ANOM_COL = 10
    YR20_UNC_COL = 11
    COLUMNS = [
        'year',
        '1yr_temp', '1yr_unc',
        '5yr_temp', '5yr_unc',
        '10yr_temp', '10yr_unc',
        '20yr_temp', '20yr_unc',
    ]

    rows = []
    base_temp = None
    base_unc = None
    with open(path, 'r', encoding='latin') as f:
        for line in f:
            line = line.strip()
            if not line:
                # Skip empty strings.
                continue
            if line[0] == '%':
                # Parsing a comment
                # Check if line mentions the base temperature.
                bgn = line.find(TEMP_SEARCH)
                if bgn > 0:
                    bgn += len(TEMP_SEARCH)
                    tokens = line[bgn:].strip().split(' ')
                    base_temp = float(tokens[0])
                    base_unc = float(tokens[2])
            else:
                # Line contains data
                tokens = line.split()

                # Check that the average starts with January
                month = int(tokens[MONTH_COL])
                if month != 1:
                    continue

                # Parse each column, ignoring monthly data
                year = int(tokens[YEAR_COL])
                if is_number(tokens[ANN_ANOM_COL]):
                    yr1_temp = base_temp + float(tokens[ANN_ANOM_COL])
                    yr1_unc = base_unc + float(tokens[ANN_UNC_COL])
                else:
                    yr1_temp = nan
                    yr1_unc = nan
                if is_number(tokens[YR5_ANOM_COL]):
                    yr5_temp = base_temp + float(tokens[YR5_ANOM_COL])
                    yr5_unc = base_unc + float(tokens[YR5_UNC_COL])
                else:
                    yr5_temp = nan
                    yr5_unc = nan
                if is_number(tokens[YR10_ANOM_COL]):
                    yr10_temp = base_temp + float(tokens[YR10_ANOM_COL])
                    yr10_unc = base_unc + float(tokens[YR10_UNC_COL])
                else:
                    yr10_temp = nan
                    yr10_unc = nan
                if is_number(tokens[YR20_ANOM_COL]):
                    yr20_temp = base_temp + float(tokens[YR20_ANOM_COL])
                    yr20_unc = base_unc + float(tokens[YR20_UNC_COL])
                else:
                    yr20_temp = nan
                    yr20_unc = nan
                row = (
                    year,
                    yr1_temp, yr1_unc,
                    yr5_temp, yr5_unc,
                    yr10_temp, yr10_unc,
                    yr20_temp, yr20_unc
                )
                rows.append(row)

    df = pd.DataFrame(rows, columns=COLUMNS)
    return df

def parse_category(cat):
    """
    Parses a category of raw data files from `DATA_DIR`.

    Args:
        cat: Temperature data category (TAVG, TMAX, or TMIN).
    """
    raw_txts = glob(os.path.join(DATA_DIR, '*-{}.txt'.format(cat)))
    for i, path in enumerate(raw_txts):
        name = os.path.splitext(os.path.basename(path))[0]
        output_path = os.path.join(DATA_DIR, '{}.csv'.format(name))
        df = parse_temp_data(path)
        df.to_csv(output_path, index=False)
        if (i + 1) % 50 == 0:
            print('({}/{}) files parsed...'.format(i + 1, len(raw_txts)))
    print('All raw {} files parsed successfully'.format(cat))

if __name__ == '__main__':
    for cat in CATEGORIES:
        parse_category(cat)
        print()

    print('Done')
