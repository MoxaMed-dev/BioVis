# DNA Sequence Analysis & Mutation Detection Tool (BioVIS)

## Overview

This application is a bioinformatics tool designed for biological research laboratories to analyze DNA sequences in FASTA format. It supports single-sequence analysis, two-sequence comparison for mutation detection, and 3D protein visualization.

## Features

### 1. Single DNA Sequence Analysis

- **Validation**: Ensures only A, T, C, G nucleotides are present.
- **Statistics**: Calculates sequence length, nucleotide counts (A, T, C, G), GC content (%), and AT content (%).
- **Reverse Complement**: Automatically generates the reverse-complement sequence.
- **ORF Detection**: Identifies Open Reading Frames (ORFs) using start (ATG) and stop (TAA, TAG, TGA) codons.
- **Translation**: Translates DNA sequences or detected ORFs into amino acid (protein) sequences.

### 2. Sequence Comparison & Mutation Detection

- **Alignment**: Monospaced visualization of sequence alignment with match/mismatch markers.
- **Mutation Analysis**: Detects substitutions, insertions, and deletions.
- **Classification**: Categorizes mutations into transitions and transversions.
- **Impact Analysis**: Predicts the effect of mutations on the resulting protein (Silent, Missense, Nonsense, Frameshift).
- **Statistics**: Calculates mutation count and mutation rate.

### 3. 3D Protein Visualization

- **Interactive Viewer**: Integration with 3D molecular viewers (via RCSB PDB/AlphaFold DB).
- **Mutation Mapping**: Explore the structural effects of detected mutations.

## Technical Architecture

### Backend (Node.js/Express)

- **Bioinformatics Engine**: Custom algorithms for sequence processing, alignment, and translation.
- **Data Persistence**: PostgreSQL database (managed via Drizzle ORM) for storing analysis history.
- **API**: RESTful API endpoints for sequence analysis and history management.

### Frontend (React/TypeScript)

- **UI Framework**: Tailwind CSS with shadcn/ui components for a clean, professional "Scientific Dashboard" look.
- **State Management**: TanStack Query for efficient data fetching and caching.
- **Visualizations**: Monospaced alignment views and Recharts for statistical distribution.

## Getting Started

1. **Prerequisites**: Node.js and a PostgreSQL database.
2. **Setup**:
   ```bash
   npm install
   ```
3. **Database Sync**:
   ```bash
   npm run db:push
   ```
4. **Run Application**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5000`.

## Educational Outcomes

This tool demonstrates the application of bioinformatics algorithms in genetic research, providing a hands-on experience with real biological data analysis workflows.
