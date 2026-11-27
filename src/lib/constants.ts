// src/lib/constants.ts

/**
 * Maximum allowed file sizes in bytes for client-side processing
 */
export const MAX_EPUB_FILE_SIZE = 250 * 1024 * 1024; // 250MB
export const MAX_PDF_FILE_SIZE = 1024 * 1024 * 1024; // 1GB (1024MB)
export const MAX_ZIP_FILE_SIZE = 250 * 1024 * 1024; // 250MB
export const MAX_TXT_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_FILE_SIZE = 30 * 1024 * 1024; // 30MB
export const MAX_IMAGES_ZIP_FILE_SIZE = 200 * 1024 * 1024; // 200MB

/**
 * ZIP extraction quotas to prevent memory exhaustion (Zip-bomb / Out of Memory)
 */
export const MAX_ZIP_TOTAL_ENTRIES = 2000; // Maximum number of entries (files + folders) in ZIP
export const MAX_ZIP_MARKDOWN_FILES = 1000; // Maximum number of .md files inside ZIP
export const MAX_ZIP_SINGLE_MD_SIZE = 15 * 1024 * 1024; // 15MB maximum per single uncompressed .md file
export const MAX_ZIP_TOTAL_UNCOMPRESSED_SIZE = 60 * 1024 * 1024; // 60MB maximum total uncompressed text in RAM

export const MAX_IMAGES_ZIP_ENTRIES = 500; // Maximum number of entries in illustrations ZIP
export const MAX_ILLUSTRATION_COUNT = 200; // Maximum number of illustration files allowed
export const MAX_IMAGES_ZIP_TOTAL_UNCOMPRESSED_SIZE = 150 * 1024 * 1024; // 150MB maximum total uncompressed images in RAM

/**
 * EPUB ZIP extraction quotas for EPUB Editor and EPUB → TXT
 */
export const MAX_EPUB_TOTAL_ENTRIES = 5000; // Maximum number of entries (files + folders) in an EPUB archive
export const MAX_EPUB_SINGLE_ENTRY_SIZE = 50 * 1024 * 1024; // 50MB maximum uncompressed size per single EPUB entry
export const MAX_EPUB_TOTAL_UNCOMPRESSED_SIZE = 500 * 1024 * 1024; // 500MB maximum total uncompressed size per EPUB archive
