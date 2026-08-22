// src/lib/epub-packer/xml-builders/container-builder.ts

/**
 * Builds standard EPUB META-INF/container.xml
 * @returns string
 */
export function buildContainerXml(): string {
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
    '  <rootfiles>\n' +
    '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
    '  </rootfiles>\n' +
    '</container>'
  );
}
