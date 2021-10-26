install:
	npm install
publish:
	npm publish --dry-run
lint:
	npx eslint .
lintFix:
	npx eslint . --fix
test:
	npx -n --experimental-vm-modules jest --watch
test-win:
	npx jest
test-coverage:
	npm test -s -- --coverage
link:
	npm link