import setup from "./canvas.js";

// const shader = Math.floor(Math.random() * 12);

// setup(shader);

const randomSeed = () => {
	const types = ['w', 's', 'f', 'n', 'l']; // warp, soft, fuse, neon, flow
	const type = types[Math.floor(Math.random() * types.length)];
	const variation = Math.floor(Math.random() * 5) + 1;
	const opts = Array.from({ length: 3 }, () => 
		Math.floor(Math.random() * 16).toString(16)
	).join('');
	return `${type}${variation}${opts}`;
};

const parseSeed = (inputSeed) => {
	const seed = typeof inputSeed !== 'string' || inputSeed.length !== 5 ? randomSeed() : inputSeed;
	
	// Parse shader type and variation
	const type = seed[0];
	const variation = Number.parseInt(seed[1]);
	
	// Map type to shader ID
	const typeMap = {
		'w': 0,  // warp
		's': 2,  // soft
		'f': 7,  // fuse
		'n': 10, // neon
		'l': 12  // flow
	};
	
	// const shaderId = typeMap[type] + variation - 1;
	const shaderId = Math.floor(Math.random() * 12);
	
	// Parse hex options
	const shaderOpts = Array.from(seed.slice(2)).map(c => 
		Number.parseInt(c, 16) / 15.0  // Convert hex to 0-1 range
	);
	
	return { shaderId, shaderOpts };
};

export default (selector = "body", seed = randomSeed()) => {
	const targetElement = document.querySelector(selector) ?? document.body;
	const canvas =
		targetElement.tagName === "CANVAS"
			? targetElement
			: targetElement.appendChild(document.createElement("canvas"));

	const { shaderId, shaderOpts } = parseSeed(seed);
	console.log("SETUP", { seed, shaderId}, shaderOpts);
	return setup(canvas, shaderId, shaderOpts);
};

	// const canvas = host.querySelector('canvas');
	// console.log("CANVAS", canvas);
// return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
