import { updateStatePromise } from "../state/sm";

const dirCoor = {
    "n": {x:0, y:-1},
    "ne": {x:1, y:-1},
    "e": {x:1, y:0},
    "se": {x:1, y:1},
    "s": {x:0, y:1},
    "sw": {x:-1, y:1},
    "w": {x:-1, y:0},
    "nw": {x:-1, y:-1},
}

const dirs = {
    "n": ["nw","n","ne"],
    "ne": ["n","ne","e"],
    "e": ["ne","e","se"],
    "se": ["e","se","s"],
    "s": ["se","s","sw"],
    "sw": ["s","sw","w"],
    "w": ["sw","w","nw"],
    "nw": ["w","nw","n"],
}

const oneSpace = [
    {x:0, y:-1},
    {x:1, y:-1},
    {x:1, y:0},
    {x:1, y:1},
    {x:0, y:1},
    {x:-1, y:1},
    {x:-1, y:0},
    {x:-1, y:-1},
]

const shift = {
    "n": ["nw","ne"],
    "ne": ["n","e"],
    "e": ["ne","se"],
    "se": ["e","s"],
    "s": ["se","sw"],
    "sw": ["s","w"],
    "w": ["sw","nw"],
    "nw": ["w","n"],
}

export async function move (state) {

    const { character, worldData } = state;
    const { posX, posY, direction } = character;

    let onABoat = state.character.onABoat;
    let goDir = getDirection(direction, posX, posY, worldData);
    let newX = posX + dirCoor[goDir].x;
    let newY = posY + dirCoor[goDir].y;

    const currentElevation = await getElevationPromise(newX,newY, state.character.rng1, state.character.rng2, state.worldData);

    if (!onABoat && Math.ceil(currentElevation*100) === 1 && Math.ceil(state.character.elevation*100) !== 1) {
        if (Math.random() > 0.80) {
            onABoat = true;
            console.log("you find passage on a boat, fashion a raft, steal a boat, etc")
        } else {
            // Not totally working
            console.log("A body of water forces you to change direction")
            const landDir = [];
            for (let j = 1; j < oneSpace.length; j++) {
                const tilElev = await getElevationPromise(oneSpace[j].x,oneSpace[j].y, state.character.rng1, state.character.rng2, state.worldData);
                if (Math.ceil(tilElev*100) > 1) {
                    landDir.push(oneSpace[j]);
                }
            }

            const randomSpace = landDir[Math.floor(Math.random() * landDir.length)];
            console.log(randomSpace)
            newX = posX + randomSpace.x;
            newY = posY + randomSpace.y;
            goDir = shift[goDir][Math.floor(Math.random() * shift[goDir].length)];
        }
    }

    if (newX < 0) {
        newX = 0;
        goDir = "se";
    }
    if (newY < 0) {
        newY = 0;
        goDir = "se";
    }

    if (onABoat) {
        const newElev = await getElevationPromise(newX,newY, state.character.rng1, state.character.rng2, state.worldData);
        console.log(Math.ceil(newElev*100))
        if (Math.ceil(newElev*100) > 1) {
            onABoat = false;
            console.log("You get out of the boat")
        }
    }

    await updateStatePromise((state)=>{
        state.character.elevation = getElevation(newX,newY, state.character.rng1, state.character.rng2, state.worldData);
        state.character.direction = goDir;
        state.character.posX = newX;
        state.character.posY = newY;
        state.character.onABoat = onABoat;
        for (let i = 0; i < oneSpace.length; i++) {
            const x = newX + oneSpace[i].x ;
            const y = newY + oneSpace[i].y ;
            if (!state.worldData[y]) {
                state.worldData[y] = [];
                let iterator = 0;
                while (iterator < x) {
                    state.worldData[y][iterator] = undefined;
                    iterator++;
                }
            }
            if (!state.worldData[y][x]) {
                if (state.worldData[y].length < x) {
                    let iterator = state.worldData[y].length;
                    while (iterator < x) {
                        state.worldData[y][iterator] = undefined;
                        iterator++;
                    }
                }
                const elevation = getElevation(x,y, state.character.rng1, state.character.rng2, state.worldData);
                const tile = getTile(elevation);

                state.worldData[y][x] = tile;
            }

        }

    });



    // await timeout
    // if tile too steep or ocean or lake etc return to previous and change direction

}


// check chance to change direction 10% chance you will do so
// use dirs to see what that direction is
// check if that direction elevation change is too much
// if ocean or lake 5% chance you will swim. If river 50% chance you will try to ford. If already in water ignore
// If you are blocked see if other dirs are blocked
// If all dirs are block look at all possible options and then go the only open direction



function getDirection (direction, x, y, worldData) {
    let dirArr = dirs[direction];
    let dir = direction;
    if (Math.random() > 0.8) {
        dir = dirArr[Math.floor(Math.random() * dirArr.length)];
    }

    if (!validateNewCoor(dir, x, y, worldData)) { // TODO: make work
        let tempDirArr = dirArr;
        let i = 0;
        while (i < 5) {
            if (tempDirArr[i] === undefined) {
                if (validateNewCoor(tempDirArr[i], x, y, worldData)) {
                    dir = tempDirArr[i];
                    break;
                }
            } else {
                tempDirArr = dirs[direction[i-1]];
                i = 0;
            }
        }
    }

    return dir;
}

async function validateNewCoor (direction, x, y, worldData) {
    const newX = x + dirCoor[direction].x;
    const newY = y + dirCoor[direction].y;
    if (worldData && worldData[newY] && worldData[newY][newX]) {
        return true;
    };
    return false;
}


//// World gen ////

export function getElevationPromise (x,y, rng1, rng2, worldArr) {
    return new Promise((resolve, reject) => {
        try {
            const elev = getElevation(x,y, rng1, rng2, worldArr)
            resolve(elev);
        } catch (err) {
            reject(err);
        }
    })
}

function getElevation (x,y, rng1, rng2, worldArr) {

    function noise1(nx, ny) { return rng1.simplex2(nx, ny)/2 + 0.5; }
    function noise2(nx, ny) { return rng2.simplex2(nx, ny)/2 + 0.5; }
    if (!worldArr[y]) worldArr[y] = [];
    let nx = x/100 - 0.5, ny = y/100 - 0.5;
    let elev = (1.00 * noise1( 1 * nx,  1 * ny)
        + 0.50 * noise1( 2 * nx,  2 * ny)
        + 0.25 * noise1( 4 * nx,  4 * ny)
        + 0.13 * noise1( 8 * nx,  8 * ny)
        + 0.06 * noise1(16 * nx, 16 * ny)
        + 0.03 * noise1(32 * nx, 32 * ny));
    elev /= (1.00+0.50+0.25+0.13+0.06+0.03);
    elev = Math.pow(elev, 5.00);
    let m = (1.00 * noise2( 1 * nx,  1 * ny)
        + 0.75 * noise2( 2 * nx,  2 * ny)
        + 0.33 * noise2( 4 * nx,  4 * ny)
        + 0.33 * noise2( 8 * nx,  8 * ny)
        + 0.33 * noise2(16 * nx, 16 * ny)
        + 0.50 * noise2(32 * nx, 32 * ny));
    m /= (1.00+0.75+0.33+0.33+0.33+0.50);

    return elev;
}

export function getTile (elev) {
    const element = baseTileData();
    element.elevation = Math.ceil(elev*100);
    if (element.elevation === 1) {
        element.biome = "water";
    } else if (element.elevation < 4) {
        element.biome = "plains"; // 2 marshland/beaches/swamps/prairie
    } else if (element.elevation < 12) {
        element.biome = "forests";
    } else {
        element.biome = "mountains";
    }
    element.area = getArea();
    element.structure = getStructure(element.area)

    return element;
}

export function baseTileData () {
    return {
        travelLine: undefined, // e--w -> have angles se--nw
        dayArrived: undefined,
        daysVisited: undefined,
        biome: undefined, // plains/desert (yellow 1-4), mountains (brown 10-20), forests (green 1-17), water (blue 1-20), swamp (black 1-4)
        subBiome: undefined,
        elevation: undefined, // 1-20 --- snow above 15 --- ocean at 1
        people: [],
        animals: [],
        monsters: [],
        items: [],
        structure: undefined, // empty/hovel/home/farm/cave/inn/business/temple/fortress/castle
        area: undefined, // empty/village/town/ruins/city
    }
}

const common = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,6,7,7,7,7,7,7,8,8,8,8,8,9,9,9,10];


function getWeightedRandom (array) {
    const value = common[Math.floor(Math.random() * common.length)];
    const incr = 10/array.length;

    const result = Math.ceil(value/incr)
    return array[result]
}

function getSubBiome (elevation) {
    let biomeOptions;
    // plains  - grasslands, marsh, swamp, desert, beach
    // forrest - dense, sparse, dark, etc
    // mountains - granite, dirt, glacial, etc
    // water - water
}

function getStructure (area) {
    let structureOptions;
    if (area === "empty") {
        structureOptions = ["empty","empty","empty","hovel","home","farm","inn","temple","cave","fortress"];
    } else if (area === "village") {
        structureOptions = ["hovel","hovels","home","homes","farm","farm","farm","farm","inn","shrine"];
    } else if (area === "town") {
        structureOptions = ["hovel","home","homes","homes","inn","inns","business","businesses","businesses","temple"];
    } else if (area === "ruins")  {
        structureOptions = ["earthworks","earthworks","earthworks","earthworks","earthworks","carved stone","crumbling stone walls","cave","catacombs","ruined temple"];
    } else {
        structureOptions = ["homes","homes","inns","inns","inns","businesses","businesses","temples","mansions","castle"];
    }

    const structure = getWeightedRandom(structureOptions);
    return structure;
}

function getArea () {
    const areaArr = ["empty","empty","empty","empty","empty","empty","village","town","ruins","city"];
    const area = getWeightedRandom(areaArr);

    return area;
}

function getLandMarks () {
    //  spring, creek, stream, river, tor, chasm, cave
}