import fs from "fs";

fs.readFile("foundSeeds.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  const lines = data.trim().split("\n");


  const seeds = JSON.parse(fs.readFileSync("seeds.json").toString());
  
  let word = null;
  lines.forEach(line => {
      // Trim the line
      line = line.trim();

      if (!word) {
          // If word is null, this is a new word
          word = line;
      } else if (!isNaN(line)) {
          // If the line is a number, assign it to the current word
          seeds[line] = word;
      } else {
          // If line is not a number, reset the word to the new word
          word = line;
      }
  });

  // Write the data to seeds.json
  fs.writeFile('seeds.json', JSON.stringify(seeds, null, 2), 'utf8', err => {
      if (err) {
          console.error('Error writing to file:', err);
          return;
      }
      console.log('Data has been written to seeds.json');
  });
});