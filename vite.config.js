import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Statyczny build — działa na każdym hostingu (np. jako podstrona photodev.pl).
			adapter: adapter({ fallback: '404.html' })
		})
	],
	test: {
		include: ['src/**/*.test.js']
	}
});
