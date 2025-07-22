function compareVectors(vec1, vec2, threshold = 0.35) {
    if (!vec1 || !vec2 || !Array.isArray(vec1) || !Array.isArray(vec2)) {
        console.log('Invalid vectors:', { vec1: !!vec1, vec2: !!vec2, isArray1: Array.isArray(vec1), isArray2: Array.isArray(vec2) });
        return false;
    }
    if (vec1.length !== vec2.length) {
        console.log('Vector length mismatch:', { length1: vec1.length, length2: vec2.length });
        return false;
    }

    // Calculate cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
        dotProduct += vec1[i] * vec2[i];
        norm1 += vec1[i] * vec1[i];
        norm2 += vec2[i] * vec2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
        console.log('Zero norm detected:', { norm1, norm2 });
        return false;
    }

    const similarity = dotProduct / (norm1 * norm2);
    
    // Log the similarity score for debugging
    console.log('Face similarity score:', similarity.toFixed(4));
    
    // Using a threshold of 0.35 (35%) which provides a good balance between:
    // - High true positive rate (correctly matching same person)
    // - Low false positive rate (incorrectly matching different people)
    return similarity > threshold;
}

module.exports = compareVectors;