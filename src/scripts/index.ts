
import { createWorldData, character } from './modules/data/world';
import { initState } from "./modules/state/sm";

const MAPS_NUMBER = 10;

window.onload = () => {
    startWorld();
}

async function startWorld () {
    const state = {
        worldData: [],
        character: character
    }

    for (let index = 0; index < MAPS_NUMBER; index++) {
        const world = await createWorldData();
        state.worldData.push(world);
    }

    initState(state);
}
