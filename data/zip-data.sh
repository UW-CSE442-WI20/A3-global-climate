#!/usr/bin/env bash

# Zip the prepared temperature data.

PREP_DIR="./prepared"

for CTG in "TAVG" "TMAX" "TMIN"
do
    OUT="$CTG-by-country.zip"
    echo "Zipping $CTG data as $OUT..."
    zip "$OUT" "$PREP_DIR/"*"-$CTG.csv"
done
