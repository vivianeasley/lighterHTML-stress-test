var height = 100;
var width = 100;
var rng1 = noisesOff(Math.random());
var rng2 = noisesOff(Math.random());
// var gen1 = rng1.simplex2(rng1.nextDouble.bind(rng1));
// var gen2 = rng2.simplex2(rng2.nextDouble.bind(rng2));
function noise1(nx, ny) { return rng1.simplex2(nx, ny)/2 + 0.5; }
function noise2(nx, ny) { return rng2.simplex2(nx, ny)/2 + 0.5; }

for (var y = 0; y < height; y++) {
    worldArr[y] = [];
  for (var x = 0; x < width; x++) {
    var nx = x/width - 0.5, ny = y/height - 0.5;
    var e = (1.00 * noise1( 1 * nx,  1 * ny)
           + 0.50 * noise1( 2 * nx,  2 * ny)
           + 0.25 * noise1( 4 * nx,  4 * ny)
           + 0.13 * noise1( 8 * nx,  8 * ny)
           + 0.06 * noise1(16 * nx, 16 * ny)
           + 0.03 * noise1(32 * nx, 32 * ny));
    e /= (1.00+0.50+0.25+0.13+0.06+0.03);
    e = Math.pow(e, 5.00);
    var m = (1.00 * noise2( 1 * nx,  1 * ny)
           + 0.75 * noise2( 2 * nx,  2 * ny)
           + 0.33 * noise2( 4 * nx,  4 * ny)
           + 0.33 * noise2( 8 * nx,  8 * ny)
           + 0.33 * noise2(16 * nx, 16 * ny)
           + 0.50 * noise2(32 * nx, 32 * ny));
    m /= (1.00+0.75+0.33+0.33+0.33+0.50);
    /* draw biome(e, m) at x,y */
    // const noiseVal = noise.simplex2(j/70, i/70);
    const element = baseTileData();
    // const elevation = Math.floor((noiseVal + 1)*10);
    element.elevation = Math.ceil(e*100);// elevation < 4 ? 4 : elevation;
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

    worldArr[y][x] = element;
  }
}