import { getElevationPromise, getTile } from "../data-methods/general"
import { noisesOff } from "../noise";
import { updateStatePromise } from "../state/sm";

export const character = {
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

export async function updateWorldData (state) {
    const updatedWorld = [];
    const seed1 = Math.random();
    const seed2 = Math.random();

    const rng1 = noisesOff(seed1);
    const rng2 = noisesOff(seed2);

    for (let i = 0; i < 100; i++) {
        updatedWorld[i] = [];
        for (let j = 0; j < 100; j++) {
            const elevation = await getElevationPromise(j,i, rng1, rng2, updatedWorld);
            const tile = getTile(elevation);
            updatedWorld[i][j] = tile;
        }
    }

    await updateStatePromise((state)=>{
        state.worldData = updatedWorld;
    });
}