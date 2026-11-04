import js from "@eslint/js";
import globals from "globals";

export default [
	{
		// Third-party library (blueimp JavaScript-MD5) -- not our code
		ignores: ["public/js/md5.js", "node_modules/**"]
	},
	js.configs.recommended,
	{
		files: ["public/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "script",
			globals: {
				...globals.browser,
				md5: "readonly"
			}
		},
		rules: {
			eqeqeq: "error",
			"no-var": "error",
			"prefer-const": "error",
			semi: ["error", "always"],
			"no-unused-vars": "error"
		}
	},
	{
		files: ["tests/**/*.js"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "commonjs",
			globals: {
				...globals.node,
				...globals.jest
			}
		},
		rules: {
			eqeqeq: "error",
			"no-var": "error",
			"prefer-const": "error",
			semi: ["error", "always"]
		}
	},
	{
		// Unit tests load public/js/code.js into jsdom, which defines these globals
		files: ["tests/unit/**/*.js"],
		languageOptions: {
			globals: {
				...globals.browser,
				md5: "readonly",
				validateColor: "readonly",
				formatColorList: "readonly",
				addColor: "readonly",
				searchColor: "readonly",
				doLogin: "readonly"
			}
		}
	}
];
