import csv

# Read the original CSV file and write to the new file
with open('sessf_links.csv', 'r') as infile, open('link_explanations.csv', 'w', newline='') as outfile:
    reader = csv.reader(infile)
    writer = csv.writer(outfile, quoting=csv.QUOTE_ALL)
    
    # Write header
    writer.writerow(['Explanation'])
    
    # Skip header row
    next(reader)
    
    # Write each explanation
    for row in reader:
        if len(row) >= 6:  # Make sure we have enough columns
            writer.writerow([row[5]])  # The explanation is in the 6th column (index 5) 