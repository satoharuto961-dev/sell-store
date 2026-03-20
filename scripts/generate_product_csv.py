import csv
import re
import os

# Configuration
INPUT_FILE = 'raw_products.txt'
OUTPUT_FILE_FULL = 'shopify_products_import.csv'
OUTPUT_FILE_META = 'shopify_metafields_only.csv'

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
    delimiter_keyword = "Read  Download  Share  Save"
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        if not buffer and not line:
            i += 1
            continue
            
        if delimiter_keyword in line:
            if len(buffer) >= 3:
                # Extract Meta (last line of buffer)
                meta_line = buffer[-1]
                tags = []
                meta_data = {
                    'year': '',
                    'language': '',
                    'format': '',
                    'file_size': ''
                }
                
                if '·' in meta_line or any(ext in meta_line.lower() for ext in ['pdf', 'epub', 'doc']):
                    buffer.pop()
                    parts = meta_line.split('·')
                    for p in parts:
                        clean_part = p.strip()
                        if not clean_part:
                            continue
                        tags.append(clean_part)
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
                author = buffer[1] if len(buffer) > 1 else "Unknown"
                description_lines = buffer[2:] if len(buffer) > 2 else []
                description = " ".join(description_lines).replace("Read more…", "").replace("Read more...", "").strip()
                
                # Generate AI Training Blob
                ai_blob = f"Product: {title} | Author: {author} | Year: {meta_data['year']} | Language: {meta_data['language']} | Format: {meta_data['format']} | Details: {description}"
                
                product = {
                    'Handle': slugify(title),
                    'Title': title,
                    'Vendor': author,
                    'Body (HTML)': f"<p>{description}</p>",
                    'Type': 'Book',
                    'Tags': ", ".join(tags),
                    'Published': 'TRUE',
                    'Variant Price': '4.00',
                    'Meta: Year': meta_data['year'],
                    'Meta: Language': meta_data['language'],
                    'Meta: Format': meta_data['format'],
                    'Meta: Size': meta_data['file_size'],
                    'Meta: AI Blob': ai_blob
                }
                products.append(product)
            buffer = []
        else:
            buffer.append(line)
        i += 1
    return products

def main():
    target_input = os.path.join(os.getcwd(), INPUT_FILE)
    if not os.path.exists(target_input):
        print(f"Error: Could not find '{INPUT_FILE}' in {os.getcwd()}")
        return

    print(f"Reading from {target_input}...")
    with open(target_input, 'r', encoding='utf-8') as f:
        content = f.read()
        
    products = parse_products(content)
    if not products:
        print("No products found.")
        return

    # 1. Generate Full Import CSV
    target_output_full = os.path.join(os.getcwd(), OUTPUT_FILE_FULL)
    print(f"Generating {target_output_full}...")
    
    meta_fieldnames = [
        'Metafield: custom.popularity_message [string]',
        'Metafield: custom.intro_badge [string]',
        'Metafield: custom.year [number_integer]',
        'Metafield: custom.language [string]',
        'Metafield: custom.format [string]',
        'Metafield: custom.file_size [string]',
        'Metafield: custom.sale_prefix [string]',
        'Metafield: custom.sale_timer [string]',
        'Metafield: custom.ai_training_data [string]'
    ]
    
    full_fieldnames = [
        'Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published', 
        'Variant Price', 'Variant Requires Shipping', 'Variant Taxable'
    ] + meta_fieldnames
    
    with open(target_output_full, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=full_fieldnames)
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
                'Metafield: custom.sale_timer [string]': '2:00:00',
                'Metafield: custom.ai_training_data [string]': p['Meta: AI Blob']
            }
            writer.writerow(row)

    # 2. Generate Metafields-Only CSV
    target_output_meta = os.path.join(os.getcwd(), OUTPUT_FILE_META)
    print(f"Generating {target_output_meta}...")
    
    meta_only_fieldnames = ['Handle'] + meta_fieldnames
    
    with open(target_output_meta, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=meta_only_fieldnames)
        writer.writeheader()
        for p in products:
            row = {
                'Handle': p['Handle'],
                'Metafield: custom.popularity_message [string]': 'Sold 12+ times in the last 24 hours',
                'Metafield: custom.intro_badge [string]': 'Bestseller',
                'Metafield: custom.year [number_integer]': p['Meta: Year'],
                'Metafield: custom.language [string]': p['Meta: Language'],
                'Metafield: custom.format [string]': p['Meta: Format'],
                'Metafield: custom.file_size [string]': p['Meta: Size'],
                'Metafield: custom.sale_prefix [string]': 'Save',
                'Metafield: custom.sale_timer [string]': '2:00:00',
                'Metafield: custom.ai_training_data [string]': p['Meta: AI Blob']
            }
            writer.writerow(row)
            
    print("Done! Generated both CSV files.")

if __name__ == "__main__":
    main()
