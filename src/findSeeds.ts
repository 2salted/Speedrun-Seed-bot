import type { Subprocess } from "bun";

const DEFAULT_DISTANCE = 200;
const SERVER_PROP_PATH = "minecraft/server.properties";
const MC_WORLD_PATH = "minecraft/world";

const OVERWORLD_STRUCTURES: Record<string, number> = {
    "village": 170,
    "desert_pyramid": 80,
    "shipwreck": 96,
    "ruined_portal": 50,
    "buried_treasure": 80,
}
const BASTIAN_REMNANT: Record<string, number> = {
    "bastion_remnant": 240,
}
const NETHER_FORTRESS: Record<string, number> = {
    "fortress": 270,
}

async function findStructure(mc: Subprocess<"pipe", "pipe", "inherit">,
    reader: ReadableStreamDefaultReader<Uint8Array>,
    structureOptions: Record<string, number>,
    dimension: string,
    fromLocation: number[] | undefined): Promise<StructureResult | undefined> {

    for (let [structure, minDist] of Object.entries(structureOptions)) {
        mc.stdin.write(`/execute in minecraft:${dimension} run locate ${structure}\n`);
        Bun.sleep(10);
        let text = new TextDecoder().decode((await reader.read()).value);
        Bun.sleep(10);
        console.log(`text`, text);
        // [06:29:12] [Server thread/INFO]: The nearest village is at [-160, ~, -336] (102 blocks away)
        let match = text.match(/The nearest (\w+) is at \[(-?\d+), ~, (-?\d+)\] \((\d+) blocks away\)/);
        // if blocks away number is less than the distance we are looking for
        console.log(`match`, match);
        if (match) {
            let distance = fromLocation ? Math.sqrt(Math.pow(parseInt(match[2]) - fromLocation[0], 2) + Math.pow(parseInt(match[3]) - fromLocation[1], 2)) : parseInt(match[4]);
            if (distance <= minDist) {
                return {
                    name: structure,
                    x: parseInt(match[2]),
                    z: parseInt(match[3]),
                    distance: distance
                }
            }
        }
    }
    return undefined;
}

type StructureResult = {
    name: string,
    x: number,
    z: number,
    distance: number
}

type SeedResult = {
    overworld: StructureResult,
    bastion_remnant: StructureResult,
    nether_fortress: StructureResult
}

async function testSeed(seed: string): Promise<SeedResult | undefined> {
    await setSeed(seed);
    // java -Xms1G -Xmx2G -jar server.jar nogui
    const mc = Bun.spawn(
        ["java", "-Xms1G", "-Xmx2G", "-jar", "server.jar", "nogui"],
        { cwd: "./minecraft", stdin: "pipe" }
    );

    let reader = mc.stdout.getReader();

    while (true) {
        let text = new TextDecoder().decode((await reader.read()).value);
        console.log(`text`, text);
        if (text.includes("thread/INFO]: Done")) {
            break;
        }
    }

    // overworld
    let overworld = await findStructure(mc, reader, OVERWORLD_STRUCTURES, "overworld", undefined);
    if (!overworld) {
        mc.kill();
        return undefined;
    }

    // bastian remnant
    let bastion_remnant = await findStructure(mc, reader, BASTIAN_REMNANT, "the_nether", undefined);
    if (!bastion_remnant) {
        mc.kill();
        return undefined;
    }

    let nether_fortress = await findStructure(mc, reader, NETHER_FORTRESS, "the_nether", [bastion_remnant.x, bastion_remnant.z]);
    if (!nether_fortress) {
        mc.kill();
        return undefined;
    }
    console.log(`overworld: ${overworld.name} at ${overworld.x}, ${overworld.z} (${overworld.distance} blocks away)`);
    console.log(`bastion remnant: ${bastion_remnant.name} at ${bastion_remnant.x}, ${bastion_remnant.z} (${bastion_remnant.distance} blocks away)`);
    console.log(`nether fortress: ${nether_fortress.name} at ${nether_fortress.x}, ${nether_fortress.z} (${nether_fortress.distance} blocks away)`);
    Bun.sleep(10);

    mc.kill();
    return {
        overworld,
        bastion_remnant,
        nether_fortress,
    }
}


async function setSeed(seed: string) {
    let serverProperties = await Bun.file(SERVER_PROP_PATH).text();
    let writer = Bun.file(SERVER_PROP_PATH).writer();
    serverProperties = serverProperties.replace(/level-seed=.*/, `level-seed=${seed}`);
    writer.write(serverProperties);
    writer.end();

    // delete the world folder
    await Bun.$`sudo rm -rf ${MC_WORLD_PATH}`;

    console.log(`Set seed to ${seed}`);
    Bun.sleep(10);
}

async function findSeeds() {
    let allSeeds = await Bun.file("foundSeeds.txt");
    let writer = allSeeds.writer()
    while (true) {
        let seed = Math.floor(Math.random() * 1000000000000000).toString();
        let res = await testSeed(seed);
        if (res) {
            writer.write(`${seed}: ${JSON.stringify(res)}\n`);
            writer.flush();
        }
    }
}

await findSeeds();