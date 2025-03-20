# Converting Markdown to PDF

This guide provides instructions for converting markdown files to PDFs using Pandoc and WeasyPrint.

## Prerequisites

1. Install Pandoc:
   ```bash
   brew install pandoc
   ```

2. Install WeasyPrint:
   ```bash
   brew install weasyprint
   ```

## Conversion Process

1. Navigate to the markdown file directory:
   ```bash
   cd /path/to/MD/directory
   ```

2. Convert markdown to PDF with styling:
   ```bash
   pandoc input.md -o ../PDF/output.pdf --pdf-engine=weasyprint --css=../../../../0_Utilities/style.css
   ```

## Example

For SESSF_Phase_1.md:
```bash
cd /Users/jcastilla/Desktop/SEAFOOD\ FUTURES/Fishery-Systems-Mapping/1_FIshery_Systems_Profiles/1_Deep_Research_Outputs/SESSF/Perplexity/MD
pandoc SESSF_Phase_1.md -o ../PDF/SESSF_Phase_1.pdf --pdf-engine=weasyprint --css=../../../../0_Utilities/style.css
```

## Notes

- PDFs will be created in the corresponding PDF directory
- Maintain the same filename structure (just change extension from .md to .pdf)
- Ensure all markdown files are properly formatted before conversion
- Check PDF output for any formatting issues
- Some CSS-related warnings may appear but are usually not critical
- The CSS file provides consistent styling across all PDFs including:
  - Clean typography with system fonts
  - Comfortable line height and spacing
  - Proper heading hierarchy
  - Styled references section 