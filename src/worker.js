import config from './config'

class Bucket {
    constructor(ri, rf, gi, gf, bi, bf) {
        this.Ri = ri;
        this.Rf = rf;
        this.Gi = gi;
        this.Gf = gf;
        this.Bi = bi;
        this.Bf = bf;
        this.pixels = [];
    }
}

self.addEventListener('message', function(e) {
    console.log(e);
    let result = calculateEverything(e.data.image_data, e.data.image_data.data.length / 4);
    console.log(e.data.image_data.length / 4);
    self.postMessage(result); //devolvemos el resultado al componente webWorker
    self.close();
});

function calculateEverything(image_data, total_pixels) {
    let histogram_buckets = [];
    for (let r = 0; r < config.GRID_SIZE; r++) {
        histogram_buckets[r] = [];
        for (let g = 0; g < config.GRID_SIZE; g++) {
            histogram_buckets[r][g] = [];
            for (let b = 0; b < config.GRID_SIZE; b++) {
                let bucket = new Bucket(r * config.STEP_SIZE, (r + 1) * config.STEP_SIZE - 1,
                    g * config.STEP_SIZE, (g + 1) * config.STEP_SIZE - 1,
                    b * config.STEP_SIZE, (b + 1) * config.STEP_SIZE);
                histogram_buckets[r][g][b] = bucket;
            }
        }
    }
    console.log("array 3d para buckets creado");
    //aqui metemos todos los pixeles en sus correspondientes buckets
    console.log("comenzando lectura de imagen");
    readPixels(image_data, histogram_buckets);
    console.log("lectura finalizada");
    console.log("contando puntos por bucket");
    let most_populated = getMostPopulated(histogram_buckets);
    console.log("calculando media de los más representativos");
    let average_colors = calculateAverageColors(histogram_buckets, most_populated, total_pixels);
    console.log("media calculada");
    return (average_colors);
}

function readPixels(image_data, histogram_buckets) {
    let vector;
    let step_size = config.STEP_SIZE;

    image_data.data.map((e, index) => {
        //el imageData de un canvas contiene todos los pixeles consecutivamente en un array de una dimensión.
        //cada pixel ocupa 4 bytes (8 bits por cada canal), uno para R,G,B,Alpha respectivamente.c
        if (index % 4 == 0) { //el R
            vector = { R: 0, G: 0, B: 0 };
            vector.R = e;
        } else if (index % 4 == 1) { //el G
            vector.G = e;
        } else if (index % 4 == 2) { //el B
            vector.B = e;
            let r = Math.floor(vector.R / step_size) >= config.GRID_SIZE ? Math.floor(vector.R / step_size) - 1 : Math.floor(vector.R / step_size);
            let g = Math.floor(vector.G / step_size) >= config.GRID_SIZE ? Math.floor(vector.G / step_size) - 1 : Math.floor(vector.G / step_size);
            let b = Math.floor(vector.B / step_size) >= config.GRID_SIZE ? Math.floor(vector.B / step_size) - 1 : Math.floor(vector.B / step_size);
            histogram_buckets[r][g][b].pixels.push(vector);
        }
    });

}

//devuelve un array con los 10 buckets más poblados de puntos de coordenadas r,g,b
function getMostPopulated(histogram_buckets) {
    let array_most = [];
    for (let r = 0; r < config.GRID_SIZE; r++) {
        for (let g = 0; g < config.GRID_SIZE; g++) {
            for (let b = 0; b < config.GRID_SIZE; b++) {
                array_most.push({ r, g, b, size: histogram_buckets[r][g][b].pixels.length });
            }
        }
    }
    array_most.sort((a, b) => {
        if (a.size > b.size)
            return -1;
        else if (a.size < b.size)
            return 1;
        else
            return 0;
    })
    return array_most.slice(0, 10);
}

function calculateAverageColors(histogram_buckets, array_most, total_pixels) {
    let colors = [];
    array_most.map((e => {
        let average_r = 0;
        let average_g = 0;
        let average_b = 0;
        for (let i = 0; i < e.size; i++) {
            average_r += histogram_buckets[e.r][e.g][e.b].pixels[i].R;
            average_g += histogram_buckets[e.r][e.g][e.b].pixels[i].G;
            average_b += histogram_buckets[e.r][e.g][e.b].pixels[i].B;
        }
        let average_color = { r: Math.floor(average_r / e.size), g: Math.floor(average_g / e.size), b: Math.floor(average_b / e.size), percentage: (e.size / total_pixels * 100).toFixed(2) };
        colors.push(average_color);
    }));
    return colors;
}