#!/usr/bin/env bash

# Zip the prepared temperature data.

PREP_DIR="./prepared"

# Zip data for individual countries.
for CTG in "TAVG" "TMAX" "TMIN"
do
    OUT="$CTG-by-country.zip"
    echo "Zipping $CTG data as $OUT..."
    zip "$OUT" "$PREP_DIR/$CTG-by-country/"*".csv"
done

# Zip data merging countries.
NUM_ALL=$(ls -1 "$PREP_DIR/"*"-all.csv" | wc -l)
if [ "$NUM_ALL" -gt 0 ]
then
    zip "TEMP-all.zip" "$PREP_DIR/"*"-all.csv"
fi
