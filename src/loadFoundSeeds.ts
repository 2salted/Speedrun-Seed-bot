async function loadFoundSeeds() {
    let foundSeeds = await Bun.file("./foundSeeds.txt").text();
    let seeds = await Bun.file("./seeds.json").json();

    // go line by line
    // 114933465: {"overworld":{"name":"village","x":-464,"z":368,"distance":848},"bastion_remnant":{"name":"bastion_remnant","x":-272,"z":-352,"distance":472},"nether_fortress":{"name":"fortress","x":304,"z":-352,"distance":206}}
    let lines = foundSeeds.split("\n").filter((line) => line.length > 0);
    for (let line of lines) {
        // seeds.json
        // we are going to add the data from the foundSeeds.txt to the seeds.json
        // ["1982374194": {overworld: {name: "village", x: -464, z: 368, distance: 848}, bastion_remnant: {name: "bastion_remnant", x: -272, z: -352, distance: 472}, nether_fortress: {name: "fortress", x: 304, z: -352, distance: 206}}]

        let [seed, data] = line.split(": ");
        if (seeds[seed]) {
            seeds[seed] = { ...seeds[seed], ...JSON.parse(data) };
        } else {
            seeds[seed] = JSON.parse(data);
        }
    }

    let writer = Bun.file("./seeds.json").writer();
    writer.write(JSON.stringify(seeds, null, 4));
    writer.end();
}

await loadFoundSeeds();