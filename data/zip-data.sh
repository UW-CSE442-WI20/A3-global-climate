#!/usr/bin/env bash

# Zip the prepared temperature data.

DATA_DIR="./data"

for CTG in "TAVG" "TMAX" "TMIN"
do
    OUT="$CTG-by-country.zip"
    echo "Zipping $CTG data as $OUT..."
    zip "$OUT" "$DATA_DIR/"*"-$CTG.csv"
done
