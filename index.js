import setup from "./canvas.js";

// const shader = Math.floor(Math.random() * 12);

// setup(shader);

const randomSeed = () => {
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
	return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const parseSeed = (inputSeed) => {
	const seed = typeof inputSeed !== 'string' || inputSeed.length !== 4 ? randomSeed() : inputSeed;
	const shaderId = Number.parseInt(seed[0], 36);
	const shaderOpts = Array.from(seed.slice(1)).map(c => Number.parseInt(c, 36));
	return { shaderId, shaderOpts };
};

export default (selector = "body", seed = randomSeed()) => {
	const targetElement = document.querySelector(selector) ?? document.body;
	const canvas =
		targetElement.tagName === "CANVAS"
			? targetElement
			: targetElement.appendChild(document.createElement("canvas"));

	const { shaderId, shaderOpts } = parseSeed(seed);
	return setup(canvas, shaderId, shaderOpts);
};

	// const canvas = host.querySelector('canvas');
	// console.log("CANVAS", canvas);
// return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
