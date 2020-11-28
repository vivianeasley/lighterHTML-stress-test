import { getElevationPromise, getTile } from "../data-methods/general"
import { noisesOff } from "../noise";
import { updateStatePromise } from "../state/sm";

export const character = {
    map: 0,
    renown: 0,
    currentDay: 1, // day 10 hook/quest/etc.
    posX: 3,
    posY: 3,
    direction: "se",
    elevation: undefined,
}

export async function getWorldData (charState) {
    const worldArr = [];

    for (let i = 0; i < 100; i++) {
        worldArr[i] = [];
        for (let j = 0; j < 100; j++) {
            const elevation = await getElevationPromise(j,i, charState.rng1, charState.rng2, worldArr);
            if (charState.posX === j && charState.posY === i) {
                if (Math.ceil(elevation*100) === 1) {
                    charState.onABoat = true;
                    console.log("You are on a boat or clinging to wreckage")
                }
            }
            const tile = getTile(elevation);
            worldArr[i][j] = tile;
        }
    }

    return worldArr;
}

export async function createWorldData () {
    const wholeNewWorld = [];
    const seed1 = Math.random();
    const seed2 = Math.random();

    const rng1 = noisesOff(seed1);
    const rng2 = noisesOff(seed2);

    for (let i = 0; i < 100; i++) {
        wholeNewWorld[i] = [];
        for (let j = 0; j < 100; j++) {
            const elevation = await getElevationPromise(j,i, rng1, rng2, wholeNewWorld);
            const tile = getTile(elevation);
            wholeNewWorld[i][j] = tile;
        }
    }

    return wholeNewWorld;

}

export async function updateWorldData () {
    await updateStatePromise((state)=>{
        let value = state.character.map;
        if (value === 9) {
            value = 0;
        } else {
            value++;
        }
        state.character.map = value;
    });
}