import csv
import re
import os

# Configuration
INPUT_FILE = 'raw_products.txt'
OUTPUT_FILE = 'shopify_products_import.csv'

def slugify(text):
    """Create a URL handle from the title."""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def parse_products(content):
    """Parse the raw text content into a list of product dictionaries."""
    products = []
    lines = content.split('\n')
    
    buffer = []
    
    # Pre-cleaning: Identify the delimiter line which seems to be "Read  Download  Share  Save"
    # We will buffer lines until we hit that line.
    
    delimiter_keyword = "Read  Download  Share  Save"
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines at the very start of a buffer
        if not buffer and not line:
            i += 1
            continue
            
        if delimiter_keyword in line:
            # We found the end of a product block. Process the buffer.
            # Expected structure:
            # Line 0: Title
            # Line 1: Author
            # Line 2..N-1: Description
            # Line N: Meta (pdf · English · 2020 · 8.4 MB)
            
            if len(buffer) >= 3:
                # Extract Meta (last line of buffer usually)
                meta_line = buffer[-1]
                tags = []
                meta_data = {
                    'year': '',
                    'language': '',
                    'format': '',
                    'file_size': ''
                }
                
                # Check if the last line is indeed the meta line (contains middle dot or file extension)
                if '·' in meta_line or any(ext in meta_line.lower() for ext in ['pdf', 'epub', 'doc']):
                    buffer.pop() # Remove it from meaningful content
                    # Parse tags
                    # Example: "pdf · English · 2020 · 8.4 MB"
                    parts = meta_line.split('·')
                    for p in parts:
                        clean_part = p.strip()
                        if not clean_part:
                            continue
                        
                        tags.append(clean_part)
                        
                        # Extract specific metadata
                        if re.match(r'^\d{4}$', clean_part):
                            meta_data['year'] = clean_part
                        elif any(fmt in clean_part.lower() for fmt in ['pdf', 'epub', 'doc', 'mobi']):
                            meta_data['format'] = clean_part
                        elif any(lng in clean_part.lower() for lng in ['english', 'russian', 'french', 'spanish']):
                            meta_data['language'] = clean_part
                        elif any(size in clean_part.lower() for size in ['mb', 'kb', 'gb']):
                            meta_data['file_size'] = clean_part
                            
                # Extract Description
                title = buffer[0]
                author = "Unknown"
                description_lines = []
                
                if len(buffer) > 1:
                    author = buffer[1]
                    description_lines = buffer[2:]
                else:
                    description_lines = []
                    
                description = " ".join(description_lines)
                description = description.replace("Read more…", "").strip()
                description = description.replace("Read more...", "").strip()
                
                # Create Product Dict
                product = {
                    'Handle': slugify(title),
                    'Title': title,
                    'Vendor': author,
                    'Body (HTML)': f"<p>{description}</p>",
                    'Type': 'Book',
                    'Tags': ", ".join(tags),
                    'Published': 'TRUE',
                    'Variant Price': '4.00', # Default sale price as discussed in previous sessions
                    'Meta: Year': meta_data['year'],
                    'Meta: Language': meta_data['language'],
                    'Meta: Format': meta_data['format'],
                    'Meta: Size': meta_data['file_size']
                }
                products.append(product)
            
            # Reset buffer
            buffer = []
            
        else:
            buffer.append(line)
            
        i += 1
        
    return products

def main():
    # Look for file in root or current dir
    target_input = os.path.join(os.getcwd(), INPUT_FILE)
    if not os.path.exists(target_input):
        print(f"Error: Could not find '{INPUT_FILE}' in {os.getcwd()}")
        return

    print(f"Reading from {target_input}...")
    with open(target_input, 'r', encoding='utf-8') as f:
        content = f.read()
        
    products = parse_products(content)
    
    if not products:
        print("No products found. Please check the file format.")
        return

    target_output = os.path.join(os.getcwd(), OUTPUT_FILE)
    print(f"Generating {target_output} with {len(products)} products...")
    
    with open(target_output, 'w', newline='', encoding='utf-8') as f:
        # Matrixify-compatible columns
        fieldnames = [
            'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 
            'Variant Price', 'Variant Requires Shipping', 'Variant Taxable',
            'Metafield: custom.popularity_message [string]',
            'Metafield: custom.intro_badge [string]',
            'Metafield: custom.year [number_integer]',
            'Metafield: custom.language [string]',
            'Metafield: custom.format [string]',
            'Metafield: custom.file_size [string]',
            'Metafield: custom.sale_prefix [string]',
            'Metafield: custom.sale_timer [string]'
        ]
        
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for p in products:
            row = {
                'Handle': p['Handle'],
                'Title': p['Title'],
                'Body (HTML)': p['Body (HTML)'],
                'Vendor': p['Vendor'],
                'Type': p['Type'],
                'Tags': p['Tags'],
                'Published': 'TRUE',
                'Variant Price': p['Variant Price'],
                'Variant Requires Shipping': 'FALSE',
                'Variant Taxable': 'FALSE',
                'Metafield: custom.popularity_message [string]': 'Sold 12+ times in the last 24 hours',
                'Metafield: custom.intro_badge [string]': 'Bestseller',
                'Metafield: custom.year [number_integer]': p['Meta: Year'],
                'Metafield: custom.language [string]': p['Meta: Language'],
                'Metafield: custom.format [string]': p['Meta: Format'],
                'Metafield: custom.file_size [string]': p['Meta: Size'],
                'Metafield: custom.sale_prefix [string]': 'Save',
                'Metafield: custom.sale_timer [string]': '2:00:00'
            }
            writer.writerow(row)
            
    print(f"Done! Generated {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
