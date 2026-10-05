import os
import sys
import json
import pandas as pd

def inspect():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.join(base_dir, "preprocessed_dataset.111.csv")
    mapping_file = os.path.join(base_dir, "class_mapping.json")

    print("=" * 60)
    print("      CaneGuard AI - Dataset & Image Inspector")
    print("=" * 60)

    if not os.path.exists(csv_file):
        print(f"[!] Dataset file not found at: {csv_file}")
        return

    df = pd.read_csv(csv_file)
    print(f"Dataset File: {csv_file}")
    print(f"Total Records: {len(df):,}")
    print(f"Columns: {list(df.columns)}")

    if os.path.exists(mapping_file):
        with open(mapping_file, "r") as f:
            mapping = json.load(f)
        print("\nConfigurable Class Mapping:")
        for k, v in sorted(mapping.items()):
            print(f"  Class {k}: {v['name']} ({v['scientific_name']}) - Severity: {v['severity']}")

    if "label" in df.columns:
        print("\nLabel Distribution in Dataset:")
        print(df["label"].value_counts().to_string())

    print("=" * 60)

if __name__ == "__main__":
    inspect()
